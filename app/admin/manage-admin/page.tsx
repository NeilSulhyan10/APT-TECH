// app/admin/manage-admins/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Loader2, Users } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";


interface UserProfile {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'expert' | 'admin';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export default function ManageAdminsPage() {
  const router = useRouter();
  const { user, userProfile, loading: authLoading, error: authError } = useAuth();
  const [admins, setAdmins] = useState<UserProfile[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  const fetchAdmins = async () => {
    setPageLoading(true);
    setPageError(null);
    try {
      const authToken = localStorage.getItem('authToken'); // Need auth token to call protected /api/users
      if (!authToken) {
        setPageError("Authentication token missing.");
        return;
      }

      // Fetch all users and filter for admins
      const response = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch users.');
      }
      const allUsers: UserProfile[] = await response.json();
      // Filter out the current logged-in admin if desired, or show all
      const filteredAdmins = allUsers.filter(u => u.role === 'admin' && u.uid !== user?.uid);
      setAdmins(filteredAdmins);
    } catch (err: any) {
      console.error("Error fetching admins:", err);
      setPageError(`Failed to fetch administrators: ${err.message}`);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (authError) {
        router.push('/login');
      } else if (!user || !userProfile || userProfile.role !== 'admin') {
        console.warn("Access Denied: Not an admin.");
        router.push('/');
      } else {
        fetchAdmins();
      }
    }
  }, [user, userProfile, authLoading, authError, router]);


  // Placeholder for "Remove Admin Role" functionality
  // This would involve a backend API call to set custom claim to 'user' and update Firestore role.
  const handleRemoveAdminRole = async (targetUid: string) => {
    setPageLoading(true);
    setPageError(null);
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        setPageError("Authentication token missing. Please login again.");
        return;
      }

      // In a real app, this would be a PATCH to a new API endpoint like /api/admin/admins/[id]/demote
      // For demonstration, we'll simulate an update to Firestore directly
      // However, for security, setting custom claims MUST be done via a secure backend endpoint
      // that uses the Firebase Admin SDK.
      
      // Simulate backend call to update role and log
      const res = await fetch(`/api/admin/users/${targetUid}/approve`, { // Reuse existing endpoint for demo, but typically new endpoint for demotion
          method: "PATCH",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${authToken}` },
          body: JSON.stringify({ action: "reject_admin_role" }) // Custom action for demotion
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove admin role.");

      console.log(`Admin role removed for ${targetUid}`);
      fetchAdmins(); // Refresh the list
      // toast notification
    } catch (err: any) {
      console.error("Error removing admin role:", err);
      setPageError(`Failed to remove admin role: ${err.message}`);
    } finally {
      setPageLoading(false);
    }
  };


  const overallLoading = authLoading || pageLoading;
  const displayError = authError || pageError;

  if (overallLoading) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8 px-4">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        <p className="text-lg">Loading administrators...</p>
      </div>
    );
  }

  if (displayError) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8 px-4">
        <div className="text-center text-red-500">
          <p>{displayError}</p>
          <Button onClick={() => router.push('/login')} className="mt-4">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  if (!userProfile || userProfile.role !== 'admin') {
      return null;
  }

  return (
    <div className="container p-4 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">Manage Administrators</h1>

      {admins.length === 0 && !pageLoading && !displayError && (
        <p className="text-center text-muted-foreground mt-8">No other administrators found.</p>
      )}

      {displayError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {displayError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {admins.map((admin) => (
          <Card key={admin.uid} className="flex flex-col">
            <CardHeader>
              <CardTitle>{admin.firstName} {admin.lastName}</CardTitle>
              <CardDescription>{admin.email}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground">UID: {admin.uid}</p>
              <p className="text-sm text-muted-foreground">Joined: {new Date(admin.createdAt).toLocaleDateString()}</p>
            </CardContent>
            <CardFooter className="flex justify-end pt-4">
                {/* Prevent an admin from demoting themselves */}
                {user?.uid !== admin.uid && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="flex items-center gap-1">
                                Remove Admin Role
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action will remove administrator privileges from {admin.firstName} {admin.lastName}. They will become a regular user.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleRemoveAdminRole(admin.uid)}>
                                    Confirm Removal
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
