// app/qa-sessions/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
// Import your Firestore db instance, and necessary functions
import { db } from "@/app/firebase/firebaseClient";
import {
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  updateDoc,
  setDoc,
  getDoc,
  Timestamp,
  limit,
  startAfter,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";

import { useAuth } from '@/app/context/authContext';
import { format } from 'date-fns';

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
import { Calendar, Clock, Users, Bell, Filter, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from 'sonner';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

// Removed Dialog imports as the modal functionality is being removed
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";


interface QASession {
  id: string;
  title: string;
  trainer: string;
  date: string;
  time: string;
  attendees: number;
  tags: string[];
  initials: string;
  color: string;
  description: string;
  registrationLink?: string;
  recordingLink?: string;
  createdAt: Timestamp;
  isRegistered?: boolean;
}

const ITEMS_PER_PAGE = 6;

export default function QASessionsPage() {
  const { user, isAuthenticated, userData } = useAuth();
  const [sessions, setSessions] = useState<QASession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [registeringSessionId, setRegisteringSessionId] = useState<string | null>(null);

  // Pagination states
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Removed Session Detail Modal states
  // const [isSessionDetailModalOpen, setIsSessionDetailModalOpen] = useState(false);
  // const [selectedSession, setSelectedSession = useState<QASession | null>(null);


  const currentUserId = user?.uid;
  const currentUserName = userData?.firstName && userData?.lastName
    ? `${userData.firstName} ${userData.lastName}`
    : userData?.firstName || userData?.email || 'Guest';

  // Function to fetch Q&A sessions from Firestore
  const fetchQASessions = useCallback(async (lastDoc: QueryDocumentSnapshot<DocumentData> | null, append: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      const qaSessionsCollection = collection(db, "qASessions");
      let q = query(qaSessionsCollection, orderBy("createdAt", "desc"));

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      q = query(q, limit(ITEMS_PER_PAGE));

      const querySnapshot = await getDocs(q);

      const sessionsList: QASession[] = [];
      const uniqueTags = new Set<string>();

      for (const docSnapshot of querySnapshot.docs) {
        const rawData = docSnapshot.data();

        const sessionDate = rawData.date instanceof Timestamp
          ? format(rawData.date.toDate(), 'MMM dd,yyyy')
          : rawData.date;

        const registrationsRef = collection(db, `qASessions/${docSnapshot.id}/registrations`);
        const registrationsSnapshot = await getDocs(registrationsRef);
        const attendeesCount = registrationsSnapshot.size;

        let isRegistered = false;
        if (isAuthenticated && currentUserId) {
          const userRegistrationDoc = await getDoc(doc(registrationsRef, currentUserId));
          isRegistered = userRegistrationDoc.exists();
        }

        sessionsList.push({
          id: docSnapshot.id,
          title: rawData.title,
          trainer: rawData.trainer,
          date: sessionDate,
          time: rawData.time,
          attendees: attendeesCount,
          tags: rawData.tags || [],
          initials: rawData.initials,
          color: rawData.color,
          description: rawData.description,
          registrationLink: rawData.registrationLink,
          recordingLink: rawData.recordingLink,
          createdAt: rawData.createdAt,
          isRegistered: isRegistered,
        });

        (rawData.tags || []).forEach((tag: string) => uniqueTags.add(tag));
      }

      console.log("Fetched Sessions from Firestore (Raw Query Result Count):", sessionsList.length);
      setSessions((prevSessions) => (append ? [...prevSessions, ...sessionsList] : sessionsList));
      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1] || null);
      setHasMore(sessionsList.length === ITEMS_PER_PAGE);
      console.log("Has More (after fetch):", sessionsList.length === ITEMS_PER_PAGE);

      setAllTags(Array.from(uniqueTags).sort());

    } catch (err) {
      console.error("Error fetching Q&A sessions:", err);
      setError("Failed to load Q&A sessions. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, currentUserId]);

  useEffect(() => {
    fetchQASessions(null, false);
  }, [fetchQASessions]);

  const isSessionUpcoming = (session: QASession) => {
    const startTimePart = session.time.split(" - ")[0];
    const sessionDateTime = new Date(`${session.date} ${startTimePart}`);
    const now = new Date();

    return sessionDateTime > now;
  };

  const handleRegister = async (session: QASession) => {
    console.log("handleRegister: isAuthenticated:", isAuthenticated);
    console.log("handleRegister: currentUserId:", currentUserId);

    if (!isAuthenticated || !currentUserId) {
      console.log("handleRegister: Condition !isAuthenticated || !currentUserId is:", !isAuthenticated || !currentUserId);
      console.log("handleRegister: Displaying login toast.");
      toast.error("Please log in to register for a session.");
      return;
    }
    if (session.isRegistered) {
      toast.info("You are already registered for this session.");
      return;
    }
    if (registeringSessionId === session.id) {
        return;
    }

    setRegisteringSessionId(session.id);

    try {
      const registrationDocRef = doc(db, `qASessions/${session.id}/registrations/${currentUserId}`);

      const existingRegistration = await getDoc(registrationDocRef);
      if (existingRegistration.exists()) {
        toast.info("You are already registered for this session.");
        setRegisteringSessionId(null);
        setSessions(prevSessions => prevSessions.map(s =>
            s.id === session.id ? { ...s, isRegistered: true } : s
        ));
        return;
      }

      await setDoc(registrationDocRef, {
        registeredAt: Timestamp.now(),
        userId: currentUserId,
        userName: currentUserName,
        userEmail: userData?.email || 'N/A',
      });

      setSessions(prevSessions =>
        prevSessions.map(s =>
          s.id === session.id
            ? { ...s, attendees: s.attendees + 1, isRegistered: true }
            : s
        )
      );

      toast.success(`Successfully registered for "${session.title}"!`);

      if (session.registrationLink) {
        window.open(session.registrationLink, '_blank');
      }

    } catch (err) {
      console.error("Error registering for session:", err);
      toast.error("Failed to register. Please try again.");
    } finally {
      setRegisteringSessionId(null);
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

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchQASessions(lastVisible, true);
    }
  };

  const handleTabChange = (value: string) => {
    setSessions([]);
    setLastVisible(null);
    setHasMore(true);
    setSearchTerm("");
    setSelectedTags([]);
    fetchQASessions(null, false);
  };

  // Removed Session Detail Modal Handlers
  // const handleOpenSessionDetail = (session: QASession) => {
  //   console.log("handleOpenSessionDetail: Session clicked:", { id: session.id, title: session.title });
  //   setSelectedSession(session);
  //   console.log("handleOpenSessionDetail: selectedSession state after set:", { id: session.id, title: session.title }); // Log after set
  //   setIsSessionDetailModalOpen(true);
  // };

  // const handleCloseSessionDetail = () => {
  //   setIsSessionDetailModalOpen(false);
  //   setSelectedSession(null); // Clear selected session when modal closes
  // };


  // Log current state lengths for debugging
  useEffect(() => {
    console.log("Total Sessions in state:", sessions.length);
    console.log("Upcoming Sessions displayed:", upcomingSessions.length);
    console.log("Past Sessions displayed:", pastSessions.length);
  }, [sessions, upcomingSessions, pastSessions]);


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

      <Tabs defaultValue="upcoming" className="mb-8" onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="upcoming">Upcoming Sessions ({upcomingSessions.length})</TabsTrigger>
          <TabsTrigger value="past">Past Sessions ({pastSessions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-0">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingSessions.length > 0 ? (
              upcomingSessions.map((session) => (
                <Card
                  key={session.id}
                  className="overflow-hidden hover:shadow-md transition-shadow" // Removed cursor-pointer and onClick
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
                        <Calendar className="h-4 w-4" />
                        <span>{session.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{session.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{session.attendees} attending</span>
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
                    <Button
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); handleRegister(session); }}
                      // Removed !isAuthenticated from disabled condition here
                      disabled={session.isRegistered || registeringSessionId === session.id}
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
                  className="overflow-hidden hover:shadow-md transition-shadow opacity-70" // Removed cursor-pointer and onClick
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

      {hasMore && (
        <div className="flex justify-center mt-8">
          <Button onClick={handleLoadMore} disabled={loading} variant="outline">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading More...
              </>
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}

      {/* Removed Session Detail Modal */}
      {/* <Dialog open={isSessionDetailModalOpen} onOpenChange={handleCloseSessionDetail}>
        <DialogContent className="sm:max-w-[500px] p-6">
          {selectedSession && (
            <>
              {console.log("Session Detail Modal: Rendering with selectedSession:", { id: selectedSession.id, title: selectedSession.title })}
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">{selectedSession.title}</DialogTitle>
                <DialogDescription className="mt-1">
                  with {selectedSession.trainer}
                </DialogDescription>
              </DialogHeader>

              <div className="my-4 space-y-3">
                <p className="text-sm text-muted-foreground">{selectedSession.description}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{selectedSession.date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{selectedSession.time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{selectedSession.attendees} attending</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {selectedSession.tags.map((tag, i) => (
                    <Badge key={i} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex justify-between mt-4">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/reminders/${selectedSession.id}`}>
                    <Bell className="mr-2 h-4 w-4" />
                    Remind Me
                  </Link>
                </Button>
                {isSessionUpcoming(selectedSession) ? (
                  <Button
                    size="sm"
                    onClick={() => handleRegister(selectedSession)}
                    disabled={!isAuthenticated || selectedSession.isRegistered || registeringSessionId === selectedSession.id}
                  >
                      {registeringSessionId === selectedSession.id ? (
                          <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registering...
                          </>
                      ) : selectedSession.isRegistered ? (
                          "Registered"
                      ) : (
                          "Register Now"
                      )}
                  </Button>
                ) : (
                  selectedSession.recordingLink ? (
                    <Button variant="outline" asChild>
                      <Link href={selectedSession.recordingLink}>Watch Recording</Link>
                    </Button>
                  ) : (
                    <Button variant="outline" disabled>
                      Recording Not Available
                    </Button>
                  )
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog> */}
    </div>
  );
}
