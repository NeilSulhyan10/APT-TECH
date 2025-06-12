// app/experts/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { db } from "@/app/firebase/firebaseClient";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  Timestamp,
  orderBy,
} from "firebase/firestore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input"; // Kept if you still use it, otherwise remove
import { Textarea } from "@/components/ui/textarea";
import {
  Mail,
  Calendar,
  Video,
  Star,
  Clock,
  Users,
  ArrowLeft,
} from "lucide-react"; // Combined imports
import Link from "next/link";
import GhibliAvatar from "@/components/ghibli-avatar";
import { useAuth } from "@/app/context/authContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define your interfaces
interface Expert {
  id: string;
  name: string;
  role: string;
  experience: string;
  description: string;
  tags: string[];
  color: string;
  bio: string;
  initials: string;
  rating?: number;
  students?: number;
  sessions?: number;
  resources?: number;
}

interface Testimonial {
  id: string;
  expertId: string;
  studentName: string; // Corrected to match Firestore field name
  college?: string;
  text: string;
  rating: number;
  date: string; // Will store as ISO string after conversion from Timestamp
  initials?: string; // Made optional, if not consistently provided by student
  studentAvatarUrl?: string; // Optional, if you store/generate this
}

// Consolidated QASession interface (from qa-sessions branch)
interface QASession {
  id: string;
  expertId: string; // Important for linking
  title: string;
  trainer: string; // Needed for display in session cards
  date: string; // e.g., "May 5, 2023"
  time: string; // e.g., "04:00 PM - 05:30 PM"
  attendees: number;
  tags: string[];
  initials: string; // From expert or session data
  color: string; // From expert or session data
  description: string;
  registrationLink?: string;
  recordingLink?: string;
}

export default function ExpertProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const [expert, setExpert] = useState<Expert | null>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  // Use a single state for all Q&A sessions, then filter for display
  const [qASessions, setQASessions] = useState<QASession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userData, isAuthenticated } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [testimonialText, setTestimonialText] = useState("");
  const [testimonialRating, setTestimonialRating] = useState(5); // Initialize with 5 stars
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchExpertData = async () => {
      try {
        // 1. Fetch expert details
        const expertDocRef = doc(db, "experts", id);
        const expertDocSnap = await getDoc(expertDocRef);

        if (expertDocSnap.exists()) {
          const expertData = {
            id: expertDocSnap.id,
            ...expertDocSnap.data(),
          } as Expert;
          setExpert(expertData);

          // 2. Fetch testimonials for this expert (assuming top-level collection with expertId)
          const testimonialSnap = await getDocs(
            query(
              collection(db, "testimonials"),
              where("expertId", "==", id),
              orderBy("date", "desc") // Order by date for testimonials
            )
          );
          setTestimonials(
            testimonialSnap.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
              date: doc.data().date?.toDate().toISOString(), // Convert Timestamp to ISO string
            })) as Testimonial[]
          );

          // 3. Fetch Q&A Sessions for this expert
          const qaSessionsCollection = collection(db, "qASessions");
          const qSessions = query(
            qaSessionsCollection,
            where("expertId", "==", id), // Filter by expertId
            orderBy("date", "desc") // Order by date for sessions
          );
          const sessionSnapshot = await getDocs(qSessions);
          const sessionsList = sessionSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as QASession[];
          setQASessions(sessionsList);
        } else {
          setError("Expert not found.");
        }
      } catch (err) {
        console.error("Error fetching expert data:", err);
        setError("Failed to load expert profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchExpertData();
  }, [id]); // Re-run effect if the expert ID changes

  // Helper function to dynamically determine if a session is upcoming (re-used from qa-sessions page)
  const isSessionUpcoming = (session: QASession) => {
    const startTimePart = session.time.split(" - ")[0]; // Extracts "4:00 PM"
    const sessionDateTime = new Date(`${session.date} ${startTimePart}`);
    const now = new Date();

    return sessionDateTime > now;
  };

  // Filter Q&A sessions into upcoming and past based on date
  const upcomingQASessions = qASessions.filter(isSessionUpcoming);
  const pastQASessions = qASessions.filter((session) => !isSessionUpcoming(session));


  const addTestimonial = async () => {
    // Assuming testimonials are a top-level collection
    const ref = collection(db, "testimonials");

    // Get current user's name/initials for the testimonial
    const studentName = (userData?.firstName && userData?.lastName) ? `${userData.firstName} ${userData.lastName}` : userData?.firstName || userData?.lastName || "Anonymous";
    const studentInitials = studentName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);


    const newTestimonial = {
      expertId: expert?.id, // Link testimonial to the expert
      studentName: studentName, // Corrected: Use studentName key
      text: testimonialText,
      rating: testimonialRating,
      date: Timestamp.now(), // Store as Firestore Timestamp
      initials: studentInitials,
      // studentAvatarUrl: userData?.profilePicUrl, // If you store user profile pics
    };

    try {
      setSubmitting(true);
      const docRef = await addDoc(ref, newTestimonial);

      setTestimonials((prev) => [
        {
          id: docRef.id,
          ...newTestimonial,
          date: new Date().toISOString(), // Use current date for immediate UI update in ISO format
        } as Testimonial,
        ...prev, // Add new testimonial to the top for immediate visibility
      ]);

      setTestimonialText("");
      setTestimonialRating(5); // Reset rating to 5
      setIsModalOpen(false); // Close modal on successful submission
    } catch (err) {
      console.error("Error adding testimonial:", err);
      setError("Failed to add testimonial. Please try again."); // Set a user-friendly error
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="container py-8 px-4 text-center">
        Loading expert profile...
      </div>
    );
  if (error)
    return (
      <div className="container py-8 px-4 text-center text-red-500">
        {error}
      </div>
    );
  if (!expert)
    return (
      <div className="container py-8 px-4 text-center">
        Expert data could not be loaded.
      </div>
    );

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Back to Experts button */}
      <div className="mb-6">
        <Link href="/experts" passHref>
          <Button variant="ghost" className="text-muted-foreground hover:text-primary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Experts
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card className="overflow-hidden">
            <div
              className={`h-48 bg-${expert.color}-500 relative flex items-center justify-center`}
            >
              <GhibliAvatar
                initials={expert.initials}
                color={expert.color}
                size="xl"
                className="border-4 border-white shadow-lg"
              />
            </div>
            <CardHeader className="text-center pt-20">
              <CardTitle className="text-3xl font-bold">{expert.name}</CardTitle>
              <CardDescription
                className={`text-${expert.color}-600 dark:text-${expert.color}-400 text-lg`}
              >
                {expert.role} | {expert.experience}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-6 pb-6">
              <div>
                <h4 className="text-xl font-semibold mb-2">
                  About {expert.name.split(" ")[0]}
                </h4>
                <p className="text-muted-foreground leading-relaxed">
                  {expert.bio}
                </p>
              </div>
              <Separator />
              <div>
                <h4 className="text-xl font-semibold mb-2">Expertise</h4>
                <div className="flex flex-wrap gap-2">
                  {expert.tags.map((tag, i) => (
                    <Badge key={i} variant="secondary" className="px-3 py-1 text-base">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="text-xl font-semibold mb-2">
                  Connect & Schedule
                </h4>
                <div className="flex space-x-4 justify-center">
                  <Link href={`/contact/${expert.id}?type=email`}>
                    <Button variant="outline" size="lg" className="rounded-full h-12 w-12">
                      <Mail className="h-6 w-6" />
                    </Button>
                  </Link>
                  <Link href={`/schedule/${expert.id}`}>
                    <Button variant="outline" size="lg" className="rounded-full h-12 w-12">
                      <Calendar className="h-6 w-6" />
                    </Button>
                  </Link>
                  <Link href={`/sessions/${expert.id}`}>
                    <Button variant="outline" size="lg" className="rounded-full h-12 w-12">
                      <Video className="h-6 w-6" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-1 space-y-8">
          <Card>
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
              <CardTitle>Testimonials</CardTitle>
              {isAuthenticated && userData?.role === "student" && (
                <Button size="sm" className="mt-2 md:mt-0" onClick={() => setIsModalOpen(true)}>
                  Add Testimonial
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {testimonials.length > 0 ? (
                testimonials.map((testimonial) => (
                  <div key={testimonial.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                    <p className="text-sm italic text-muted-foreground">
                      "{testimonial.text}"</p>
                    <div className="flex items-center mt-2">
                      {/* Using AvatarFallback for testimonial initials */}
                      <Avatar className="w-8 h-8 mr-2">
                        <AvatarFallback className="bg-gray-200 text-gray-700 text-sm">
                          {/* Corrected: Use testimonial.initials or testimonial.studentName */}
                          {testimonial.initials || testimonial.studentName?.charAt(0).toUpperCase() || ''}
                        </AvatarFallback>
                      </Avatar>
                      {/* Corrected: Use testimonial.studentName for display */}
                      <span className="text-sm font-medium">{testimonial.studentName}</span>
                      {testimonial.college && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({testimonial.college})
                        </span>
                      )}
                      <span className="ml-auto text-amber-500 text-sm">
                        {"⭐".repeat(testimonial.rating)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">
                  No testimonials yet.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Q&A Sessions (Integrated with Tabs) */}
          <Card>
            <CardHeader>
              <CardTitle>Q&A Sessions</CardTitle>
            </CardHeader>

            <CardContent>
              <Tabs defaultValue="upcoming" className="mt-0">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="past">Past</TabsTrigger>
                </TabsList>
                <TabsContent value="upcoming" className="mt-4">
                  <div className="space-y-4">
                    {upcomingQASessions.length > 0 ? (
                      upcomingQASessions.map((session) => (
                        <Card
                          key={session.id}
                          className="overflow-hidden hover:shadow-md transition-shadow"
                        >
                          <CardHeader className="p-4 pb-0">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-12 h-12">
                                <AvatarFallback
                                  className={`bg-${session.color}-600 text-white text-md font-bold`}
                                >
                                  {session.initials}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <CardTitle className="text-base">
                                  {session.title}
                                </CardTitle>
                                <CardDescription className="text-xs">
                                  with {session.trainer}
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="p-4 pt-2">
                            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                              {session.description}
                            </p>
                            <div className="space-y-2">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>{session.date}</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{session.time}</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Users className="h-3 w-3" />
                                <span>{session.attendees} attending</span>
                              </div>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {session.tags.map((tag, i) => (
                                  <Badge
                                    key={i}
                                    variant="secondary"
                                    className="text-xs px-2 py-0.5"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="flex justify-between p-4 pt-0">
                            {session.registrationLink ? (
                              <Button size="sm" asChild>
                                <Link href={session.registrationLink}>
                                  Register Now
                                </Link>
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
                      <p className="text-muted-foreground text-sm text-center">
                        No upcoming sessions for this expert.
                      </p>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="past" className="mt-4">
                  <div className="space-y-4">
                    {pastQASessions.length > 0 ? (
                      pastQASessions.map((session) => (
                        <Card
                          key={session.id}
                          className="overflow-hidden hover:shadow-md transition-shadow opacity-70"
                        >
                          <CardHeader className="p-4 pb-0">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-12 h-12">
                                <AvatarFallback
                                  className={`bg-${session.color}-600 text-white text-md font-bold`}
                                >
                                  {session.initials}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <CardTitle className="text-base">
                                  {session.title}
                                </CardTitle>
                                <CardDescription className="text-xs">
                                  with {session.trainer}
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="p-4 pt-2">
                            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                              {session.description}
                            </p>
                            <div className="space-y-2">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>{session.date}</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{session.time}</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Users className="h-3 w-3" />
                                <span>{session.attendees} attended</span>
                              </div>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {session.tags.map((tag, i) => (
                                  <Badge
                                    key={i}
                                    variant="secondary"
                                    className="text-xs px-2 py-0.5"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="flex justify-center p-4 pt-0">
                            {session.recordingLink ? (
                              <Button variant="outline" size="sm" asChild>
                                <Link href={session.recordingLink}>
                                  Watch Recording
                                </Link>
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm" disabled>
                                Recording Not Available
                              </Button>
                            )}
                          </CardFooter>
                        </Card>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm text-center">
                        No past sessions for this expert.
                      </p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Testimonial</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Share your experience with this expert..."
              value={testimonialText}
              onChange={(e) => setTestimonialText(e.target.value)}
            />
            {/* Star Rating Input */}
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-muted-foreground">
                Rating:
              </span>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`cursor-pointer ${
                    star <= testimonialRating
                      ? "text-amber-400 fill-amber-400"
                      : "text-gray-300"
                  }`}
                  onClick={() => setTestimonialRating(star)}
                  size={24} // Adjust size as needed
                />
              ))}
            </div>
            <Button
              onClick={addTestimonial} // Call the function directly
              disabled={submitting || !testimonialText || testimonialRating === 0}
            >
              {submitting ? "Submitting..." : "Submit Testimonial"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}