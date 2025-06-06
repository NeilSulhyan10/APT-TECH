// app/admin/approvals/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, doc, updateDoc, addDoc } from 'firebase/firestore'; // Added addDoc for logs
import { db } from '@/config/firebase'; // Your client-side Firestore instance
import { useAuth } from '@/app/context/authContext'; // Your AuthContext hook

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, ShieldCheck, MessageSquareText } from 'lucide-react'; // Icons: Added ShieldCheck for main title
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea'; // For rejection reason input
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"; // For confirmation/rejection dialogs

// Define a type for users awaiting approval
interface PendingUser {
  uid: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'expert' | 'pending_admin' | 'admin'; // Added 'pending_admin' role
  isExpertApproved?: boolean | null; // true, false, or null for initial pending (for experts)
  expertise?: string; // For experts
  bio?: string; // For experts
  // Add any other relevant fields for display or decision-making for admins
}

export default function AdminApprovalsPage() {
  const { userData, loading: authLoading, isAuthenticated, refreshUserData } = useAuth();
  const router = useRouter();

  const [pendingApprovals, setPendingApprovals] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingUid, setActionLoadingUid] = useState<string | null>(null); // To disable buttons for a specific user during action

  // State for Rejection Dialog
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedUserForRejection, setSelectedUserForRejection] = useState<PendingUser | null>(null);

  // --- Authorization and Initial Data Fetch ---
  useEffect(() => {
    // Redirect if not authenticated or not an admin
    if (!authLoading && (!isAuthenticated || userData?.role !== 'admin')) {
      console.warn("Unauthorized access attempt to admin approvals. Redirecting.");
      router.push('/login');
      return;
    }

    // Only fetch data if authentication is loaded and user is an admin
    if (!authLoading && userData?.role === 'admin') {
      fetchPendingApprovals();
    }
  }, [userData, authLoading, isAuthenticated, router]); // Dependencies

  // --- Function to Fetch Pending Approvals ---
  const fetchPendingApprovals = async () => {
    setLoading(true);
    setError(null);
    try {
      const usersCollectionRef = collection(db, 'users');
      let allPendingUsers: PendingUser[] = [];

      // Query for experts who are not yet approved
      const expertQuery = query(
        usersCollectionRef,
        where('role', '==', 'expert'),
        where('isExpertApproved', '==', false) // Assuming `false` means pending/rejected
      );
      const expertSnapshot = await getDocs(expertQuery);
      const fetchedExperts = expertSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as PendingUser));
      allPendingUsers = allPendingUsers.concat(fetchedExperts);

      // Query for users who have applied to be admins (new 'pending_admin' role)
      const adminApprovalQuery = query(
        usersCollectionRef,
        where('role', '==', 'pending_admin')
        // You might add another field here if 'pending_admin' also has an explicit approval flag,
        // but changing the role itself is often sufficient.
      );
      const adminSnapshot = await getDocs(adminApprovalQuery);
      const fetchedAdmins = adminSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as PendingUser));
      allPendingUsers = allPendingUsers.concat(fetchedAdmins);

      // Sort pending users, e.g., by role then name
      allPendingUsers.sort((a, b) => {
        if (a.role === 'pending_admin' && b.role === 'expert') return -1;
        if (a.role === 'expert' && b.role === 'pending_admin') return 1;
        return (a.firstName || '').localeCompare(b.firstName || '');
      });

      setPendingApprovals(allPendingUsers);
      console.log("Fetched pending approvals:", allPendingUsers);

    } catch (err: any) {
      console.error("Error fetching pending approvals:", err);
      setError(`Failed to load pending approvals: ${err.message || 'An unexpected error occurred.'}`);
    } finally {
      setLoading(false);
    }
  };

  // --- Handle Approve Action ---
  const handleApprove = async (userToApprove: PendingUser) => {
    if (!userData || userData.role !== 'admin') {
      setError("Authorization error: You are not an admin.");
      return;
    }
    setActionLoadingUid(userToApprove.uid);
    setError(null);

    try {
      const userDocRef = doc(db, 'users', userToApprove.uid);
      let updateData: { [key: string]: any } = {};
      let logDescription = '';

      if (userToApprove.role === 'expert') {
        updateData.isExpertApproved = true;
        updateData.rejectedReason = null; // Clear rejection reason if it exists
        logDescription = `Approved expert ${userToApprove.firstName || userToApprove.email}.`;
      } else if (userToApprove.role === 'pending_admin') {
        updateData.role = 'admin'; // Change role to 'admin'
        logDescription = `Approved admin application for ${userToApprove.firstName || userToApprove.email}.`;
        // Optionally, clear any admin application specific fields here
      }
      updateData.updatedAt = new Date().toISOString(); // Update timestamp

      await updateDoc(userDocRef, updateData);

      // Add log entry to admin_logs
      await addAdminLog(
        userData.email || userData.uid,
        userData.firstName || userData.email, // Admin's name for log
        logDescription
      );

      // Refresh the list of pending approvals
      fetchPendingApprovals();
      if(refreshUserData) refreshUserData(); // Refresh context if current admin was modified

    } catch (err: any) {
      console.error("Error approving user:", err);
      setError(`Failed to approve user: ${err.message || 'An unexpected error occurred.'}`);
    } finally {
      setActionLoadingUid(null);
    }
  };

  // --- Handle Reject Action (opens dialog) ---
  const handleRejectClick = (userToReject: PendingUser) => {
    setSelectedUserForRejection(userToReject);
    setRejectReason(""); // Clear previous reason
    setShowRejectDialog(true);
  };

  // --- Handle Reject Action (after dialog confirmation) ---
  const handleConfirmReject = async () => {
    if (!selectedUserForRejection || !userData || userData.role !== 'admin') {
      setError("Authorization error or no user selected for rejection.");
      return;
    }
    setActionLoadingUid(selectedUserForRejection.uid);
    setError(null);
    setShowRejectDialog(false); // Close dialog immediately

    try {
      const userDocRef = doc(db, 'users', selectedUserForRejection.uid);
      let updateData: { [key: string]: any } = {};
      let logDescription = '';

      if (selectedUserForRejection.role === 'expert') {
        updateData.isExpertApproved = false; // Set to false for rejected/pending
        updateData.rejectedReason = rejectReason || "No reason provided."; // Store the reason
        logDescription = `Rejected expert ${selectedUserForRejection.firstName || selectedUserForRejection.email}. Reason: ${rejectReason || 'Not provided'}.`;
      } else if (selectedUserForRejection.role === 'pending_admin') {
        updateData.role = 'student'; // Revert to student role upon rejection of admin application
        updateData.rejectedReason = rejectReason || "No reason provided.";
        logDescription = `Rejected admin application for ${selectedUserForRejection.firstName || selectedUserForRejection.email}. Role reverted to student. Reason: ${rejectReason || 'Not provided'}.`;
        // Optionally, clear any admin application specific fields here
      }
      updateData.updatedAt = new Date().toISOString();

      await updateDoc(userDocRef, updateData);

      // Add log entry to admin_logs
      await addAdminLog(
        userData.email || userData.uid,
        userData.firstName || userData.email, // Admin's name for log
        logDescription
      );

      // Refresh the list of pending approvals
      fetchPendingApprovals();
      if(refreshUserData) refreshUserData();

    } catch (err: any) {
      console.error("Error rejecting user:", err);
      setError(`Failed to reject user: ${err.message || 'An unexpected error occurred.'}`);
    } finally {
      setActionLoadingUid(null);
      setSelectedUserForRejection(null); // Clear selected user
      setRejectReason(""); // Clear reason
    }
  };

  // --- Helper to Add Admin Log Entry ---
  const addAdminLog = async (adminId: string, adminName: string, description: string) => {
    try {
      const logsCollectionRef = collection(db, 'admin_logs');
      await addDoc(logsCollectionRef, { // Using addDoc for new log entries
        adminId: adminId,
        adminName: adminName,
        activityDescription: description,
        timestamp: new Date(), // Firestore Timestamp
      });
      console.log("Admin log added successfully.");
    } catch (logError) {
      console.error("Failed to add admin log:", logError);
      // Don't set page error for log failure, just console log
    }
  };


  // --- Render Loading State ---
  if (authLoading || loading) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8 px-4">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        <p className="text-lg">Loading Approvals Dashboard...</p>
      </div>
    );
  }

  // --- Render Access Denied State ---
  if (!isAuthenticated || userData?.role !== 'admin') {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8 px-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-red-500">You do not have administrative privileges to view this page.</p>
            <Button onClick={() => router.push('/')} className="w-full mt-4">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- Main Approvals Dashboard Content ---
  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
        <ShieldCheck className="h-8 w-8 text-primary" /> Pending Approvals
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
      )}

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Users Awaiting Approval</CardTitle>
          <CardDescription>Review and manage applications for experts and administrators.</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingApprovals.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No users currently awaiting approval.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Details</TableHead> {/* For expertise/bio or admin app details */}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingApprovals.map((user) => (
                  <TableRow key={user.uid}>
                    <TableCell className="font-medium">{user.firstName} {user.lastName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.role === 'pending_admin' ? 'Pending Admin' : user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </TableCell>
                    <TableCell>
                      {user.role === 'expert' ? (
                        <p className="text-sm text-muted-foreground">
                          Expertise: {user.expertise || 'N/A'}<br/>
                          Bio: {user.bio || 'N/A'}
                        </p>
                      ) : user.role === 'pending_admin' ? (
                        <p className="text-sm text-muted-foreground">
                          Admin application pending. (Add specific admin application details here if you have them in the user document)
                        </p>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell className="text-right flex gap-2 justify-end">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleApprove(user)}
                        disabled={actionLoadingUid === user.uid}
                      >
                        {actionLoadingUid === user.uid ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-1 h-4 w-4" />}
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRejectClick(user)}
                        disabled={actionLoadingUid === user.uid}
                      >
                        {actionLoadingUid === user.uid ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-1 h-4 w-4" />}
                        Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter className="flex justify-end pt-4">
          <Button onClick={() => router.push('/admin/dashboard')}>
            Back to Dashboard
          </Button>
        </CardFooter>
      </Card>

      {/* Rejection Reason Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <MessageSquareText className="h-6 w-6 text-orange-500" /> Provide Rejection Reason
            </AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting {selectedUserForRejection?.firstName || selectedUserForRejection?.email}.
              This reason might be visible to the user.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              placeholder="e.g., 'Missing required documentation', 'Experience not a match', 'Profile incomplete'."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoadingUid !== null}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmReject}
              disabled={actionLoadingUid !== null}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoadingUid ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Confirm Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}