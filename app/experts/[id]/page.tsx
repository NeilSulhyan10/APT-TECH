// app/experts/[id]/page.tsx
"use client"; // Add this line at the very top of the file

import { useState, useEffect } from "react";
// Import your components and Firebase utilities
// For example:
import { db } from "@/app/firebase/firebaseClient"; // Ensure this path is correct
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Mail, Calendar, Video } from "lucide-react";
import Link from "next/link";
import GhibliAvatar from "@/components/ghibli-avatar";

// Define your interfaces (Expert, Testimonial, UpcomingSession)
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
  studentName: string;
  studentAvatarUrl?: string;
  text: string;
  rating: number;
  date: string; // Consider using Date type or Firebase Timestamp
}

interface UpcomingSession {
  id: string;
  expertId: string;
  title: string;
  date: string; // Consider using Date type or Firebase Timestamp
  time: string;
  type: "online" | "in-person";
  link?: string; // For online sessions
  location?: string; // For in-person sessions
  price: number;
}

export default function ExpertProfilePage({
  params,
}: {
  params: { id: string };
}) {
  // THIS IS THE LINE CAUSING THE WARNING
  // Next.js is hinting that `params` *could* be a Promise.
  // In a 'use client' component, it typically isn't when rendered on the client.
  // However, during SSR or build, Next.js's compiler might see it this way.
  const { id } = params;

  const [expert, setExpert] = useState<Expert | null>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExpertData = async () => {
      try {
        // Fetch expert details
        const expertDocRef = doc(db, "experts", id);
        const expertDocSnap = await getDoc(expertDocRef);

        if (expertDocSnap.exists()) {
          setExpert({
            id: expertDocSnap.id,
            ...expertDocSnap.data(),
          } as Expert);

          // Fetch testimonials for this expert
          const testimonialsCollection = collection(db, "testimonials");
          const qTestimonials = query(
            testimonialsCollection,
            where("expertId", "==", id)
          );
          const testimonialSnapshot = await getDocs(qTestimonials);
          const testimonialsList = testimonialSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Testimonial[];
          setTestimonials(testimonialsList);

          // Fetch upcoming sessions for this expert
          const sessionsCollection = collection(db, "upcomingSessions");
          const qSessions = query(
            sessionsCollection,
            where("expertId", "==", id)
          );
          const sessionSnapshot = await getDocs(qSessions);
          const sessionsList = sessionSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as UpcomingSession[];
          setUpcomingSessions(sessionsList);
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
  }, [id]); // Re-run effect if ID changes (though usually not on a profile page)

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

  return (
    <div className="container mx-auto py-8 px-4">
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
                      {/* You might want a default avatar if studentAvatarUrl is not available */}
                      {testimonial.studentAvatarUrl && (
                        <img
                          src={testimonial.studentAvatarUrl}
                          alt={testimonial.studentName}
                          className="w-8 h-8 rounded-full mr-2"
                        />
                      )}
                      <p className="font-semibold text-sm">
                        {testimonial.studentName}
                      </p>
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

          {/* Upcoming Sessions */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Sessions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingSessions.length > 0 ? (
                upcomingSessions.map((session) => (
                  <div
                    key={session.id}
                    className="border-b pb-4 last:border-b-0 last:pb-0"
                  >
                    <h5 className="font-semibold">{session.title}</h5>
                    <p className="text-sm text-muted-foreground">
                      {session.date} at {session.time} ({session.type})
                    </p>
                    {session.type === "online" && session.link && (
                      <Link
                        href={session.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="link" className="px-0 h-auto">
                          Join Session
                        </Button>
                      </Link>
                    )}
                    {session.type === "in-person" && session.location && (
                      <p className="text-sm text-muted-foreground">
                        {session.location}
                      </p>
                    )}
                    <p className="font-bold text-right">₹{session.price}</p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">
                  No upcoming sessions.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
