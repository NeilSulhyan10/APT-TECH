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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// No longer directly using Input for rating, but keeping if used elsewhere.
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Calendar, Video, Star } from "lucide-react"; // Import Star icon
import Link from "next/link";
import GhibliAvatar from "@/components/ghibli-avatar";
import { useAuth } from "@/app/context/authContext";

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
  date: string;
}

interface UpcomingSession {
  id: string;
  expertId: string;
  title: string;
  date: string;
  time: string;
  type: "online" | "in-person";
  link?: string;
  location?: string;
  price: number;
}

export default function ExpertProfilePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [expert, setExpert] = useState<Expert | null>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([]);
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
        const expertDocRef = doc(db, "experts", id);
        const expertDocSnap = await getDoc(expertDocRef);

        if (expertDocSnap.exists()) {
          setExpert({ id: expertDocSnap.id, ...expertDocSnap.data() } as Expert);

          const testimonialSnap = await getDocs(
            query(collection(db, "testimonials"), where("expertId", "==", id))
          );
          // Convert Firestore Timestamp to ISO string if necessary, or keep as Timestamp if you prefer to format it later
          setTestimonials(
            testimonialSnap.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
              date: doc.data().date?.toDate().toISOString() // Convert Timestamp to ISO string
            })) as Testimonial[]
          );

          const sessionSnap = await getDocs(
            query(collection(db, "upcomingSessions"), where("expertId", "==", id))
          );
          setUpcomingSessions(
            sessionSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as UpcomingSession[]
          );
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
  }, [id]);

  const addTestimonial = async () => {
    const ref = collection(db, "testimonials");

    const newTestimonial = {
      expertId: expert?.id,
      studentName: (userData?.firstName && userData?.lastName) ? `${userData.firstName} ${userData.lastName}` : userData?.firstName || userData?.lastName || "Anonymous", 
      text: testimonialText,
      rating: testimonialRating,
      date: Timestamp.now(), // Store as Firestore Timestamp
    };

    try {
      const docRef = await addDoc(ref, newTestimonial);

      setTestimonials((prev) => [
        ...prev,
        {
          id: docRef.id,
          ...newTestimonial,
          date: new Date().toISOString(), // Use current date for immediate UI update
        } as Testimonial,
      ]);

      setTestimonialText("");
      setTestimonialRating(5); // Reset rating to 5
      setIsModalOpen(false); // Close modal on successful submission
    } catch (err) {
      console.error("Error adding testimonial:", err);
      // Optionally set an error state for the user
    }
  };

  if (loading) return <div className="container py-8 px-4 text-center">Loading expert profile...</div>;
  if (error) return <div className="container py-8 px-4 text-center text-red-500">{error}</div>;
  if (!expert) return <div className="container py-8 px-4 text-center">Expert data could not be loaded.</div>;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card className="overflow-hidden">
            <div className={`h-48 bg-${expert.color}-500 relative flex items-center justify-center`}>
              <GhibliAvatar
                initials={expert.initials}
                color={expert.color}
                size="xl"
                className="border-4 border-white shadow-lg"
              />
            </div>
            <CardHeader className="text-center pt-20">
              <CardTitle className="text-3xl font-bold">{expert.name}</CardTitle>
              <CardDescription className={`text-${expert.color}-600 dark:text-${expert.color}-400 text-lg`}>
                {expert.role} | {expert.experience}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-6 pb-6">
              <div>
                <h4 className="text-xl font-semibold mb-2">About {expert.name.split(" ")[0]}</h4>
                <p className="text-muted-foreground leading-relaxed">{expert.bio}</p>
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
                <h4 className="text-xl font-semibold mb-2">Connect & Schedule</h4>
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
                    <p className="text-sm italic text-muted-foreground">"{testimonial.text}"</p>
                    <div className="flex items-center mt-2">
                      {testimonial.studentAvatarUrl && (
                        <img
                          src={testimonial.studentAvatarUrl}
                          alt={testimonial.studentName}
                          className="w-8 h-8 rounded-full mr-2"
                        />
                      )}
                      <p className="font-semibold text-sm">{testimonial.studentName}</p>
                      <span className="ml-auto text-amber-500 text-sm">
                        {"⭐".repeat(testimonial.rating)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">No testimonials yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Sessions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingSessions.length > 0 ? (
                upcomingSessions.map((session) => (
                  <div key={session.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                    <h5 className="font-semibold">{session.title}</h5>
                    <p className="text-sm text-muted-foreground">
                      {session.date} at {session.time} ({session.type})
                    </p>
                    {session.type === "online" && session.link && (
                      <Link href={session.link} target="_blank" rel="noopener noreferrer">
                        <Button variant="link" className="px-0 h-auto">Join Session</Button>
                      </Link>
                    )}
                    {session.type === "in-person" && session.location && (
                      <p className="text-sm text-muted-foreground">{session.location}</p>
                    )}
                    <p className="font-bold text-right">₹{session.price}</p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">No upcoming sessions.</p>
              )}
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
              <span className="text-sm font-medium text-muted-foreground">Rating:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`cursor-pointer ${
                    star <= testimonialRating ? "text-amber-400 fill-amber-400" : "text-gray-300"
                  }`}
                  onClick={() => setTestimonialRating(star)}
                  size={24} // Adjust size as needed
                />
              ))}
            </div>
            <Button
              onClick={async () => {
                setSubmitting(true);
                try {
                  await addTestimonial();
                } catch (err) {
                  console.error("Error adding testimonial:", err);
                } finally {
                  setSubmitting(false);
                }
              }}
              // Disable if submitting, text is empty, or rating is 0 (though default is 5)
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