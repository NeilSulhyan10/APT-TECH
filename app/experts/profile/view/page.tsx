// app/expert/profile/view/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/authContext'; // Your AuthContext hook
import { db } from '@/config/firebase'; // Your Firebase client SDK instance
import { doc, getDoc, collection, query, where, getDocs, Timestamp, orderBy } from 'firebase/firestore';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, User, ArrowLeft, Edit, Star, BookOpen, Users, Award, Briefcase, GraduationCap } from 'lucide-react'; // Added more icons for stats
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { cn } from '@/lib/utils'; // For conditional class merging

// Define interfaces for data structures
interface ExpertProfile {
  uid: string;
  name: string;
  role: string;
  experience: string;
  description: string;
  bio: string;
  tags: string[];
  initials: string;
  color: string;
  rating?: number;
  students?: number;
  sessions?: number;
  resources?: number;
  profileCreated: boolean;
}

interface Testimonial {
  id: string;
  expertId: string;
  studentName: string;
  college?: string;
  text: string;
  rating: number;
  date: Timestamp;
  initials?: string;
  studentAvatarUrl?: string;
}

export default function ExpertProfileViewPage() {
  const { user, userData, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [loadingPage, setLoadingPage] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [expertProfile, setExpertProfile] = useState<ExpertProfile | null>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        console.warn("Unauthenticated access attempt to expert profile view. Redirecting to login.");
        router.push('/login');
        return;
      }

      const isExpertUser = userData?.role === 'expert';
      const isApprovedExpert = userData?.isExpertApproved === true;

      if (!isExpertUser || !isApprovedExpert) {
        console.warn("Non-expert or unapproved expert attempt to access profile view. Redirecting to dashboard.");
        setError("Access Denied: You do not have expert privileges or your account is not approved.");
        router.push('/experts/dashboard');
        return;
      }

      const fetchExpertDataAndTestimonials = async () => {
        setLoadingPage(true);
        setError(null);
        try {
          const expertUid = user?.uid;
          if (!expertUid) {
            setError("Expert UID not available. Cannot load profile.");
            setLoadingPage(false);
            return;
          }

          // Fetch expert profile
          const expertDocRef = doc(db, "experts", expertUid);
          const expertDocSnap = await getDoc(expertDocRef);

          if (expertDocSnap.exists()) {
            const dataFromFirestore = expertDocSnap.data();
            setExpertProfile({
              ...(dataFromFirestore as ExpertProfile),
              tags: (dataFromFirestore.tags || []) as string[],
            });
          } else {
            console.warn("Expert profile not found in 'experts' collection for UID:", expertUid);
            // If profile doesn't exist, redirect to edit page to create it
            router.replace('/experts/profile/edit');
            return; // Stop execution here
          }

          // Fetch testimonials for this expert
          const testimonialsQuery = query(
            collection(db, "testimonials"),
            where("expertId", "==", expertUid),
            orderBy("date", "desc")
          );
          const testimonialSnapshot = await getDocs(testimonialsQuery);
          const fetchedTestimonials: Testimonial[] = testimonialSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data() as Omit<Testimonial, 'id'>,
          }));
          setTestimonials(fetchedTestimonials);

        } catch (err: any) {
          console.error("Error fetching expert profile or testimonials:", err);
          setError(`Failed to load profile: ${err.message || "Unknown error."}`);
        } finally {
          setLoadingPage(false);
        }
      };

      fetchExpertDataAndTestimonials();
    }
  }, [authLoading, isAuthenticated, user?.uid, userData, router]);

  if (loadingPage || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] py-8 px-4">
        <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-lg text-muted-foreground">Loading expert profile...</p>
      </div>
    );
  }

  const isExpertUser = userData?.role === 'expert';
  const isApprovedExpert = userData?.isExpertApproved === true;

  if (error || !isExpertUser || !isApprovedExpert) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] py-8 px-4">
        <Card className="w-full max-w-lg shadow-lg">
          <CardHeader className="bg-red-500 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-center">Access Dencoed</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-center text-red-700 dark:text-red-300 mb-4">{error || "You do not have the necessary privileges to view this page."}</p>
            <Button onClick={() => router.push('/experts/dashboard')} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!expertProfile) {
    // This case should ideally be handled by the router.replace above,
    // but as a fallback, if for some reason we reach here without profile.
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] py-8 px-4">
        <Card className="w-full max-w-lg shadow-lg">
          <CardHeader className="bg-orange-500 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-center">Profile Not Found</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-muted-foreground text-center mb-4">It looks like your expert profile has not been created yet.</p>
            <Link href="/experts/profile/edit" passHref>
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white">Create My Profile</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 md:py-8 md:px-6"> {/* Reduced overall padding */}
      <div className="flex items-center justify-between mb-4 md:mb-6"> {/* Reduced margin */}
        <div className="flex flex-col items-start gap-0.5"> {/* Further reduced gap */}
          <Link href="/experts/dashboard" passHref>
            <Button variant="ghost" className="text-muted-foreground hover:text-primary px-1 py-0.5 h-auto text-xs"> {/* Further adjusted padding and text size */}
              <ArrowLeft className="mr-0.5 h-3 w-3" /> Back to Dashboard {/* Smaller icon */}
            </Button>
          </Link>
          <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-gray-100">My Expert Profile</h1> {/* Smaller text */}
        </div>
        <Link href="/experts/profile/edit" passHref>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all duration-200 hover:scale-105 text-xs py-1.5 px-2.5"> {/* Smaller button */}
            <Edit className="mr-1 h-3.5 w-3.5" /> Edit Profile {/* Smaller icon */}
          </Button>
        </Link>
      </div>

      {expertProfile.profileCreated === false && (
        <div className="bg-yellow-100 dark:bg-yellow-900 border-l-4 border-yellow-500 text-yellow-800 dark:text-yellow-200 p-2.5 mb-4 rounded-lg shadow-md flex flex-col md:flex-row items-center justify-between gap-2.5"> {/* Reduced padding and gap */}
          <div className="flex items-center">
            <Star className="h-4.5 w-4.5 mr-2 text-yellow-600 dark:text-yellow-400" /> {/* Smaller icon */}
            <div>
              <h3 className="font-semibold text-sm md:text-base">Your Expert Profile is Incomplete!</h3> {/* Smaller text */}
              <p className="text-xs md:text-sm">Please complete your profile to unlock all features and appear in expert listings.</p> {/* Smaller text */}
            </div>
          </div>
          <Link href="/experts/profile/edit" passHref>
            <Button className="bg-yellow-600 hover:bg-yellow-700 text-white flex-shrink-0 w-full md:w-auto shadow-sm text-xs py-1.5 px-2.5"> {/* Smaller button */}
              <Edit className="mr-1 h-3.5 w-3.5" /> Complete My Profile {/* Smaller icon */}
            </Button>
          </Link>
        </div>
      )}

      <Card className="w-full max-w-4xl mx-auto p-4 md:p-5 shadow-xl rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"> {/* Reduced padding */}
        <CardHeader className="text-center pt-3 pb-4 border-b border-gray-100 dark:border-gray-700"> {/* Reduced padding */}
          <div className="flex justify-center items-center mb-3"> {/* Reduced margin */}
            <Avatar className="h-24 w-24 md:h-28 md:w-28 shadow-lg border-3 border-white dark:border-gray-900"> {/* Smaller avatar */}
              <AvatarFallback style={{ backgroundColor: expertProfile.color || '#9E9E9E' }} className="text-white text-3xl md:text-4xl font-extrabold flex items-center justify-center"> {/* Smaller text */}
                {expertProfile.initials || 'ME'}
              </AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-0.5"> {/* Smaller text */}
            {expertProfile.name}
          </CardTitle>
          <CardDescription className={`text-base md:text-lg text-gray-700 dark:text-gray-300 font-semibold mb-0.5`}> {/* Smaller text */}
            {expertProfile.role} • {expertProfile.experience}
          </CardDescription>
          <p className="text-xs text-muted-foreground max-w-xl mx-auto"> {/* Smaller text */}
            "{expertProfile.description || 'A dedicated expert passionate about student success.'}"
          </p>
        </CardHeader>
        <CardContent className="space-y-6 px-0 pb-0 pt-5"> {/* Reduced padding and space-y */}

          {/* About Me Section */}
          <div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2.5">About Me</h4> {/* Smaller text */}
            <p className="text-sm text-muted-foreground leading-relaxed">{expertProfile.bio || 'This expert has not yet provided a detailed biography. Check back soon for more information!'}</p> {/* Smaller text */}
          </div>

          {/* Expertise Section */}
          <div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2.5">Expertise</h4> {/* Smaller text */}
            <div className="flex flex-wrap gap-1.5"> {/* Reduced gap */}
              {expertProfile.tags.length > 0 ? (
                expertProfile.tags.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="px-2.5 py-0.5 text-xs font-medium rounded-full shadow-sm"> {/* Smaller padding and text */}
                    {tag}
                  </Badge>
                ))
              ) : (
                <p className="text-muted-foreground text-xs">No expertise tags provided yet. Please add them in your profile settings!</p>      
              )}
            </div>
          </div>

          {/* Testimonials Section */}
          <div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2.5">Student Testimonials ({testimonials.length})</h4> {/* Smaller text */}
            <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar"> {/* Reduced space-y and max-height */}
              {testimonials.length > 0 ? (
                testimonials.map((testimonial) => (
                  <Card key={testimonial.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm border border-gray-100 dark:border-gray-600 hover:shadow-md transition-shadow duration-200"> {/* Reduced padding */}
                    <p className="text-xs italic text-gray-700 dark:text-gray-200 mb-1.5"> {/* Smaller text */}
                      "{testimonial.text}"
                    </p>
                    <div className="flex items-center justify-between mt-1.5">
                      <div className="flex items-center">
                        <Avatar className="w-7 h-7 mr-1.5"> {/* Smaller avatar */}
                          <AvatarFallback className="bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200 text-xs font-semibold"> {/* Smaller text */}
                            {testimonial.initials || testimonial.studentName?.charAt(0).toUpperCase() || ''}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{testimonial.studentName}</span> {/* Smaller text */}
                          {testimonial.college && (
                            <p className="text-[0.6rem] text-muted-foreground"> {/* Even smaller text */}
                              {testimonial.college}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="text-amber-500 text-sm mr-1"> {/* Smaller text */}
                          {"⭐".repeat(testimonial.rating)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({testimonial.rating}/5)
                        </span>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <p className="text-muted-foreground text-xs text-center py-2.5">No testimonials yet. Encourage your students to leave one!</p> 
              )}
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}