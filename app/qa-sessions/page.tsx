// app/qa-sessions/page.tsx
"use client";

import { useState, useEffect } from "react";
// Import your Firestore db instance, and necessary functions
import { db } from "@/app/firebase/firebaseClient";
import {
  collection,
  query,
  orderBy,
  getDocs,
  doc, // Import doc
  updateDoc, // Import updateDoc
  setDoc, // Import setDoc
  getDoc, // Import getDoc
  Timestamp, // Import Timestamp
} from "firebase/firestore";

import { useAuth } from '@/app/context/authContext'; // Import your AuthContext

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
import { Calendar, Clock, Users, Bell, Filter, Search, Loader2 } from "lucide-react"; // Added Loader2
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from 'sonner'; // Assuming you use a toast notification library like Sonner

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

interface QASession {
  id: string;
  title: string;
  trainer: string;
  date: string;
  time: string;
  attendees: number; // This will now represent the count from the 'registrations' subcollection
  tags: string[];
  initials: string;
  color: string;
  description: string;
  registrationLink?: string;
  recordingLink?: string;
  // New field to track if the current user is registered for this session
  isRegistered?: boolean;
}

export default function QASessionsPage() {
  const { user, isAuthenticated, userData } = useAuth(); // Get user and authentication state
  const [sessions, setSessions] = useState<QASession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [registeringSessionId, setRegisteringSessionId] = useState<string | null>(null); // To track which session is being registered

  const currentUserId = user?.uid;
  const currentUserName = userData?.firstName && userData?.lastName
    ? `${userData.firstName} ${userData.lastName}`
    : userData?.firstName || userData?.email || 'Guest';

  useEffect(() => {
    const fetchQASessions = async () => {
      try {
        setLoading(true);
        const qaSessionsCollection = collection(db, "qASessions");
        const q = query(qaSessionsCollection, orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);

        const sessionsList: QASession[] = [];
        const uniqueTags = new Set<string>();

        for (const docSnapshot of querySnapshot.docs) {
          const sessionData = docSnapshot.data() as Omit<QASession, 'id' | 'attendees' | 'isRegistered'>;
          
          // Fetch registrations subcollection count
          const registrationsRef = collection(db, `qASessions/${docSnapshot.id}/registrations`);
          const registrationsSnapshot = await getDocs(registrationsRef);
          const attendeesCount = registrationsSnapshot.size;

          // Check if current user is registered
          let isRegistered = false;
          if (isAuthenticated && currentUserId) {
            const userRegistrationDoc = await getDoc(doc(registrationsRef, currentUserId));
            isRegistered = userRegistrationDoc.exists();
          }

          sessionsList.push({
            id: docSnapshot.id,
            ...sessionData,
            attendees: attendeesCount,
            isRegistered: isRegistered,
          });

          // Collect all tags
          sessionData.tags.forEach(tag => uniqueTags.add(tag));
        }

        console.log("Fetched Sessions from Firestore (Processed Data):", sessionsList);
        setSessions(sessionsList);
        setAllTags(Array.from(uniqueTags).sort());

      } catch (err) {
        console.error("Error fetching Q&A sessions:", err);
        setError("Failed to load Q&A sessions. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchQASessions();
  }, [isAuthenticated, currentUserId]); // Rerun if auth state changes

  const isSessionUpcoming = (session: QASession) => {
    // Robust date parsing (consider using a library like date-fns or moment.js for more complex cases)
    // Assuming session.date is "YYYY-MM-DD" and session.time is "HH:MM AM/PM - HH:MM AM/PM"
    const startTimePart = session.time.split(" - ")[0]; 
    const sessionDateTime = new Date(`${session.date} ${startTimePart}`);
    const now = new Date();

    return sessionDateTime > now;
  };

  const handleRegister = async (session: QASession) => {
    if (!isAuthenticated || !currentUserId) {
      toast.error("Please log in to register for a session.");
      return;
    }
    if (session.isRegistered) {
      toast.info("You are already registered for this session.");
      return;
    }
    if (registeringSessionId === session.id) {
        // Already trying to register for this session
        return;
    }

    setRegisteringSessionId(session.id); // Set the session being registered

    try {
      const registrationDocRef = doc(db, `qASessions/${session.id}/registrations/${currentUserId}`);
      const sessionDocRef = doc(db, 'qASessions', session.id);

      // Check one last time if already registered to prevent race conditions
      const existingRegistration = await getDoc(registrationDocRef);
      if (existingRegistration.exists()) {
        toast.info("You are already registered for this session.");
        setRegisteringSessionId(null);
        // Optionally, update the local state to reflect this if it wasn't caught earlier
        setSessions(prevSessions => prevSessions.map(s => 
            s.id === session.id ? { ...s, isRegistered: true } : s
        ));
        return;
      }

      await setDoc(registrationDocRef, {
        registeredAt: Timestamp.now(),
        userId: currentUserId,
        userName: currentUserName,
        userEmail: userData?.email || 'N/A', // Add user's email if available
      });

      // Atomically increment the attendees count in the main session document (optional but good for denormalization)
      // NOTE: This requires 'attendees' field to exist and be a number in your qASession document initially.
      // If you are relying solely on the subcollection count, you can remove this update.
      // For simplicity, let's just rely on the subcollection size for display.
      // If you want to store a direct `attendees` count on the main document, you'd fetch, increment, and update it.
      // E.g., await updateDoc(sessionDocRef, { attendees: increment(1) }); (requires FieldValue.increment)

      // Update the local state to reflect the registration
      setSessions(prevSessions =>
        prevSessions.map(s =>
          s.id === session.id
            ? { ...s, attendees: s.attendees + 1, isRegistered: true }
            : s
        )
      );

      toast.success(`Successfully registered for "${session.title}"!`);

      // If there's an external registration link, open it after successful Firestore registration
      if (session.registrationLink) {
        window.open(session.registrationLink, '_blank');
      }

    } catch (err) {
      console.error("Error registering for session:", err);
      toast.error("Failed to register. Please try again.");
    } finally {
      setRegisteringSessionId(null); // Clear the registering state
    }
  };

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.trainer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTags =
      selectedTags.length === 0 ||
      session.tags.some((tag) => selectedTags.includes(tag));

    return matchesSearch && matchesTags;
  });

  const upcomingSessions = filteredSessions.filter(isSessionUpcoming);
  const pastSessions = filteredSessions.filter((session) => !isSessionUpcoming(session));

  if (loading) {
    return (
      <div className="container py-8 px-4 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading Q&A sessions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8 px-4 text-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Q&A Sessions</h1>
          <p className="text-muted-foreground">
            Interactive webinars with APT-TECH experts to resolve your doubts in
            real-time
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search sessions..."
              className="pl-8 w-full md:w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filter{" "}
                {selectedTags.length > 0 && `(${selectedTags.length})`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Filter by Tag</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={selectedTags.length === 0}
                onCheckedChange={(checked) => {
                  if (checked) setSelectedTags([]);
                }}
              >
                All Tags
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              {allTags.length > 0 ? (
                allTags.map((tag) => (
                  <DropdownMenuCheckboxItem
                    key={tag}
                    checked={selectedTags.includes(tag)}
                    onCheckedChange={(checked) => {
                      setSelectedTags((prev) =>
                        checked ? [...prev, tag] : prev.filter((t) => t !== tag)
                      );
                    }}
                  >
                    {tag}
                  </DropdownMenuCheckboxItem>
                ))
              ) : (
                <span className="block p-2 text-sm text-muted-foreground">No tags available</span>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs defaultValue="upcoming" className="mb-8">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="upcoming">Upcoming Sessions</TabsTrigger>
          <TabsTrigger value="past">Past Sessions</TabsTrigger>
        </TabsList>

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
                          className={`bg-${session.color}-600 text-white text-xl font-bold`}
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
                        <Calendar className="h-4 w-4" />
                        <span>{session.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{session.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{session.attendees} attending</span> {/* Display updated count */}
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
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/reminders/${session.id}`}>
                        <Bell className="mr-2 h-4 w-4" />
                        Remind Me
                      </Link>
                    </Button>
                    {/* Modified Register Button */}
                    <Button
                      size="sm"
                      onClick={() => handleRegister(session)}
                      disabled={!isAuthenticated || session.isRegistered || registeringSessionId === session.id} // Disable if not logged in, already registered, or currently registering this session
                    >
                        {registeringSessionId === session.id ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registering...
                            </>
                        ) : session.isRegistered ? (
                            "Registered"
                        ) : (
                            "Register Now"
                        )}
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <p className="md:col-span-3 text-center text-muted-foreground">
                No upcoming sessions found matching your criteria.
              </p>
            )}
          </div>
        </TabsContent>

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
                          className={`bg-${session.color}-600 text-white text-xl font-bold`}
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
                        <Calendar className="h-4 w-4" />
                        <span>{session.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{session.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{session.attendees} attended</span>
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
                  <CardFooter className="flex justify-center">
                    {session.recordingLink ? (
                      <Button variant="outline" asChild>
                        <Link href={session.recordingLink}>Watch Recording</Link>
                      </Button>
                    ) : (
                      <Button variant="outline" disabled>
                        Recording Not Available
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))
            ) : (
              <p className="md:col-span-3 text-center text-muted-foreground">
                No past sessions found matching your criteria.
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}