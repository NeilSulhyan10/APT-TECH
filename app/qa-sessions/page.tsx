// app/qa-sessions/page.tsx
"use client"; // This is a client component

import { useState, useEffect } from "react";
import { db } from "@/app/firebase/firebaseClient"; // Import your Firestore db instance
import { collection, query, orderBy, getDocs } from "firebase/firestore"; // Import Firestore functions

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
import { Calendar, Clock, Users, Bell, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Import DropdownMenu components for the filter UI
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

// Define the interface for your Q&A Session data
interface QASession {
  id: string; // Firestore document IDs are strings
  title: string;
  trainer: string;
  // Assume date is in a format parsable by new Date() (e.g., "YYYY-MM-DD", "Month Day, Year")
  date: string;
  // Assume time is in a format like "HH:MM AM/PM - HH:MM AM/PM"
  time: string;
  attendees: number;
  tags: string[];
  initials: string;
  color: string; // e.g., "blue", "green", "purple"
  description: string;
  registrationLink?: string; // Optional, for upcoming sessions
  recordingLink?: string; // Optional, for past sessions
}

export default function QASessionsPage() {
  const [sessions, setSessions] = useState<QASession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(""); // State for search input

  // New states for filter UI
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    const fetchQASessions = async () => {
      try {
        setLoading(true);
        const qaSessionsCollection = collection(db, "qASessions");
        const q = query(qaSessionsCollection, orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);

        const sessionsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as QASession[];

        console.log("Fetched Sessions from Firestore (Raw Data):", sessionsList);
        setSessions(sessionsList);

        // Extract and set all unique tags from the fetched sessions
        const uniqueTags = Array.from(new Set(sessionsList.flatMap((session) => session.tags)));
        setAllTags(uniqueTags.sort()); // Sort tags alphabetically for display
      } catch (err) {
        console.error("Error fetching Q&A sessions:", err);
        setError("Failed to load Q&A sessions. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchQASessions();
  }, []); // Empty dependency array means this runs once on mount

  // Helper function to dynamically determine if a session is upcoming
  const isSessionUpcoming = (session: QASession) => {
    const startTimePart = session.time.split(" - ")[0]; // Extracts "4:00 PM"
    const sessionDateTime = new Date(`${session.date} ${startTimePart}`);
    const now = new Date();

    console.log(`--- Debugging Session: ${session.title} ---`);
    console.log(`  session.date (raw): ${session.date}`);
    console.log(`  session.time (raw): ${session.time}`);
    console.log(`  Extracted Start Time Part: ${startTimePart}`);
    console.log(`  Parsed sessionDateTime: ${sessionDateTime.toLocaleString()}`); // Shows the full parsed date/time object
    console.log(`  Current Date/Time (now): ${now.toLocaleString()}`); // Shows your current machine's date/time
    console.log(`  Is Upcoming (sessionDateTime > now): ${sessionDateTime > now}`);
    console.log(`-----------------------------------------`);

    return sessionDateTime > now;
  };

  // Filter sessions based on search term AND selected tags
  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.trainer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    // If no tags are selected, all sessions match this filter.
    // Otherwise, session must have at least one of the selected tags.
    const matchesTags =
      selectedTags.length === 0 ||
      session.tags.some((tag) => selectedTags.includes(tag));

    return matchesSearch && matchesTags;
  });

  // Then dynamically categorize them into upcoming and past
  const upcomingSessions = filteredSessions.filter(isSessionUpcoming);
  const pastSessions = filteredSessions.filter((session) => !isSessionUpcoming(session));

  console.log("Upcoming Sessions for Display (Final):", upcomingSessions);
  console.log("Past Sessions for Display (Final):", pastSessions);

  if (loading) {
    return (
      <div className="container py-8 px-4 text-center">
        <p>Loading Q&A sessions...</p>
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
          {/* Filter Button with Dropdown Menu */}
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
              {/* Option to clear all tag filters */}
              <DropdownMenuCheckboxItem
                checked={selectedTags.length === 0}
                onCheckedChange={(checked) => {
                  if (checked) setSelectedTags([]); // If 'All Tags' is checked, clear all other selections
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
                    {session.registrationLink ? (
                      <Button size="sm" asChild>
                        <Link href={session.registrationLink}>Register Now</Link>
                      </Button>
                    ) : (
                      <Button size="sm" disabled>
                        Register Now
                      </Button>
                    )}
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