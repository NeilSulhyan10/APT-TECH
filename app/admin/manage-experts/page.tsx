// app/admin/manage-experts/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/config/firebase";
import { signOut } from "firebase/auth";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle, UserX, UserCheck } from "lucide-react"; // Icons for approval/rejection
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CardFooter } from "@/components/ui/card";


// Define a type for your user profile data
interface UserProfile {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string; // 'user', 'expert', 'mentor', 'admin'
  status: 'pending' | 'approved' | 'rejected'; // New status field
  college?: string;
  year_of_study?: string;
  createdAt: string;
}

export default function ManageExpertsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingExperts, setPendingExperts] = useState<UserProfile[]>([]);
  const [authLoading, setAuthLoading] = useState(true); // For initial auth check
  const [currentAdminRole, setCurrentAdminRole] = useState<string | null>(null);


  // Function to fetch pending experts from Firestore
  const fetchPendingExperts = async () => {
    setLoading(true);
    setError(null);
    try {
      const q = query(
        collection(db, "users"),
        where("role", "in", ["expert", "mentor"]), // Query for both expert and mentor roles
        where("status", "==", "pending")
      );
      const querySnapshot = await getDocs(q);
      const expertsData = querySnapshot.docs.map(doc => ({
        uid: doc.id, // Changed from id: doc.id to uid: doc.id
        ...doc.data()
      })) as UserProfile[];
      setPendingExperts(expertsData);
      console.log("Fetched pending experts:", expertsData);
    } catch (err: any) {
      console.error("Error fetching pending experts:", err);
      setError(`Failed to fetch pending experts: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Auth check and role verification for page access
  useEffect(() => {
    const checkAdminAccess = async () => {
      setAuthLoading(true);
      setError(null);
      const firebaseUser = auth.currentUser;

      if (!firebaseUser) {
        setError("Not authenticated. Redirecting to login...");
        router.push('/login');
        return;
      }

      try {
        // Fetch user profile from Firestore to get the most up-to-date role
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const profile = userDocSnap.data() as UserProfile;
          setCurrentAdminRole(profile.role);

          if (profile.role !== 'admin') {
            setError("Access Denied: You do not have administrator privileges. Redirecting to Home...");
            router.push('/');
            signOut(auth); // Log them out from Firebase too
            localStorage.removeItem('authToken');
            localStorage.removeItem('userInfo');
          } else {
            // If admin, proceed to fetch pending experts
            fetchPendingExperts();
          }
        } else {
          setError("User profile not found. Redirecting to login...");
          router.push('/login');
          signOut(auth);
          localStorage.removeItem('authToken');
          localStorage.removeItem('userInfo');
        }
      } catch (err: any) {
        console.error("Error verifying admin access:", err);
        setError(`Failed to verify access: ${err.message}. Redirecting to login...`);
        router.push('/login');
        signOut(auth);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userInfo');
      } finally {
        setAuthLoading(false);
      }
    };

    checkAdminAccess();
  }, [router]); // Rerun effect if router changes

  // Handles approval/rejection action
  const handleAction = async (expertUid: string, action: 'approve' | 'reject') => {
    setLoading(true); // Re-enable loading state
    setError(null);
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        setError("Authentication token missing. Please login again.");
        router.push('/login');
        return;
      }

      const res = await fetch(`/api/admin/users/${expertUid}/approve`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`, // Send admin's token
        },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Failed to ${action} user.`);
      }

      console.log(`User ${expertUid} ${action}d successfully:`, data.message);
      // Refresh the list after action
      fetchPendingExperts();
      // Show success toast (if you have one)
      // toast({ title: "Success", description: data.message });

    } catch (err: any) {
      console.error(`Error ${action}ing user:`, err);
      setError(`Error ${action}ing user: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8 px-4">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        <p className="text-lg">Verifying administrator access...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8 px-4">
        <div className="text-center text-red-500">
          <p>{error}</p>
          {error.includes("Redirecting") && (
            <Button onClick={() => router.push('/login')} className="mt-4">
              Go to Login
            </Button>
          )}
        </div>
      </div>
    );
  }

  // If not admin, access denied message is already handled by error state and redirect
  if (currentAdminRole !== 'admin') {
      return null; // Don't render anything if not admin, let useEffect handle redirect
  }


  return (
    <div className="container p-4 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">Manage Expert/Mentor Approvals</h1>

      {loading && (
        <div className="flex justify-center items-center py-4">
          <Loader2 className="mr-2 h-6 w-6 animate-spin" />
          <p>Loading pending experts...</p>
        </div>
      )}

      {pendingExperts.length === 0 && !loading && !error && (
        <p className="text-center text-muted-foreground mt-8">No pending expert/mentor requests at this time.</p>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pendingExperts.map((expert) => (
          <Card key={expert.uid} className="flex flex-col">
            <CardHeader>
              <CardTitle>{expert.firstName} {expert.lastName}</CardTitle>
              <CardDescription className="capitalize">Role: {expert.role}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm">Email: {expert.email}</p>
              <p className="text-sm">College: {expert.college || 'N/A'}</p>
              <p className="text-sm">Year: {expert.year_of_study || 'N/A'}</p>
              <p className="text-sm">Registered: {new Date(expert.createdAt).toLocaleDateString()}</p>
            </CardContent>
            <CardFooter className="flex gap-2 justify-end pt-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4 text-green-500" /> Approve
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will approve {expert.firstName}'s request to become an {expert.role}. They will gain access to {expert.role}-specific features.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleAction(expert.uid, 'approve')}>
                      <UserCheck className="h-4 w-4 mr-2" /> Confirm Approve
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="flex items-center gap-1">
                    <XCircle className="h-4 w-4" /> Reject
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will reject {expert.firstName}'s request to become an {expert.role}. They will remain a regular user.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleAction(expert.uid, 'reject')}>
                      <UserX className="h-4 w-4 mr-2" /> Confirm Reject
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
