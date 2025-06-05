"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore"; // Added updateDoc
import { db, auth } from "@/config/firebase";
import { signOut } from "firebase/auth";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, LogOut, Save, X, Pencil } from "lucide-react"; // Added Pencil, Save, X icons

// Define a type for your user profile data for better type safety
interface UserProfile {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  college: string;
  year_of_study: string;
  createdAt: string;
  // Add any other fields you store in Firestore that you want to display/edit
}

export default function ProfilePage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false); // New state to toggle edit mode
  // States for editable fields
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editCollege, setEditCollege] = useState("");
  const [editYearOfStudy, setEditYearOfStudy] = useState("");


  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        const storedUserInfo = localStorage.getItem('userInfo');
        if (!storedUserInfo) {
          setError("User not logged in or session expired. Please login again.");
          router.push('/login');
          return;
        }

        const userInfo = JSON.parse(storedUserInfo);
        const userUid = userInfo.uid;

        if (!userUid) {
          setError("User ID not found in session. Please login again.");
          router.push('/login');
          return;
        }

        const docRef = doc(db, 'users', userUid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const profileData = docSnap.data() as UserProfile;
          setUserProfile(profileData);
          // Initialize edit states with current profile data
          setEditFirstName(profileData.firstName || "");
          setEditLastName(profileData.lastName || "");
          setEditCollege(profileData.college || "");
          setEditYearOfStudy(profileData.year_of_study || "");
          console.log("Profile data fetched from Firestore:", profileData);
        } else {
          setError("User profile not found in database. It might not have been created during signup.");
          console.warn("No user profile found for UID:", userUid);
        }
      } catch (err: any) {
        console.error("Error fetching user profile:", err);
        setError(`Failed to load profile: ${err.message || 'An unexpected error occurred.'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  // Handles user logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('authToken');
      localStorage.removeItem('userInfo');
      setUserProfile(null);
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
    }
  };

  // Handles saving changes to profile
  const handleSaveChanges = async () => {
    setLoading(true);
    setError(null);
    try {
      const storedAuthToken = localStorage.getItem('authToken');
      const storedUserInfo = localStorage.getItem('userInfo');
      if (!storedAuthToken || !storedUserInfo) {
        setError("Session expired. Please login again.");
        router.push('/login');
        return;
      }

      const userInfo = JSON.parse(storedUserInfo);
      const userUid = userInfo.uid;

      const updatedProfileData = {
        firstName: editFirstName,
        lastName: editLastName,
        college: editCollege,
        year_of_study: editYearOfStudy,
        // Add other fields you want to update
      };

      // Send PATCH request to backend API for update
      const res = await fetch(`/api/users/${userUid}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${storedAuthToken}`, // Send token for verification
        },
        body: JSON.stringify(updatedProfileData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile.");
      }

      // Update local userProfile state with the new data
      setUserProfile((prevProfile) => ({ ...prevProfile!, ...updatedProfileData }));
      setIsEditing(false); // Exit edit mode
      console.log("Profile updated successfully!");

    } catch (err: any) {
      console.error("Error saving profile changes:", err);
      setError(`Failed to save changes: ${err.message || 'An unexpected error occurred.'}`);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8 px-4">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        <p className="text-lg">Loading profile...</p>
      </div>
    );
  }

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
              {/* Email is typically not editable from client-side via profile */}
              <div className="space-y-2">
                <Label htmlFor="displayEmail">Email (Not Editable)</Label>
                <Input id="displayEmail" type="email" value={userProfile.email} readOnly />
              </div>
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
