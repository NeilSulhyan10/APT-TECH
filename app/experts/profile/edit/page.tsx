// app/expert/profile/edit/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/authContext'; // Your AuthContext hook
import { db } from '@/config/firebase'; // Your Firebase client SDK instance
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore'; // Import Firestore methods

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, User, ArrowLeft } from 'lucide-react'; // Icons
import {
  DialogFooter // Only DialogFooter is used from this set now
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

// Predefined colors for expert avatars
const expertColors = [
  '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3',
  '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39',
  '#FFEB3B', '#FFC107', '#FF9800', '#FF5722', '#795548', '#9E9E9E',
  '#607D8B',
];


export default function ExpertProfileEditPage() {
  const { user, userData, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [loadingPage, setLoadingPage] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editProfileData, setEditProfileData] = useState<ExpertProfile | null>(null);
  const [submittingProfileEdit, setSubmittingProfileEdit] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        console.warn("Unauthenticated access attempt to expert profile edit. Redirecting to login.");
        router.push('/login');
        return;
      }

      const isExpertUser = userData?.role === 'expert';
      const isApprovedExpert = userData?.isExpertApproved === true;

      if (!isExpertUser || !isApprovedExpert) {
        console.warn("Non-expert or unapproved expert attempt to access profile edit. Redirecting to dashboard.");
        setError("Access Denied: You do not have expert privileges or your account is not approved.");
        router.push('/experts/dashboard');
        return;
      }

      const fetchExpertProfile = async () => {
        setLoadingPage(true);
        setError(null);
        try {
          const expertUid = user?.uid;
          if (!expertUid) {
            setError("Expert UID not available. Cannot load profile for editing.");
            setLoadingPage(false);
            return;
          }

          const expertDocRef = doc(db, "experts", expertUid);
          const expertDocSnap = await getDoc(expertDocRef);

          if (expertDocSnap.exists()) {
            const dataFromFirestore = expertDocSnap.data();
            setEditProfileData({
              ...(dataFromFirestore as ExpertProfile),
              tags: (dataFromFirestore.tags || []) as string[], // Ensure tags is array
            });
          } else {
            // If expert profile doesn't exist, create a default one for editing
            console.warn("Expert profile not found in 'experts' collection. Preparing for first-time creation.");
            setEditProfileData({
              uid: expertUid,
              name: `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim() || '',
              role: userData?.expertise || '',
              experience: '',
              description: '',
              bio: '',
              tags: [],
              initials: ((userData?.firstName?.[0] || '') + (userData?.lastName?.[0] || '')).toUpperCase() || '',
              color: expertColors[Math.floor(Math.random() * expertColors.length)], // Assign a random default color
              rating: 0,
              students: 0,
              sessions: 0,
              resources: 0,
              profileCreated: false,
            });
          }
        } catch (err: any) {
          console.error("Error fetching expert profile for editing:", err);
          setError(`Failed to load profile for editing: ${err.message || "Unknown error."}`);
        } finally {
          setLoadingPage(false);
        }
      };

      fetchExpertProfile();
    }
  }, [authLoading, isAuthenticated, user?.uid, userData, router]);


  const handleEditProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setEditProfileData(prev => prev ? { ...prev, [id]: value } : null);
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tagsArray = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setEditProfileData(prev => prev ? { ...prev, tags: tagsArray } : null);
  };

  const handleColorSelect = (value: string) => {
    setEditProfileData(prev => prev ? { ...prev, color: value } : null);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProfileData || !user?.uid) {
      setError("Profile data or user ID is missing.");
      return;
    }

    setSubmittingProfileEdit(true);
    setError(null);

    try {
      const expertDocRef = doc(db, "experts", user.uid);

      // Derive initials from name
      const derivedInitials = editProfileData.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

      const profileToSave = {
        ...editProfileData,
        initials: derivedInitials, // Update initials based on new name
        profileCreated: true, // Mark profile as created/updated
      };

      await setDoc(expertDocRef, profileToSave, { merge: true }); // Use setDoc with merge for robust updates/creation

      console.log("Expert profile updated successfully!");
      router.push('/experts/profile/view'); // Redirect to view page after saving
    } catch (err: any) {
      console.error("Error updating expert profile:", err);
      setError(`Failed to save profile: ${err.message || "Unknown error."}`);
    } finally {
      setSubmittingProfileEdit(false);
    }
  };


  if (loadingPage || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] py-8 px-4">
        <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-lg text-muted-foreground">Loading profile data...</p>
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
            <CardTitle className="text-2xl font-bold text-center">Access Denied</CardTitle>
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


  return (
    <div className="container mx-auto py-6 px-4 md:py-8 md:px-6"> {/* Reduced overall padding */}
      {/* Moved header section outside the Card */}
      <div className="mb-4 md:mb-6"> {/* Reduced margin */}
        <Link href="/experts/profile/view" passHref>
            <Button variant="ghost" className="text-muted-foreground hover:text-primary px-1 py-0.5 h-auto text-xs"> {/* Further adjusted padding and text size */}
                <ArrowLeft className="mr-0.5 h-3 w-3" /> Back to Profile {/* Smaller icon */}
            </Button>
        </Link>
        <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-gray-100 mt-2"> {/* Added margin-top */}
            {editProfileData?.profileCreated === false ? "Create Your Expert Profile" : "Edit My Profile"}
        </h1>
      </div>

      <Card className="w-full max-w-3xl mx-auto p-4 md:p-5 shadow-xl rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"> {/* Reduced padding */}
        <CardHeader className="text-center pt-3 pb-4 border-b border-gray-100 dark:border-gray-700"> {/* Reduced padding */}
          <div className="flex justify-center items-center mb-3"> {/* Reduced margin */}
            <Avatar className="h-24 w-24 md:h-28 md:w-28 shadow-lg border-3 border-white dark:border-gray-900"> {/* Smaller avatar */}
              <AvatarFallback style={{ backgroundColor: editProfileData?.color || '#9E9E9E' }} className="text-white text-3xl md:text-4xl font-extrabold flex items-center justify-center"> {/* Smaller text */}
                {editProfileData?.initials || 'ME'}
              </AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100"> {/* Smaller text */}
            {editProfileData?.profileCreated === false ? "Setup Your Public Profile" : "Edit Profile Details"}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground max-w-xl mx-auto"> {/* Smaller text */}
            This information will be visible to students when they view your expert profile.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5"> {/* Reduced padding */}
          <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-3"> {/* Reduced gap */}
            {error && <p className="text-red-500 text-xs mb-3 col-span-full text-center">{error}</p>} {/* Smaller text and margin */}

            {/* Full Name */}
            <div className="col-span-1 md:col-span-2">
              <Label htmlFor="name" className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300"> {/* Smaller text and margin */}
                Full Name
              </Label>
              <Input
                id="name"
                value={editProfileData?.name || ''}
                onChange={handleEditProfileChange}
                className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 h-9" /* Smaller padding, text, and height */
                required
                disabled={submittingProfileEdit}
              />
            </div>

            {/* Role (Expertise) */}
            <div className="col-span-1">
              <Label htmlFor="role" className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                Role (Expertise)
              </Label>
              <Input
                id="role"
                value={editProfileData?.role || ''}
                onChange={handleEditProfileChange}
                className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 h-9"
                placeholder="e.g., Aptitude Expert, Java Interviewer"
                required
                disabled={submittingProfileEdit}
              />
            </div>

            {/* Experience */}
            <div className="col-span-1">
              <Label htmlFor="experience" className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                Experience
              </Label>
              <Input
                id="experience"
                value={editProfileData?.experience || ''}
                onChange={handleEditProfileChange}
                className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 h-9"
                placeholder="e.g., 5+ Years, Certified Trainer"
                disabled={submittingProfileEdit}
              />
            </div>

            {/* Tagline */}
            <div className="col-span-1 md:col-span-2">
              <Label htmlFor="description" className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                Tagline
              </Label>
              <Input
                id="description"
                value={editProfileData?.description || ''}
                onChange={handleEditProfileChange}
                className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 h-9"
                placeholder="A short, catchy description of what you offer"
                disabled={submittingProfileEdit}
              />
            </div>

            {/* Biography */}
            <div className="col-span-1 md:col-span-2">
              <Label htmlFor="bio" className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                Biography
              </Label>
              <Textarea
                id="bio"
                value={editProfileData?.bio || ''}
                onChange={handleEditProfileChange}
                className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 min-h-[80px]" /* Smaller min-height */
                rows={4} /* Reduced rows */
                placeholder="Share more about your background, passion, and what students can expect from you."
                disabled={submittingProfileEdit}
              />
            </div>

            {/* Skills (CSV) */}
            <div className="col-span-1 md:col-span-2">
              <Label htmlFor="tags" className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                Skills (comma-separated)
              </Label>
              <Input
                id="tags"
                value={editProfileData?.tags ? editProfileData.tags.join(', ') : ''}
                onChange={handleTagsChange}
                className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 h-9"
                placeholder="e.g., Python, DSA, SQL, Interview Prep"
                disabled={submittingProfileEdit}
              />
            </div>

            {/* Profile Color */}
            <div className="col-span-1 md:col-span-2">
              <Label htmlFor="color" className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                Profile Color
              </Label>
              <Select
                value={editProfileData?.color || ''}
                onValueChange={handleColorSelect}
                disabled={submittingProfileEdit}
              >
                <SelectTrigger className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 h-9"> {/* Smaller height, padding, text */}
                  <SelectValue placeholder="Select a color for your profile" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                  {expertColors.map((color) => (
                    <SelectItem key={color} value={color} className="flex items-center gap-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 text-sm"> {/* Reduced gap, smaller text */}
                      <div className="flex items-center gap-1.5 py-1 px-1.5"> {/* Reduced padding */}
                        <span className="h-4 w-4 rounded-full border border-gray-300 dark:border-gray-500" style={{ backgroundColor: color }}></span> {/* Smaller color swatch */}
                        <span className="text-gray-900 dark:text-gray-100 text-sm">{color}</span> {/* Smaller text */}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="col-span-full flex justify-end gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700"> {/* Reduced gap, margin, padding */}
              <Link href="/experts/profile/view" passHref>
                <Button type="button" variant="outline" disabled={submittingProfileEdit} className="px-4 py-1.5 text-sm rounded-md transition-all duration-200 hover:scale-105 h-9"> {/* Smaller button */}
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={submittingProfileEdit || !editProfileData?.name || !editProfileData?.role} className="px-4 py-1.5 text-sm rounded-md bg-green-600 hover:bg-green-700 text-white shadow-md transition-all duration-200 hover:scale-105 h-9"> {/* Smaller button */}
                {submittingProfileEdit ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Saving... {/* Smaller icon */}
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
