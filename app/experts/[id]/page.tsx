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
import { Mail, Calendar, Video, Clock, Users, ArrowLeft } from "lucide-react"; // Added ArrowLeft
import Link from "next/link";
import GhibliAvatar from "@/components/ghibli-avatar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define your interfaces (Expert, Testimonial, and the more detailed QASession)
interface Expert {
  id: string;
  name: string;
  role: string;
  experience: string;
  description: string; // This might be redundant if 'bio' is used for the main description
  tags: string[];
  color: string;
  bio: string; // More detailed description
  initials: string;
  rating?: number;
  students?: number;
  sessions?: number;
  resources?: number;
}

interface Testimonial {
  id: string;
  name: string; // From studentName to name to match populateFirestore.js
  college?: string; // Added college, made optional as per seed data
  text: string;
  rating: number;
  initials: string; // Added initials as per seed data
  studentAvatarUrl?: string; // Re-added and made optional
}

interface QASession {
  id: string;
  expertId: string; // Add this field for linking
  title: string;
  trainer: string; // Or derive from expert data
  date: string; // Store as string or Firebase Timestamp
  time: string;
  attendees: number;
  status: "upcoming" | "past"; // Use status for filtering
  tags: string[];
  initials: string; // Or derive from expert data
  color: string; // Or derive from expert data
  description: string;
  registrationLink?: string; // Optional, if you have this in Firestore
  recordingLink?: string; // Optional, if you have this in Firestore
}

export default function ExpertProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  const [expert, setExpert] = useState<Expert | null>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  // Use QASession for all sessions and filter them later
  const [qASessions, setQASessions] = useState<QASession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExpertData = async () => {
      try {
        // 1. Fetch expert details
        const expertDocRef = doc(db, "experts", id);
        const expertDocSnap = await getDoc(expertDocRef);

        if (expertDocSnap.exists()) {
          const expertData = { id: expertDocSnap.id, ...expertDocSnap.data() } as Expert;
          setExpert(expertData);

          // 2. Fetch testimonials for this expert from the SUBCOLLECTION
          const testimonialsSubCollectionRef = collection(expertDocRef, "testimonials");
          const qTestimonials = query(
            testimonialsSubCollectionRef,
            orderBy("id") // Assuming 'id' is a string. If you have a date in testimonials, orderBy('date', 'desc')
          );
          const testimonialSnapshot = await getDocs(qTestimonials);
          const testimonialsList = testimonialSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Testimonial[];
          setTestimonials(testimonialsList);

          // 3. Fetch QA Sessions for this expert (This part was already correct for top-level collection)
          const qaSessionsCollection = collection(db, "qASessions");
          const qSessions = query(
            qaSessionsCollection,
            where("expertId", "==", id),
            orderBy("date", "desc")
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
        setError("Failed to load expert profile. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchExpertData();
  }, [id]);

  if (loading) {
    return (
      <div className="container py-8 px-4 text-center">
        <p>Loading expert profile...</p>
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

  if (!expert) {
    return (
      <div className="container py-8 px-4 text-center">
        <p>Expert data could not be loaded.</p>
      </div>
    );
  }

  // Filter sessions into upcoming and past based on status
  const upcomingSessions = qASessions.filter((session) => session.status === "upcoming");
  const pastSessions = qASessions.filter((session) => session.status === "past");


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
        {/* Expert Details Card (Main column) */}
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
              <CardTitle className="text-3xl font-bold">
                {expert.name}
              </CardTitle>
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
                    <Badge
                      key={i}
                      variant="secondary"
                      className="px-3 py-1 text-base"
                    >
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
                    <Button
                      variant="outline"
                      size="lg"
                      className="rounded-full h-12 w-12"
                    >
                      <Mail className="h-6 w-6" />
                    </Button>
                  </Link>
                  <Link href={`/schedule/${expert.id}`}>
                    <Button
                      variant="outline"
                      size="lg"
                      className="rounded-full h-12 w-12"
                    >
                      <Calendar className="h-6 w-6" />
                    </Button>
                  </Link>
                  <Link href={`/sessions/${expert.id}`}>
                    <Button
                      variant="outline"
                      size="lg"
                      className="rounded-full h-12 w-12"
                    >
                      <Video className="h-6 w-6" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Column for Testimonials and Sessions */}
        <div className="md:col-span-1 space-y-8">
          {/* Testimonials */}
          <Card>
            <CardHeader>
              <CardTitle>Testimonials</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {testimonials.length > 0 ? (
                testimonials.map((testimonial) => (
                  <div
                    key={testimonial.id}
                    className="border-b pb-4 last:border-b-0 last:pb-0"
                  >
                    <p className="text-sm italic text-muted-foreground">
                      "{testimonial.text}"
                    </p>
                    <div className="flex items-center mt-2">
                      <Avatar className="w-8 h-8 rounded-full mr-2">
                        {testimonial.studentAvatarUrl ? (
                          <img
                            src={testimonial.studentAvatarUrl}
                            alt={testimonial.name}
                          />
                        ) : (
                          <AvatarFallback>
                            {testimonial.initials || testimonial.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <p className="font-semibold text-sm">
                        {testimonial.name}
                      </p>
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

          {/* Q&A Sessions (Integrated from QASessionsPage structure) */}
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
                    {upcomingSessions.length > 0 ? (
                      upcomingSessions.map((session) => (
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
                    {pastSessions.length > 0 ? (
                      pastSessions.map((session) => (
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
    </div>
  );
}