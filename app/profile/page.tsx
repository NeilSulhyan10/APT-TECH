// app/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "@/config/firebase";
import { signOut } from "firebase/auth";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, LogOut, Save, X, Pencil } from "lucide-react";

// Import the useAuth hook
import { useAuth } from '@/app/context/authContext'; 

// Define a type for your user profile data for better type safety
interface UserProfile {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt?: string;
  role: 'student' | 'expert' | 'admin'; // Added 'admin' role for completeness
  // Student-specific fields (optional for expert/admin)
  college?: string | null;
  year_of_study?: string | null;
  mentorship?: string | null; // e.g., 'seeking', 'no'
  // Expert-specific fields (optional for student/admin)
  expertise?: string | null;
  bio?: string | null;
  isExpertApproved?: boolean | null;
}

export default function ProfilePage() {
  // Use the useAuth hook to get user data and loading state from AuthContext
  const { userData, loading: authLoading, refreshUserData } = useAuth();
  const router = useRouter();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true); // Local loading for Firestore fetch
  const [error, setError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false); // State to toggle edit mode
  // States for editable fields
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editCollege, setEditCollege] = useState("");
  const [editYearOfStudy, setEditYearOfStudy] = useState("");
  const [editExpertise, setEditExpertise] = useState("");
  const [editBio, setEditBio] = useState("");


  useEffect(() => {
    const fetchUserProfileData = async () => {
      // If AuthContext is still loading, wait for it
      if (authLoading) {
        setLoading(true); // Keep local loading true while auth is loading
        return;
      }

      // If userData is null after authLoading is complete, it means no user is logged in
      if (!userData) {
        setError("User not logged in or session expired. Please login again.");
        router.push('/login');
        setLoading(false); // Auth is done loading, and no user found
        return;
      }

      setLoading(true); // Start local loading for the Firestore fetch
      setError(null);

      try {
        const docRef = doc(db, 'users', userData.uid); // Use uid from AuthContext
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const profileData = docSnap.data() as UserProfile;
          setUserProfile(profileData);
          // Initialize edit states with current profile data
          setEditFirstName(profileData.firstName || "");
          setEditLastName(profileData.lastName || "");
          setEditCollege(profileData.college || "");
          setEditYearOfStudy(profileData.year_of_study || "");
          setEditExpertise(profileData.expertise || "");
          setEditBio(profileData.bio || "");
        } else {
          setError("User profile not found in database. It might not have been created during signup.");
          console.warn("No user profile found for UID:", userData.uid);
          // Optionally, sign out if the user has no profile document
          await signOut(auth);
          router.push('/login');
        }
      } catch (err: any) {
        console.error("Error fetching user profile:", err);
        setError(`Failed to load profile: ${err.message || 'An unexpected error occurred.'}`);
      } finally {
        setLoading(false); // Local fetch complete
      }
    };

    fetchUserProfileData();
    // Re-run effect if userData or authLoading changes
  }, [userData, authLoading, router]);

  // Handles user logout
  const handleLogout = async () => {
    try {
      await signOut(auth); // Firebase signOut triggers AuthContext to update
      localStorage.removeItem('authToken'); // Keep if your token is separate
      // localStorage.removeItem('userInfo'); // No longer needed, AuthContext handles it
      // setUserProfile(null); // AuthContext manages global state
      router.push('/login');
    } catch (error) {
      console.error("Error logging out from profile page:", error);
      setError("Failed to log out. Please try again.");
    }
  };

  // Toggles to edit mode
  const handleEditClick = () => {
    setIsEditing(true);
  };

  // Cancels edit mode
  const handleCancelClick = () => {
    setIsEditing(false);
    // Revert edit states to current userProfile data if available
    if (userProfile) {
      setEditFirstName(userProfile.firstName || "");
      setEditLastName(userProfile.lastName || "");
      setEditCollege(userProfile.college || "");
      setEditYearOfStudy(userProfile.year_of_study || "");
      setEditExpertise(userProfile.expertise || "");
      setEditBio(userProfile.bio || "");
    }
  };

  // Handles saving changes to profile
  const handleSaveChanges = async () => {
    setLoading(true);
    setError(null);
    try {
      const storedAuthToken = localStorage.getItem('token');
      // No longer need to fetch userInfo from localStorage here, use userData from context
      if (!storedAuthToken || !userData) {
        setError("Session expired or user not logged in. Please login again.");
        router.push('/login');
        return;
      }

      const userUid = userData.uid; // Use uid from AuthContext

      // Prepare updated data based on role
      const updatedProfileData: Partial<UserProfile> = {
        firstName: editFirstName,
        lastName: editLastName,
        updatedAt: new Date().toISOString(),
      };

      if (userProfile?.role === 'student') {
        updatedProfileData.college = editCollege;
        updatedProfileData.year_of_study = editYearOfStudy;
      } else if (userProfile?.role === 'expert') {
        updatedProfileData.expertise = editExpertise;
        updatedProfileData.bio = editBio;
      }

      console.log("Attempting to send PATCH request to:", `/api/users/${userUid}`);
    console.log("Payload:", updatedProfileData);
    console.log("Authorization Token exists:", !!storedAuthToken);

      // Send PATCH request to backend API for update
      const res = await fetch(`/api/users/${userUid}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${storedAuthToken}`, // Send token for verification
        },
        body: JSON.stringify(updatedProfileData),
      });

      const responseData = await res.json(); // Changed 'data' to 'responseData' to avoid conflict

      if (!res.ok) {
        throw new Error(responseData.error || "Failed to update profile.");
      }

      // Update local userProfile state with the new data
      setUserProfile((prevProfile) => ({ ...prevProfile!, ...updatedProfileData }));
      setIsEditing(false); // Exit edit mode
      console.log("Profile updated successfully!");

      // Refresh global user data in AuthContext after successful update
      if (refreshUserData) {
        refreshUserData();
      }

    } catch (err: any) {
      console.error("Error saving profile changes:", err);
      setError(`Failed to save changes: ${err.message || 'An unexpected error occurred.'}`);
    } finally {
      setLoading(false);
    }
  };

  // Combine authLoading and local loading for overall loading state
  if (authLoading || loading) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8 px-4">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        <p className="text-lg">Loading profile...</p>
      </div>
    );
  }

  // If AuthContext loaded and no user data, show login prompt
  if (!userData) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Authentication Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">Please log in to view your profile.</p>
            <Button onClick={() => router.push('/login')} className="w-full mt-4">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If there's a local error state, show it
  if (error) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-red-500">{error}</p>
            <Button onClick={() => router.push('/login')} className="w-full mt-4">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If userProfile is null after all loading and error checks (shouldn't happen if AuthContext works), show profile not found
  if (!userProfile) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Profile Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">It seems your profile data is not available.</p>
            <Button onClick={() => router.push('/register')} className="w-full mt-4">
              Go to Register
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }


  // Helper to format expert approval status
  const getExpertApprovalStatus = (status: boolean | null | undefined) => {
    if (status === true) {
      return "Approved";
    } else if (status === false) {
      return "Pending/Rejected";
    } else {
      return "N/A";
    }
  };

  // Helper to construct the role display (e.g., "Student" or "Expert (Approved)")
  const getRoleDisplay = (profile: UserProfile) => {
    let roleText = profile.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : 'N/A';
    // Only show approval status if role is 'expert' AND isExpertApproved is explicitly true or false
    if (profile.role === 'expert' && typeof profile.isExpertApproved === 'boolean') {
      roleText += ` (${getExpertApprovalStatus(profile.isExpertApproved)})`;
    }
    return roleText;
  };

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">User Profile</CardTitle>
          <CardDescription className="text-center">Your personal details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            // Edit Mode
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editFirstName">First Name</Label>
                  <Input
                    id="editFirstName"
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editLastName">Last Name</Label>
                  <Input
                    id="editLastName"
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                  />
                </div>
              </div>

              {/* Non-editable Email field - now plain text */}
              <div className="space-y-2">
                <Label>Email</Label>
                <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
                  {userProfile.email || 'N/A'}
                </p>
              </div>

              {/* Non-editable Role field - now plain text with status */}
              <div className="space-y-2">
                <Label>Role</Label>
                <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
                  {getRoleDisplay(userProfile)}
                </p>
              </div>

              {userProfile.role === 'student' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="editCollege">College/University</Label>
                    <Input
                      id="editCollege"
                      value={editCollege}
                      onChange={(e) => setEditCollege(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editYearOfStudy">Year of Study</Label>
                    <Input
                      id="editYearOfStudy"
                      value={editYearOfStudy}
                      onChange={(e) => setEditYearOfStudy(e.target.value)}
                    />
                  </div>
                </>
              )}

              {userProfile.role === 'expert' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="editExpertise">Expertise</Label>
                    <Input
                      id="editExpertise"
                      value={editExpertise}
                      onChange={(e) => setEditExpertise(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editBio">Bio</Label>
                    <Input
                      id="editBio"
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                    />
                  </div>
                </>
              )}
            </>
          ) : (
            // View Mode (Text Display)
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
                    {userProfile.firstName || 'N/A'}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
                    {userProfile.lastName || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
                  {userProfile.email || 'N/A'}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
                  {getRoleDisplay(userProfile)}
                </p>
              </div>

              {userProfile.role === 'student' && (
                <>
                  <div className="space-y-2">
                    <Label>College/University</Label>
                    <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
                      {userProfile.college || 'N/A'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Year of Study</Label>
                    <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
                      {userProfile.year_of_study || 'N/A'}
                    </p>
                  </div>
                </>
              )}

              {userProfile.role === 'expert' && (
                <>
                  <div className="space-y-2">
                    <Label>Expertise</Label>
                    <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
                      {userProfile.expertise || 'N/A'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Bio</Label>
                    <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
                      {userProfile.bio || 'N/A'}
                    </p>
                  </div>
                </>
              )}
            </>
          )}
          {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          {isEditing ? (
            // Buttons for Edit Mode
            <div className="flex gap-2 w-full">
              <Button className="flex-1" onClick={handleSaveChanges} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {loading ? "Saving..." : "Save Changes"}
              </Button>
              <Button className="flex-1" variant="outline" onClick={handleCancelClick} disabled={loading}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          ) : (
            // Buttons for View Mode
            <>
              <Button className="w-full" onClick={handleEditClick} disabled={loading}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
              {/* Logout button visible ONLY in view mode */}
              <Button
                className="w-full"
                variant="outline"
                onClick={handleLogout}
                disabled={loading}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}