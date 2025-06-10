// app/admin/dashboard/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, orderBy, limit, startAfter, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore'; // Added orderBy, limit, startAfter, QueryDocumentSnapshot, DocumentData for logs
import { db } from '@/config/firebase'; // Your client-side Firestore instance
import { Loader2, ShieldCheck, Activity } from 'lucide-react'; // Icons: Added Activity, removed User as it's not needed for the "Go to My Profile" button
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/app/context/authContext'; // Assuming you have an AuthContext
import Link from 'next/link'; // Keep Link for other navigation buttons

// Define an interface for the user data you'll fetch (for the admin list)
interface AdminUserProfile {
  uid: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'student' | 'expert' | 'admin';
  isExpertApproved?: boolean | null; // For experts
  mentorship?: string | null; // For students
  // Add any other fields you want to display or use
}

// Define a type for your admin log entries
interface AdminLog {
  id: string; // Document ID
  timestamp: Date; // Converted from Firebase Timestamp
  adminEmail?: string;
  adminName?: string; // Prefer adminName if available
  activityDescription: string;
}

export default function AdminDashboardPage() {
  const { userData, loading: authLoading } = useAuth(); // Get user data from AuthContext
  const router = useRouter();

  // State for Admin Users List
  const [admins, setAdmins] = useState<AdminUserProfile[]>([]);
  const [adminListLoading, setAdminListLoading] = useState(true); // Specific loading for admin list
  const [adminListError, setAdminListError] = useState<string | null>(null); // Specific error for admin list

  // State for Admin Activity Logs
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(true); // Specific loading for logs
  const [logsError, setLogsError] = useState<string | null>(null); // Specific error for logs
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMoreLogs, setHasMoreLogs] = useState(true);
  const LOGS_PER_PAGE = 5; // Display 5 logs at a time

  // --- Effect for Authorization and Initial Data Fetch ---
  useEffect(() => {
    // Redirect if not authenticated or not an admin
    if (!authLoading && (!userData || userData.role !== 'admin')) {
      console.warn("Unauthorized access attempt to admin dashboard. Redirecting.");
      router.push('/login'); // Redirect to login if not admin
      return;
    }

    // Only fetch data if authentication is loaded and user is an admin
    if (!authLoading && userData?.role === 'admin') {
      fetchAdmins(); // Fetch the list of all admins
      fetchAdminLogs(true); // Fetch initial set of admin activity logs
    }
  }, [userData, authLoading, router]); // Depend on userData and authLoading to trigger fetch


  // --- Function to Fetch All Admins ---
  const fetchAdmins = async () => {
    setAdminListLoading(true);
    setAdminListError(null);

    try {
      const usersCollectionRef = collection(db, 'users');
      const q = query(usersCollectionRef, where('role', '==', 'admin'));
      const querySnapshot = await getDocs(q);

      const fetchedAdmins: AdminUserProfile[] = [];
      querySnapshot.forEach((doc) => {
        fetchedAdmins.push({ uid: doc.id, ...doc.data() } as AdminUserProfile);
      });

      // Separate the current user and sort the rest for display
      let currentUserAdmin: AdminUserProfile | undefined;
      const otherAdmins: AdminUserProfile[] = [];

      fetchedAdmins.forEach(adminUser => {
        if (adminUser.uid === userData?.uid) { // Use optional chaining for userData
          currentUserAdmin = adminUser;
        } else {
          otherAdmins.push(adminUser);
        }
      });

      otherAdmins.sort((a, b) => (a.firstName || '').localeCompare(b.firstName || ''));
      const sortedAdmins = currentUserAdmin ? [currentUserAdmin, ...otherAdmins] : otherAdmins;

      setAdmins(sortedAdmins);
    } catch (err: any) {
      console.error("Error fetching admin list:", err);
      setAdminListError(`Failed to load admin users: ${err.message || 'An unexpected error occurred.'}`);
    } finally {
      setAdminListLoading(false);
    }
  };

  // --- Function to Fetch Admin Activity Logs ---
  const fetchAdminLogs = async (isInitialFetch: boolean = false) => {
    setLogsLoading(true);
    setLogsError(null); // Clear previous errors

    try {
      let q = query(
        collection(db, "admin_logs"),
        orderBy("timestamp", "desc"), // Order by newest activities first
        limit(LOGS_PER_PAGE)
      );

      // If loading more, start after the last document fetched
      if (!isInitialFetch && lastDoc) {
        q = query(
          collection(db, "admin_logs"),
          orderBy("timestamp", "desc"),
          startAfter(lastDoc),
          limit(LOGS_PER_PAGE)
        );
      }

      const querySnapshot = await getDocs(q);
      const fetchedLogs: AdminLog[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedLogs.push({
          id: doc.id,
          timestamp: data.timestamp && typeof data.timestamp.toDate === 'function' ? data.timestamp.toDate() : new Date(),
          adminEmail: data.adminEmail || 'N/A',
          adminName: data.adminName || 'N/A',
          activityDescription: data.activityDescription || 'No description provided.',
        });
      });

      // Update logs state, either replacing for initial fetch or appending for load more
      setLogs((prevLogs) => isInitialFetch ? fetchedLogs : [...prevLogs, ...fetchedLogs]);
      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1] || null); // Set the last document for next pagination
      setHasMoreLogs(querySnapshot.docs.length === LOGS_PER_PAGE); // Check if there are more logs to fetch

    } catch (err: any) {
      console.error("Error fetching admin logs:", err);
      setLogsError(`Failed to load recent activities: ${err.message || 'An unexpected error occurred.'}`);
    } finally {
      setLogsLoading(false);
    }
  };

  // --- Overall Loading State for the Dashboard ---
  if (authLoading || adminListLoading || logsLoading) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8 px-4">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        <p className="text-lg">Loading Admin Dashboard...</p>
      </div>
    );
  }

  // --- Error Display for Authorization or Data Fetching ---
  if (adminListError || logsError) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8 px-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-red-500">{adminListError || logsError}</p>
            <Button onClick={() => router.push('/')} className="w-full mt-4">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- Access Denied / Not Admin ---
  // This check is mainly for TS type narrowing and as a final fallback.
  // The useEffect at the top should have already redirected if not an admin.
  if (!userData || userData.role !== 'admin') {
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

  // --- Admin Dashboard Content ---
  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
        <ShieldCheck className="h-8 w-8 text-primary" /> Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 gap-6"> {/* Changed to grid-cols-1 for vertical stacking */}

        {/* Card for List of All Administrators */}
        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
              All Administrators
            </CardTitle>
            <CardDescription className="text-center">
              A comprehensive list of all administrators in your system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption>Manage your team of administrators.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  {/* Removed UID TableHead */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((adminUser) => (
                  <TableRow
                    key={adminUser.uid}
                    className={adminUser.uid === userData.uid ? 'bg-blue-100 dark:bg-blue-900 font-semibold' : ''}
                  >
                    <TableCell className="font-medium">
                      {adminUser.firstName} {adminUser.lastName}
                      {adminUser.uid === userData.uid && (
                        <span className="ml-2 px-2 py-1 text-xs font-bold text-blue-800 bg-blue-200 rounded-full dark:text-blue-200 dark:bg-blue-800">
                          (You)
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{adminUser.email}</TableCell>
                    {/* Removed UID TableCell */}
                  </TableRow>
                ))}
                {admins.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground"> {/* colSpan changed to 2 */}
                      No admin users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
          {/* CardFooter removed */}
        </Card>

        {/* Card for Recent Admin Activities */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-muted-foreground" /> Recent Admin Activities
            </CardTitle>
            <CardDescription>Activities performed recently by all administrators.</CardDescription>
          </CardHeader>
          <CardContent>
            {logsError && (
              <p className="text-red-500 text-sm text-center mb-4">{logsError}</p>
            )}
            {logs.length === 0 && !logsLoading && !logsError ? (
              <p className="text-muted-foreground text-center py-4">No recent activities found.</p>
            ) : (
              <div className="max-h-80 overflow-y-auto pr-2"> {/* Scrollable container for logs */}
                <ul className="space-y-4">
                  {logs.map((log) => (
                    <li key={log.id} className="border-b pb-2 last:border-b-0 last:pb-0">
                      <p className="text-sm font-medium leading-tight">{log.activityDescription}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        By {log.adminName || log.adminEmail} on {log.timestamp.toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {hasMoreLogs && (
              <div className="mt-4 text-center">
                <Button onClick={() => fetchAdminLogs(false)} disabled={logsLoading} variant="outline" size="sm">
                  {logsLoading && logs.length > 0 ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {logsLoading && logs.length === 0 ? "Loading Logs..." : "Load More"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}