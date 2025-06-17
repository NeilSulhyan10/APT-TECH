// app/expert/dashboard/page.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/authContext'; // Your AuthContext hook
import { db } from '@/config/firebase'; // Your Firebase client SDK instance
import { doc, getDoc, collection, query, where, getDocs, Timestamp, orderBy } from 'firebase/firestore'; // Import Firestore methods

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, User, BookOpen, DollarSign, Calendar, Star, MessageSquareText, Edit, Plus } from 'lucide-react'; // Icons for dashboard
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge"; // Ensure Badge is imported for tags
import Link from 'next/link';


// Define interfaces for data structures
interface ExpertProfile {
  uid: string; // Corresponds to Firebase Auth UID
  name: string; // Full name
  role: string; // e.g., "Aptitude Expert", "Coding Interviewer"
  experience: string; // e.g., "5+ Years", "Fresh Graduate"
  description: string; // Short tagline/intro
  bio: string; // Longer, detailed biography
  tags: string[]; // Array of expertise tags
  initials: string; // Derived from name
  color: string; // Hex color for avatar background or theme
  rating?: number; // Average rating (could be aggregated or manually set)
  students?: number; // Number of students helped
  sessions?: number; // Number of sessions conducted
  resources?: number; // Number of resources shared
  profileCreated: boolean; // Flag to indicate if basic profile exists
}

interface Testimonial {
  id: string;
  expertId: string;
  studentName: string;
  college?: string;
  text: string;
  rating: number;
  date: Timestamp; // Store as Timestamp
  initials?: string;
  studentAvatarUrl?: string;
}

// Predefined colors for expert avatars
const expertColors = [
  '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3',
  '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39',
  '#FFEB3B', '#FFC107', '#FF9800', '#FF5722', '#795548', '#9E9E9E',
  '#607D8B',
];

export default function ExpertDashboardPage() {
  const { user, userData, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [loadingContent, setLoadingContent] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [expertProfile, setExpertProfile] = useState<ExpertProfile | null>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);


  // --- Authorization and Initial Data Check & Fetch ---
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        console.warn("Unauthenticated access attempt to expert dashboard. Redirecting to login.");
        router.push('/login');
        return;
      }

      const isExpertUser = userData?.role === 'expert';
      const isApprovedExpert = userData?.isExpertApproved === true;

      if (!isExpertUser) {
        console.warn("Non-expert user attempt to access expert dashboard. Redirecting to home.");
        setError("Access Denied: You do not have expert privileges.");
        router.push('/');
        return;
      }

      if (!isApprovedExpert) {
        console.warn("Unapproved expert attempt to access expert dashboard. Redirecting to pending approval.");
        setError("Your expert application is still pending approval.");
        router.push('/expert/pending-approval');
        return;
      }

      // If expert and approved, fetch their specific profile and testimonials
      const fetchExpertAndTestimonials = async () => {
        setLoadingContent(true);
        setError(null);
        try {
          const expertUid = user?.uid;
          if (!expertUid) {
            setError("Expert UID not available.");
            setLoadingContent(false);
            return;
          }

          // Fetch expert profile from 'experts' collection
          const expertDocRef = doc(db, "experts", expertUid);
          const expertDocSnap = await getDoc(expertDocRef);

          let fetchedExpertData: ExpertProfile;
          if (expertDocSnap.exists()) {
            const dataFromFirestore = expertDocSnap.data();
            // Ensure tags is always an array, even if missing from Firestore document
            fetchedExpertData = {
              ...(dataFromFirestore as ExpertProfile),
              tags: (dataFromFirestore.tags || []) as string[],
            };
            setExpertProfile(fetchedExpertData);
          } else {
            // If expert profile doesn't exist, create a default one based on userData
            console.warn("Expert profile not found in 'experts' collection. Initializing new profile.");
            fetchedExpertData = {
              uid: expertUid,
              name: `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim() || 'New Expert',
              role: userData?.expertise || 'General Expert', // Use expertise from userData if available
              experience: 'Not set',
              description: 'Passionate about helping students succeed.',
              bio: 'A detailed biography coming soon!',
              tags: [], // Ensure this is an empty array
              initials: ((userData?.firstName?.[0] || '') + (userData?.lastName?.[0] || '')).toUpperCase() || 'NE',
              color: expertColors[Math.floor(Math.random() * expertColors.length)], // Assign a random color
              rating: 0,
              students: 0,
              sessions: 0,
              resources: 0,
              profileCreated: false, // Mark as not yet fully created
            };
            // Set this initial profile, but don't save to Firestore yet, wait for user to edit/confirm
            setExpertProfile(fetchedExpertData);
          }

          // Fetch testimonials for this expert
          const testimonialsQuery = query(
            collection(db, "testimonials"),
            where("expertId", "==", expertUid),
            orderBy("date", "desc") // Order by newest testimonials first
          );
          const testimonialSnapshot = await getDocs(testimonialsQuery);
          const fetchedTestimonials: Testimonial[] = testimonialSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data() as Omit<Testimonial, 'id'>, // Cast to Testimonial, Omit 'id' since it's from doc.id
          }));
          setTestimonials(fetchedTestimonials);

        } catch (err: any) {
          console.error("Error fetching expert profile or testimonials:", err);
          setError(`Failed to load dashboard data: ${err.message || "Unknown error."}`);
        } finally {
          setLoadingContent(false);
        }
      };

      fetchExpertAndTestimonials();
    }
  }, [authLoading, isAuthenticated, user?.uid, userData, router]);


  // --- Render Loading State (Auth or initial content) ---
  if (authLoading || loadingContent) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8 px-4">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        <p className="text-lg">Loading Expert Dashboard...</p>
      </div>
    );
  }

  // --- Render Access Denied/Error State (after auth loading) ---
  const isExpertUser = userData?.role === 'expert';
  const isApprovedExpert = userData?.isExpertApproved === true;

  if (error || !isExpertUser || !isApprovedExpert) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8 px-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-red-500">{error || "You do not have the necessary privileges to view this page."}</p>
            <Button onClick={() => router.push('/')} className="w-full mt-4">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- Main Expert Dashboard Content ---
  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
        <User className="h-8 w-8 text-primary" /> Expert Dashboard
      </h1>

      {expertProfile?.profileCreated === false && (
        <div className="bg-yellow-100 dark:bg-yellow-900 border-l-4 border-yellow-500 text-yellow-800 dark:text-yellow-200 p-4 mb-6 rounded-md shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center">
            <Star className="h-6 w-6 mr-3 text-yellow-600 dark:text-yellow-400" />
            <div>
              <h3 className="font-semibold text-lg">Your Expert Profile is Incomplete!</h3>
              <p className="text-sm">Please complete your profile to unlock all features and appear in expert listings.</p>
            </div>
          </div>
          <Link href="/expert/profile/edit" passHref>
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-white flex-shrink-0 w-full md:w-auto">
              <Edit className="mr-2 h-4 w-4" /> Complete My Profile
            </Button>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Welcome Card */}
        <Card className="md:col-span-2 lg:col-span-3 bg-gradient-to-r from-primary to-blue-500 text-primary-foreground">
          <CardHeader>
            <CardTitle className="text-4xl font-extrabold">
              Welcome, {expertProfile?.name || userData?.firstName || 'Expert'}!
            </CardTitle>
            <CardDescription className="text-lg text-primary-foreground/90">
              Your hub for managing your expert services.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-medium">{userData?.email}</p>
          </CardContent>
        </Card>

        {/* Profile Overview Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <User className="h-5 w-5" /> My Profile
            </CardTitle>
            <CardDescription>View and manage your expert details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {expertProfile?.profileCreated === false ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-3">
                  Your expert profile is not fully set up yet.
                </p>
                <Link href="/experts/profile/edit" passHref>
                  <Button className="w-full">
                    <Plus className="mr-2 h-4 w-4" /> Create My Profile
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback style={{ backgroundColor: expertProfile?.color || '#9E9E9E' }} className="text-white text-2xl font-bold">
                      {expertProfile?.initials || 'ME'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-lg font-semibold">{expertProfile?.name}</p>
                    <p className="text-sm text-muted-foreground">{expertProfile?.role || 'Expert'}</p>
                  </div>
                </div>
                <p className="text-sm">
                  <span className="font-semibold">Experience:</span> {expertProfile?.experience || 'Not set'}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Description:</span> {expertProfile?.description || 'Not provided'}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Bio:</span> {expertProfile?.bio || 'Not provided'}
                </p>
                {expertProfile?.tags && expertProfile.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="font-semibold text-sm">Skills:</span>
                    {expertProfile.tags.map((tag, i) => (
                      <Badge key={i} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                )}
                <Link href="/experts/profile/view" passHref> {/* Link to view page */}
                  <Button className="w-full mt-4">
                    <User className="mr-2 h-4 w-4" /> View Profile
                  </Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>

        {/* My Testimonials Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Star className="h-5 w-5" /> My Testimonials
            </CardTitle>
            <CardDescription>Feedback from students about your services.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-h-96 overflow-y-auto pr-2"> {/* Added max-height and overflow */}
            {testimonials.length > 0 ? (
              testimonials.map((testimonial) => (
                <div key={testimonial.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                  <p className="text-sm italic text-muted-foreground">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center mt-2">
                    <Avatar className="w-8 h-8 mr-2">
                      <AvatarFallback className="bg-gray-200 text-gray-700 text-sm">
                        {testimonial.initials || testimonial.studentName?.charAt(0).toUpperCase() || ''}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{testimonial.studentName}</span>
                    {testimonial.college && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({testimonial.college})
                      </span>
                    )}
                    <span className="ml-auto text-amber-500 text-sm">
                      {"⭐".repeat(testimonial.rating)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">No testimonials yet.</p>
            )}
          </CardContent>
        </Card>


        {/* Placeholder cards for other features */}
        {/* Availability Management Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Calendar className="h-5 w-5" /> Manage Availability
            </CardTitle>
            <CardDescription>Set your consultation hours and breaks.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Update your calendar to reflect when you are available for consultations.
            </p>
            <Button className="w-full" onClick={() => router.push('/expert/availability')}>
              Update Schedule
            </Button>
          </CardContent>
        </Card>

        {/* Earnings & Payouts Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <DollarSign className="h-5 w-5" /> Earnings & Payouts
            </CardTitle>
            <CardDescription>Track your earnings and payout history.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold mb-2">
              $0.00 <span className="text-sm text-muted-foreground">Total Earnings (Placeholder)</span>
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Detailed breakdown of your earnings and payout schedule.
            </p>
            <Button className="w-full" onClick={() => router.push('/expert/earnings')}>
              View Earnings
            </Button>
          </CardContent>
        </Card>

        {/* Consultations & Reviews Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <BookOpen className="h-5 w-5" /> Consultations & Reviews
            </CardTitle>
            <CardDescription>View past consultations and client feedback.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold mb-2">
              <Star className="inline-block h-6 w-6 text-yellow-400 mr-1" /> {expertProfile?.rating?.toFixed(1) || '0.0'} <span className="text-sm text-muted-foreground">({testimonials.length} reviews)</span>
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              See what clients are saying about your advice.
            </p>
            <Button className="w-full" onClick={() => router.push('/expert/reviews')}>
              View Reviews
            </Button>
          </CardContent>
        </Card>

        {/* Help & Support Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <MessageSquareText className="h-5 w-5" /> Help & Support
            </CardTitle>
            <CardDescription>Get assistance or report an issue.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Contact our support team for any questions or issues.
            </p>
            <Button className="w-full" onClick={() => router.push('/expert/support')}>
              Get Support
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
