// app/expert/sessions/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase'; // Your client-side Firestore instance
import { useAuth } from '@/app/context/authContext'; // Your AuthContext hook

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CalendarCheck, Clock, User, MessageSquareText, LinkIcon } from 'lucide-react'; // Icons
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // For Upcoming/Past sessions

// Define the type for a session
interface Session {
  id: string; // Document ID from Firestore
  expertId: string;
  clientId: string;
  clientName: string;
  topic: string;
  startTime: Timestamp; // Using Firebase Timestamp type
  endTime: Timestamp;
  durationMinutes: number;
  status: 'scheduled' | 'completed' | 'cancelled_by_expert' | 'cancelled_by_client' | 'no_show_expert' | 'no_show_client';
  meetingLink?: string;
  // Add any other fields you want to display
}

export default function ExpertSessionsPage() {
  const { userData, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  // --- Authorization and Initial Data Fetch ---
  useEffect(() => {
    if (!authLoading) {
      // Redirect if not authenticated
      if (!isAuthenticated) {
        console.warn("Unauthenticated access attempt to expert sessions. Redirecting to login.");
        router.push('/login');
        return;
      }

      // Check if user is an approved expert
      if (userData?.role !== 'expert' || userData?.isExpertApproved !== true) {
        console.warn("Unauthorized access to expert sessions. Redirecting.");
        router.push('/expert/dashboard'); // Redirect to dashboard if not approved expert
        return;
      }

      // If authorized, fetch sessions for the active tab
      fetchSessions(activeTab);
    }
  }, [userData, authLoading, isAuthenticated, router, activeTab]); // Re-fetch when activeTab changes

  // --- Function to Fetch Sessions ---
  const fetchSessions = async (tab: 'upcoming' | 'past') => {
    if (!userData?.uid) {
      setError("Expert UID not found.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setSessions([]); // Clear previous sessions

    try {
      const sessionsCollectionRef = collection(db, 'sessions');
      const now = Timestamp.now();
      let sessionsQuery;

      if (tab === 'upcoming') {
        sessionsQuery = query(
          sessionsCollectionRef,
          where('expertId', '==', userData.uid),
          where('startTime', '>', now), // Sessions in the future
          where('status', '==', 'scheduled'), // Only show scheduled upcoming sessions
          orderBy('startTime', 'asc') // Order by earliest first
        );
      } else { // 'past' tab
        sessionsQuery = query(
          sessionsCollectionRef,
          where('expertId', '==', userData.uid),
          where('startTime', '<=', now), // Sessions that have started or are in the past
          orderBy('startTime', 'desc') // Order by most recent first
        );
      }

      const querySnapshot = await getDocs(sessionsQuery);
      const fetchedSessions: Session[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Omit<Session, 'id'> // Type assertion for data, omitting 'id'
      }));

      setSessions(fetchedSessions);
      console.log(`Fetched ${tab} sessions:`, fetchedSessions);

    } catch (err: any) {
      console.error(`Error fetching ${tab} sessions:`, err);
      setError(`Failed to load ${tab} sessions: ${err.message || 'An unexpected error occurred.'}`);
    } finally {
      setLoading(false);
    }
  };

  // Helper to format Firebase Timestamp
  const formatTimestamp = (timestamp: Timestamp) => {
    if (!timestamp || !timestamp.toDate) return 'N/A';
    const date = timestamp.toDate();
    return date.toLocaleString('en-IN', { // Customize locale as needed (e.g., 'en-US' for US format)
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true, // Use 12-hour format with AM/PM
    });
  };

  // --- Render Loading State ---
  if (authLoading || loading) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8 px-4">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        <p className="text-lg">Loading Sessions...</p>
      </div>
    );
  }

  // --- Render Access Denied/Error State ---
  if (error) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8 px-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-red-500">{error}</p>
            <Button onClick={() => router.push('/expert/dashboard')} className="w-full mt-4">
              Go to Expert Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- Main Sessions Content ---
  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
        <CalendarCheck className="h-8 w-8 text-primary" /> My Sessions
      </h1>

      <Tabs defaultValue="upcoming" className="w-full" onValueChange={(value: any) => setActiveTab(value)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming">Upcoming Sessions</TabsTrigger>
          <TabsTrigger value="past">Past Sessions</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Upcoming Consultations</CardTitle>
              <CardDescription>View your scheduled and upcoming sessions with clients.</CardDescription>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No upcoming sessions found.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Topic</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell className="font-medium">{session.clientName}</TableCell>
                        <TableCell>{session.topic}</TableCell>
                        <TableCell>{formatTimestamp(session.startTime)}</TableCell>
                        <TableCell>{session.durationMinutes} mins</TableCell>
                        <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                ${session.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                  session.status.includes('cancelled') ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800' // Fallback for other statuses
                                }`}>
                                {session.status.replace(/_/g, ' ')}
                            </span>
                        </TableCell>
                        <TableCell className="text-right flex gap-2 justify-end">
                            {session.status === 'scheduled' && session.meetingLink && (
                                <Button size="sm" variant="outline" onClick={() => window.open(session.meetingLink, '_blank')}>
                                    <LinkIcon className="mr-1 h-4 w-4" /> Join
                                </Button>
                            )}
                            {/* Add Cancel Session Button if applicable (requires more logic/dialogs) */}
                            {/* <Button size="sm" variant="destructive">Cancel</Button> */}
                            <Button size="sm" variant="secondary" onClick={() => router.push(`/expert/sessions/${session.id}`)}>
                                View Details
                            </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="past">
        <Card className="mt-4">
            <CardHeader>
              <CardTitle>Past Consultations</CardTitle>
              <CardDescription>Review your completed and past sessions with clients.</CardDescription>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No past sessions found.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Topic</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell className="font-medium">{session.clientName}</TableCell>
                        <TableCell>{session.topic}</TableCell>
                        <TableCell>{formatTimestamp(session.startTime)}</TableCell>
                        <TableCell>{session.durationMinutes} mins</TableCell>
                        <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                ${session.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  session.status.includes('cancelled') ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800' // Fallback for other statuses
                                }`}>
                                {session.status.replace(/_/g, ' ')}
                            </span>
                        </TableCell>
                        <TableCell className="text-right flex gap-2 justify-end">
                            <Button size="sm" variant="secondary" onClick={() => router.push(`/expert/sessions/${session.id}`)}>
                                View Details
                            </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end">
        <Button onClick={() => router.push('/expert/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}