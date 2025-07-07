// app/experts/sessions/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react"; // Added useCallback
import { useRouter } from "next/navigation";
import { useAuth, UserData } from "@/app/context/authContext";
import { db } from "@/config/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  Timestamp,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  limit, // Import limit for pagination
  startAfter, // Import startAfter for pagination
  DocumentData, // Import DocumentData for QueryDocumentSnapshot
  QueryDocumentSnapshot, // Import QueryDocumentSnapshot for lastVisible
} from "firebase/firestore";
import { Calendar as CalendarIcon, PlusCircle, Clock, Users, ArrowLeft, Loader2, Pencil, Trash2, ClipboardCopy, List } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from 'sonner';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define interfaces for data structures
interface QASession {
  id: string;
  expertId: string;
  title: string;
  trainer: string; // Expert's full name
  date: string; // Stored as 'Month Day, Year' string (e.g., "Jun 15, 2025")
  time: string; // e.g., "4:00 PM - 5:30 PM"
  attendees: number;
  tags: string[];
  initials: string; // Derived from expert's name
  color: string;     // Expert's assigned color
  description: string;
  registrationLink?: string | null;
  recordingLink?: string | null;
  createdAt: Timestamp;
}

// Interface for Expert's own profile data from 'experts' collection
interface ExpertPersonalProfile {
  uid: string;
  name: string;
  initials: string;
  color: string;
  role: string;
  experience?: string;
  description?: string;
  bio?: string;
  rating?: number;
  students?: number;
  sessions?: number;
  resources?: number;
  tags?: string[];
}

interface Registration {
  id: string; // User ID who registered
  registeredAt: any; // Firestore Timestamp
  userId: string;
  userName: string;
  userEmail: string;
}

const ITEMS_PER_PAGE = 6; // Define how many sessions to load per page


export default function ExpertSessionsPage() {
  const { user, userData, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  const isExpert = userData?.role === 'expert';
  const isApprovedExpert = isExpert && userData?.isExpertApproved === true;

  const [expertSessions, setExpertSessions] = useState<QASession[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination states
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Modals
  const [isCreateEditSessionModalOpen, setIsCreateEditSessionModalOpen] = useState(false);
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  const [isViewRegistrationsModalOpen, setIsViewRegistrationsModalOpen] = useState(false);


  const [submittingSession, setSubmittingSession] = useState(false); // For create/edit
  const [submittingDelete, setSubmittingDelete] = useState(false); // For delete
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);

  // States for new/edit session form
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null); // Null for create, ID for edit
  const [newSessionTitle, setNewSessionTitle] = useState("");
  const [newSessionDate, setNewSessionDate] = useState<Date | undefined>(undefined);
  const [newSessionStartHour, setNewSessionStartHour] = useState<string>('');
  const [newSessionStartMinute, setNewSessionStartMinute] = useState<string>('');
  const [newSessionStartAmPm, setNewSessionStartAmPm] = useState<"AM" | "PM">('AM');
  const [newSessionEndHour, setNewSessionEndHour] = useState<string>('');
  const [newSessionEndMinute, setNewSessionEndMinute] = useState<string>('');
  const [newSessionEndAmPm, setNewSessionEndAmPm] = useState<"AM" | "PM">('PM');
  const [newSessionDescription, setNewSessionDescription] = useState("");
  const [newSessionTags, setNewSessionTags] = useState(""); // Comma-separated
  const [newSessionRegistrationLink, setNewSessionRegistrationLink] = useState("");

  const [expertPersonalData, setExpertPersonalData] = useState<ExpertPersonalProfile | null>(null);
  const [selectedSessionRegistrations, setSelectedSessionRegistrations] = useState<Registration[]>([]);
  const [sessionToDelete, setSessionToDelete] = useState<QASession | null>(null); // To store session being deleted

  // Function to fetch expert data and sessions (now with pagination)
  const fetchExpertDataAndSessions = useCallback(async (lastDoc: QueryDocumentSnapshot<DocumentData> | null, append: boolean = false) => {
    setPageLoading(true);
    setError(null);
    try {
      const expertUid = user?.uid;
      if (!expertUid) {
        setError("Expert UID not found. Cannot fetch sessions.");
        setPageLoading(false);
        return;
      }

      let fetchedExpertProfile: ExpertPersonalProfile | null = null;
      try {
        const expertDocRef = doc(db, "experts", expertUid);
        const expertDocSnap = await getDoc(expertDocRef);

        if (expertDocSnap.exists()) {
          fetchedExpertProfile = expertDocSnap.data() as ExpertPersonalProfile;
          setExpertPersonalData(fetchedExpertProfile);
        } else {
          console.warn("Expert profile not found in 'experts' collection for UID:", expertUid);
          setError("Your detailed expert profile is incomplete. Please contact support to set up your expert profile.");
          setPageLoading(false);
          return;
        }
      } catch (profileError: any) {
        console.error("Error fetching expert personal profile:", profileError);
        setError(`Failed to load expert profile: ${profileError.message || "Unknown error."}`);
        setPageLoading(false);
        return;
      }

      try {
        let qaSessionsRef = collection(db, "qASessions");
        let q = query(
          qaSessionsRef,
          where("expertId", "==", expertUid),
          orderBy("createdAt", "desc")
        );

        if (lastDoc) {
          q = query(q, startAfter(lastDoc));
        }

        q = query(q, limit(ITEMS_PER_PAGE)); // Apply limit for pagination

        const querySnapshot = await getDocs(q);

        const sessionsList: QASession[] = await Promise.all(querySnapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          const sessionDate = data.date instanceof Timestamp ? format(data.date.toDate(), 'MMM dd,yyyy') : data.date;

          // Dynamically get the count of registered students from the subcollection
          const registrationsSnapshot = await getDocs(collection(db, `qASessions/${docSnap.id}/registrations`));
          const registeredStudentsCount = registrationsSnapshot.size;

          console.log(`Fetching registrations for session ${docSnap.id}: ${registeredStudentsCount} students.`);

          return {
            id: docSnap.id,
            ...data,
            date: sessionDate,
            attendees: registeredStudentsCount,
          } as QASession;
        }));

        setExpertSessions((prevSessions) => (append ? [...prevSessions, ...sessionsList] : sessionsList));
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1] || null);
        setHasMore(sessionsList.length === ITEMS_PER_PAGE);

      } catch (sessionsError: any) {
          console.error("Error fetching Q&A sessions:", sessionsError);
          if (sessionsError.code === 'failed-precondition' && sessionsError.message.includes("The query requires an index.")) {
              setError(`Failed to load your Q&A sessions: A Firestore index is missing. Check your browser console for a link to create it.`);
          } else {
              setError(`Failed to load your Q&A sessions: ${sessionsError.message || "Unknown error."} Please check your Firestore rules and data.`);
          }
          setPageLoading(false);
          return;
      }

    } catch (overallError: any) {
      console.error("Overall error during data fetching:", overallError);
      setError(`An unexpected error occurred during data fetching: ${overallError.message || "Unknown error."} Please try again.`);
    } finally {
      setPageLoading(false);
    }
  }, [user?.uid, userData]); // Added user?.uid and userData to dependencies

  // Initial fetch on component mount and auth state changes
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }
      if (!isExpert || !isApprovedExpert) {
        router.push("/dashboard");
        return;
      }
      if (!userData) {
          setError("User profile data not loaded. Please try refreshing.");
          setPageLoading(false);
          return;
      }
      // Initial fetch of sessions (not appending, no lastDoc)
      fetchExpertDataAndSessions(null, false);
    }
  }, [authLoading, isAuthenticated, isExpert, isApprovedExpert, userData, router, fetchExpertDataAndSessions]);


  const isSessionUpcoming = (session: QASession) => {
    const startTimePart = session.time.split(" - ")[0];
    const sessionDateTime = new Date(`${session.date} ${startTimePart}`);
    const now = new Date();
    return sessionDateTime > now;
  };

  // Helper function to reset form states
  const resetForm = () => {
    setCurrentSessionId(null);
    setNewSessionTitle("");
    setNewSessionDate(undefined);
    setNewSessionStartHour('');
    setNewSessionStartMinute('');
    setNewSessionStartAmPm('AM');
    setNewSessionEndHour('');
    setNewSessionEndMinute('');
    setNewSessionEndAmPm('PM');
    setNewSessionDescription("");
    setNewSessionTags("");
    setNewSessionRegistrationLink("");
    setError(null);
  };

  // --- CREATE/EDIT SESSION LOGIC ---
  const handleOpenCreateSessionModal = () => {
    resetForm();
    setIsCreateEditSessionModalOpen(true);
  };

  const handleOpenEditSessionModal = (session: QASession) => {
    setCurrentSessionId(session.id);
    setNewSessionTitle(session.title);
    setNewSessionDate(new Date(session.date));
    setNewSessionDescription(session.description);
    setNewSessionTags(session.tags.join(', '));
    setNewSessionRegistrationLink(session.registrationLink || "");

    const [startTime, endTime] = session.time.split(' - ');
    const [startHourStr, startMinuteStr, startAmPm] = startTime.split(/:|\s/);
    const [endHourStr, endMinuteStr, endAmPm] = endTime.split(/:|\s/);

    setNewSessionStartHour(startHourStr);
    setNewSessionStartMinute(startMinuteStr);
    setNewSessionStartAmPm(startAmPm as "AM" | "PM");
    setNewSessionEndHour(endHourStr);
    setNewSessionEndMinute(endMinuteStr);
    setNewSessionEndAmPm(endAmPm as "AM" | "PM");

    setIsCreateEditSessionModalOpen(true);
  };


  const handleSubmitSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingSession(true);
    setError(null);

    const formattedStartTime = `${newSessionStartHour.padStart(2, '0')}:${newSessionStartMinute.padStart(2, '0')} ${newSessionStartAmPm}`;
    const formattedEndTime = `${newSessionEndHour.padStart(2, '0')}:${newSessionEndMinute.padStart(2, '0')} ${newSessionEndAmPm}`;
    const fullSessionTime = `${formattedStartTime} - ${formattedEndTime}`;

    if (!user?.uid || !expertPersonalData) {
        setError("User or expert profile data is missing. Cannot proceed.");
        setSubmittingSession(false);
        return;
    }
    if (!newSessionTitle || !newSessionDate || !newSessionDescription || !newSessionStartHour || !newSessionStartMinute || !newSessionStartAmPm || !newSessionEndHour || !newSessionEndMinute || !newSessionEndAmPm) {
        setError("Please fill in all required session fields, including complete start and end times.");
        setSubmittingSession(false);
        return;
    }

    const startDate = new Date(newSessionDate!);
    const [startHr, startMin] = [parseInt(newSessionStartHour), parseInt(newSessionStartMinute)];
    const [endHr, endMin] = [parseInt(newSessionEndHour), parseInt(newSessionEndMinute)];

    let actualStartHr = startHr;
    if (newSessionStartAmPm === 'PM' && actualStartHr !== 12) actualStartHr += 12;
    if (newSessionStartAmPm === 'AM' && actualStartHr === 12) actualStartHr = 0;

    let actualEndHr = endHr;
    if (newSessionEndAmPm === 'PM' && actualEndHr !== 12) actualEndHr += 12;
    if (newSessionEndAmPm === 'AM' && actualEndHr === 12) actualEndHr = 0;

    const startDateTime = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), actualStartHr, startMin);
    const endDateTime = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), actualEndHr, endMin);

    if (startDateTime >= endDateTime) {
        setError("End time must be after start time.");
        setSubmittingSession(false);
        return;
    }


    try {
      const formattedDate = format(newSessionDate!, 'MMM dd,yyyy');
      const tagsArray = newSessionTags.split(',').map(tag => tag.trim()).filter(tag => tag);

      const sessionInitials = expertPersonalData.initials ||
                              ((userData?.firstName?.[0] || '') + (userData?.lastName?.[0] || '')).toUpperCase() ||
                              'EX';
      const sessionColor = expertPersonalData.color || '#60A5FA';

      const commonSessionData = {
        expertId: user!.uid,
        title: newSessionTitle,
        trainer: expertPersonalData.name || `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim() || 'Unknown Expert',
        date: formattedDate,
        time: fullSessionTime,
        tags: tagsArray,
        initials: sessionInitials,
        color: sessionColor,
        description: newSessionDescription,
        registrationLink: newSessionRegistrationLink.trim() === "" ? null : newSessionRegistrationLink,
      };

      if (currentSessionId) {
        const sessionRef = doc(db, "qASessions", currentSessionId);
        await updateDoc(sessionRef, { ...commonSessionData });
        toast.success("Q&A session updated successfully!");
      } else {
        await addDoc(collection(db, "qASessions"), {
          ...commonSessionData,
          attendees: 0,
          createdAt: Timestamp.now(),
          recordingLink: null,
        });
        toast.success("New Q&A session created successfully!");
      }

      setIsCreateEditSessionModalOpen(false);
      resetForm();

      // After create/edit, re-fetch the first page of sessions to reflect changes
      setLastVisible(null); // Reset pagination
      setHasMore(true);
      fetchExpertDataAndSessions(null, false);


    } catch (err: any) {
      console.error("Error creating/updating session:", err);
      setError(`Failed to save session: ${err.message || "Unknown error."}`);
      toast.error(`Failed to save session: ${err.message || "Unknown error."}`);
    } finally {
      setSubmittingSession(false);
    }
  };


  // --- DELETE SESSION LOGIC ---
  const handleDeleteSession = (session: QASession) => {
    setSessionToDelete(session);
    setIsConfirmDeleteModalOpen(true);
  };

  const confirmDeleteSession = async () => {
    if (!sessionToDelete || !user?.uid || user.uid !== sessionToDelete.expertId) {
      toast.error("Unauthorized or invalid request to delete session.");
      setIsConfirmDeleteModalOpen(false);
      return;
    }

    setSubmittingDelete(true);
    try {
      const batch = writeBatch(db);
      const sessionDocRef = doc(db, "qASessions", sessionToDelete.id);

      const registrationsRef = collection(sessionDocRef, "registrations");
      const registrationsSnapshot = await getDocs(registrationsRef);
      registrationsSnapshot.docs.forEach((regDoc) => {
        batch.delete(regDoc.ref);
      });

      batch.delete(sessionDocRef);

      await batch.commit();

      // Update local state by filtering out the deleted session
      setExpertSessions(prevSessions => prevSessions.filter(s => s.id !== sessionToDelete.id));
      toast.success("Session and all its registrations deleted successfully!");
      setIsConfirmDeleteModalOpen(false);
      setSessionToDelete(null);
      // Re-fetch to ensure pagination state is consistent after deletion
      setLastVisible(null);
      setHasMore(true);
      fetchExpertDataAndSessions(null, false);
    } catch (err: any) {
      console.error("Error deleting session:", err);
      toast.error(`Failed to delete session: ${err.message || "Unknown error."}`);
    } finally {
      setSubmittingDelete(false);
    }
  };


  // --- VIEW REGISTRATIONS LOGIC ---
  const handleViewRegistrations = async (sessionId: string) => {
    setLoadingRegistrations(true);
    setSelectedSessionRegistrations([]);
    try {
      const registrationsRef = collection(db, `qASessions/${sessionId}/registrations`);
      const q = query(registrationsRef, orderBy('registeredAt', 'asc'));
      const snapshot = await getDocs(q);

      const registrationsList: Registration[] = snapshot.docs.map(docSnapshot => ({
        id: docSnapshot.id,
        ...docSnapshot.data() as Omit<Registration, 'id'>,
        registeredAt: docSnapshot.data().registeredAt
      }));
      setSelectedSessionRegistrations(registrationsList);
      setIsViewRegistrationsModalOpen(true);
    } catch (err: any) {
      console.error("Error fetching registrations:", err);
      toast.error(`Failed to fetch registrations: ${err.message || "Unknown error."}`);
    } finally {
      setLoadingRegistrations(false);
    }
  };

  const copyEmailsToClipboard = () => {
    const emails = selectedSessionRegistrations.map(reg => reg.userEmail).join(', ');
    if (emails) {
      const textArea = document.createElement("textarea");
      textArea.value = emails;
      // Make the textarea invisible and outside the viewport
      textArea.style.position = "fixed";
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.width = "2em";
      textArea.style.height = "2em";
      textArea.style.padding = "0";
      textArea.style.border = "none";
      textArea.style.outline = "none";
      textArea.style.boxShadow = "none";
      textArea.style.background = "transparent";
      textArea.style.opacity = "0"; // Ensure it's invisible

      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      let successful = false;
      try {
        console.log("Attempting to copy emails...");
        successful = document.execCommand('copy');
        console.log("document.execCommand('copy') result:", successful);
      } catch (err) {
        console.error("Failed to copy emails using execCommand:", err);
        successful = false;
      } finally {
        document.body.removeChild(textArea); // Always remove the textarea
      }

      if (successful) {
        toast.success("Emails copied to clipboard!");
      } else {
        toast.error("Failed to copy emails to clipboard. Please try manually.");
      }
    } else {
      toast.info("No emails to copy.");
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !pageLoading) {
      fetchExpertDataAndSessions(lastVisible, true);
    }
  };

  // Filter sessions based on upcoming/past status
  const upcomingSessions = expertSessions.filter(isSessionUpcoming);
  const pastSessions = expertSessions.filter((session) => !isSessionUpcoming(session));


  if (authLoading || pageLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="ml-2 text-lg">Loading expert sessions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8 px-4 text-center text-red-500">
        <p>{error}</p>
        <Button onClick={() => router.push('/dashboard')} className="mt-4">Go to Dashboard</Button>
      </div>
    );
  }

  if (!isExpert || !isApprovedExpert) {
      return (
          <div className="container py-8 px-4 text-center text-red-500">
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="mb-4">You do not have access to this page or your expert account is not yet approved.</p>
              <p>Please wait for administrator approval to access expert actions.</p>
              <Button onClick={() => router.push('/dashboard')} className="mt-4">Go to Dashboard</Button>
          </div>
      );
  }

  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1));
  const minutes = ['00', '15', '30', '45'];


  return (
    <div className="container py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col items-start gap-2">
          <Link href="/experts/dashboard" passHref>
            <Button variant="ghost" className="text-muted-foreground hover:text-primary">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">My Q&A Sessions</h1>
        </div>
        <Button onClick={handleOpenCreateSessionModal} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Create New Session
        </Button>
      </div>

      <Tabs defaultValue="upcoming" className="mb-8">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="upcoming">Upcoming Sessions ({upcomingSessions.length})</TabsTrigger>
          <TabsTrigger value="past">Past Sessions ({pastSessions.length})</TabsTrigger>
        </TabsList>

        {/* Upcoming Sessions Tab Content */}
        <TabsContent value="upcoming" className="mt-0">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingSessions.length > 0 ? (
              upcomingSessions.map((session) => (
                <Card
                  key={session.id}
                  className="overflow-hidden hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <Avatar className="w-16 h-16">
                        <AvatarFallback
                          style={{ backgroundColor: session.color || '#60A5FA' }}
                          className={`text-white text-xl font-bold`}
                        >
                          {session.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{session.title}</CardTitle>
                        <CardDescription>with {session.trainer}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {session.description}
                    </p>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{session.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{session.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{session.attendees} students registered</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-4">
                        {session.tags.map((tag, i) => (
                          <Badge key={i} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-wrap justify-end gap-2 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewRegistrations(session.id)}
                      disabled={loadingRegistrations}
                    >
                      {loadingRegistrations ? (
                        <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading... </>
                      ) : (
                        <> <List className="mr-2 h-4 w-4" /> View Registrations </>
                      )}
                    </Button>
                    {(user?.uid === session.expertId) && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => handleOpenEditSessionModal(session)}>
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteSession(session)} disabled={submittingDelete}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </Button>
                      </>
                    )}
                  </CardFooter>
                </Card>
              ))
            ) : (
              <p className="md:col-span-3 text-center text-muted-foreground">
                No upcoming sessions found.
              </p>
            )}
          </div>
        </TabsContent>

        {/* Past Sessions Tab Content */}
        <TabsContent value="past" className="mt-0">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastSessions.length > 0 ? (
              pastSessions.map((session) => (
                <Card
                  key={session.id}
                  className="overflow-hidden hover:shadow-md transition-shadow opacity-70"
                >
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <Avatar className="w-16 h-16">
                        <AvatarFallback
                          style={{ backgroundColor: session.color || '#60A5FA' }}
                          className={`text-white text-xl font-bold`}
                        >
                          {session.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{session.title}</CardTitle>
                        <CardDescription>with {session.trainer}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {session.description}
                    </p>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{session.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{session.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{session.attendees} students registered</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-4">
                        {session.tags.map((tag, i) => (
                          <Badge key={i} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-wrap justify-end gap-2 pt-4">
                    {session.recordingLink ? (
                      <Button variant="outline" asChild>
                        <Link href={session.recordingLink}>Watch Recording</Link>
                      </Button>
                    ) : (
                      <Button variant="outline" disabled>
                        Recording Not Available
                      </Button>
                    )}
                     {(user?.uid === session.expertId) && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => handleOpenEditSessionModal(session)}>
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteSession(session)} disabled={submittingDelete}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </Button>
                      </>
                    )}
                  </CardFooter>
                </Card>
              ))
            ) : (
              <p className="md:col-span-3 text-center text-muted-foreground">
                No past sessions found.
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {hasMore && (
        <div className="flex justify-center mt-8">
          <Button onClick={handleLoadMore} disabled={pageLoading} variant="outline">
            {pageLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading More...
              </>
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}

      {/* Create/Edit Session Modal */}
      <Dialog open={isCreateEditSessionModalOpen} onOpenChange={setIsCreateEditSessionModalOpen}>
        <DialogContent className="sm:max-w-[420px] p-4">
          <DialogHeader className="mb-4">
            <DialogTitle>{currentSessionId ? "Edit Q&A Session" : "Create New Q&A Session"}</DialogTitle>
            <DialogDescription>
              {currentSessionId ? "Update the details of your session." : "Fill in the details for your upcoming Q&A session."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitSession} className="grid gap-y-3 gap-x-2">
            {error && <p className="text-red-500 text-sm mb-2 col-span-full">{error}</p>}

            {/* Title */}
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-y-1 gap-x-2 col-span-full">
              <Label htmlFor="title" className="md:text-right text-left text-sm">
                Title
              </Label>
              <Input
                id="title"
                value={newSessionTitle}
                onChange={(e) => setNewSessionTitle(e.target.value)}
                className="md:col-span-3 h-9 text-sm"
                required
              />
            </div>

            {/* Date */}
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-y-1 gap-x-2 col-span-full">
              <Label htmlFor="date" className="md:text-right text-left text-sm">
                Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "md:col-span-3 justify-start text-left font-normal w-full h-9 text-sm",
                      !newSessionDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newSessionDate ? format(newSessionDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={newSessionDate}
                    onSelect={setNewSessionDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Start Time */}
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-y-1 gap-x-2 col-span-full">
                <Label htmlFor="startTime" className="md:text-right text-left text-sm">
                    Start Time
                </Label>
                <div className="md:col-span-3 flex items-center gap-2 w-full">
                    <Select value={newSessionStartHour} onValueChange={setNewSessionStartHour} required>
                        <SelectTrigger className="flex-1 min-w-[60px] max-w-[75px] h-9 text-sm">
                            <SelectValue placeholder="HH" />
                        </SelectTrigger>
                        <SelectContent className="max-h-40 overflow-y-auto">
                            {hours.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <span className="font-bold text-sm">:</span>
                    <Select value={newSessionStartMinute} onValueChange={setNewSessionStartMinute} required>
                        <SelectTrigger className="flex-1 min-w-[60px] max-w-[75px] h-9 text-sm">
                            <SelectValue placeholder="MM" />
                        </SelectTrigger>
                        <SelectContent className="max-h-40 overflow-y-auto">
                            {minutes.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={newSessionStartAmPm} onValueChange={(value: "AM" | "PM") => setNewSessionStartAmPm(value)} required>
                        <SelectTrigger className="w-[85px] h-9 text-sm">
                            <SelectValue placeholder="AM/PM" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="AM">AM</SelectItem>
                            <SelectItem value="PM">PM</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* End Time */}
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-y-1 gap-x-2 col-span-full">
                <Label htmlFor="endTime" className="md:text-right text-left text-sm">
                    End Time
                </Label>
                <div className="md:col-span-3 flex items-center gap-2 w-full">
                    <Select value={newSessionEndHour} onValueChange={setNewSessionEndHour} required>
                        <SelectTrigger className="flex-1 min-w-[60px] max-w-[75px] h-9 text-sm">
                            <SelectValue placeholder="HH" />
                        </SelectTrigger>
                        <SelectContent className="max-h-40 overflow-y-auto">
                            {hours.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <span className="font-bold text-sm">:</span>
                    <Select value={newSessionEndMinute} onValueChange={setNewSessionEndMinute} required>
                        <SelectTrigger className="flex-1 min-w-[60px] max-w-[75px] h-9 text-sm">
                            <SelectValue placeholder="MM" />
                        </SelectTrigger>
                        <SelectContent className="max-h-40 overflow-y-auto">
                            {minutes.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={newSessionEndAmPm} onValueChange={(value: "AM" | "PM") => setNewSessionEndAmPm(value)} required>
                        <SelectTrigger className="w-[85px] h-9 text-sm">
                            <SelectValue placeholder="AM/PM" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="AM">AM</SelectItem>
                            <SelectItem value="PM">PM</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Description */}
            <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-y-1 gap-x-2 col-span-full">
              <Label htmlFor="description" className="md:text-right text-left text-sm pt-2">
                Description
              </Label>
              <Textarea
                id="description"
                value={newSessionDescription}
                onChange={(e) => setNewSessionDescription(e.target.value)}
                className="md:col-span-3 min-h-[60px] text-sm"
                required
              />
            </div>

            {/* Tags */}
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-y-1 gap-x-2 col-span-full">
              <Label htmlFor="tags" className="md:text-right text-left text-sm">
                Tags (comma-separated)
              </Label>
              <Input
                id="tags"
                value={newSessionTags}
                onChange={(e) => setNewSessionTags(e.target.value)}
                placeholder="e.g., Aptitude, Data Structures"
                className="md:col-span-3 h-9 text-sm"
              />
            </div>

            {/* Registration Link */}
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-y-1 gap-x-2 col-span-full">
              <Label htmlFor="regLink" className="md:text-right text-left text-sm">
                Registration Link (Optional)
              </Label>
              <Input
                id="regLink"
                value={newSessionRegistrationLink}
                onChange={(e) => setNewSessionRegistrationLink(e.target.value)}
                placeholder="https://example.com/register"
                className="md:col-span-3 h-9 text-sm"
              />
            </div>

            <Button type="submit" disabled={submittingSession} className="mt-4 col-span-full">
              {submittingSession ? (
                <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving... </>
              ) : (
                currentSessionId ? "Save Changes" : "Create Session"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Deletion */}
      <Dialog open={isConfirmDeleteModalOpen} onOpenChange={setIsConfirmDeleteModalOpen}>
        <DialogContent className="p-6">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription className="mt-1">
              Are you sure you want to delete the session "{sessionToDelete?.title}"? This action cannot be undone. All associated registrations will also be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDeleteModalOpen(false)} disabled={submittingDelete}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteSession} disabled={submittingDelete}>
              {submittingDelete ? (
                <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting... </>
              ) : (
                "Delete Session"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Registrations Modal */}
      <Dialog open={isViewRegistrationsModalOpen} onOpenChange={setIsViewRegistrationsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Registered Students</DialogTitle>
            <DialogDescription>
              {selectedSessionRegistrations.length} students have registered.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-[300px] overflow-y-auto custom-scrollbar">
            {selectedSessionRegistrations.length > 0 ? (
              <ul className="space-y-2">
                {selectedSessionRegistrations.map((reg) => (
                  <li key={reg.id} className="flex items-center justify-between text-sm bg-gray-50 dark:bg-gray-700 p-2 rounded-md">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-xs bg-blue-100 text-blue-800">
                          {reg.userName ? reg.userName.charAt(0).toUpperCase() : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{reg.userName || 'Unknown User'}</p>
                        <p className="text-muted-foreground text-xs">{reg.userEmail || 'No email'}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Registered: {reg.registeredAt?.toDate().toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-muted-foreground">No students registered yet.</p>
            )}
          </div>
          <DialogFooter>
            {selectedSessionRegistrations.length > 0 && (
              <Button onClick={copyEmailsToClipboard} size="sm" variant="outline">
                <ClipboardCopy className="mr-2 h-4 w-4" /> Copy All Emails
              </Button>
            )}
            <Button type="button" onClick={() => setIsViewRegistrationsModalOpen(false)} size="sm">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
