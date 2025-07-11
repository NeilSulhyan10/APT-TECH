'use client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Calendar, Video, Search } from "lucide-react" // Removed Filter as it's not used
import Link from "next/link"
import GhibliAvatar from "@/components/ghibli-avatar"

import { db } from "@/app/firebase/firebaseClient"
import { collection, getDocs, DocumentData } from "firebase/firestore"
import { useEffect, useState } from "react"

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

export default function ExpertsPage() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchExperts = async () => {
      try {
        const expertsCollection = collection(db, "experts");
        const expertSnapshot = await getDocs(expertsCollection);
        const expertsList = expertSnapshot.docs.map(doc => {
          const data = doc.data() as DocumentData; // Get document data
          return {
            id: doc.id,
            // Provide default values for potentially missing or null fields
            name: (data.name as string) || '',
            role: (data.role as string) || '',
            experience: (data.experience as string) || '',
            description: (data.description as string) || '',
            // Ensure tags is an array and contains only strings
            tags: Array.isArray(data.tags) ? (data.tags as string[]).filter(tag => typeof tag === 'string') : [],
            color: (data.color as string) || 'gray', // Provide a default color
            bio: (data.bio as string) || '',
            initials: (data.initials as string) || '', // Provide default initials
            rating: data.rating as number | undefined,
            students: data.students as number | undefined,
            sessions: data.sessions as number | undefined,
            resources: data.resources as number | undefined,
          };
        });
        setExperts(expertsList);
      } catch (err) {
        console.error("Error fetching experts:", err);
        setError("Failed to load experts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchExperts();
  }, []); // Empty dependency array means this runs once on mount

  const filteredExperts = experts.filter(expert => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    // Now, these properties are guaranteed to be strings or string arrays,
    // so toLowerCase() and .some() will not error.
    const nameMatches = expert.name.toLowerCase().includes(lowerCaseSearchTerm);
    const roleMatches = expert.role.toLowerCase().includes(lowerCaseSearchTerm);
    const descriptionMatches = expert.description.toLowerCase().includes(lowerCaseSearchTerm);

    const tagsMatches = expert.tags.some(tag => tag.toLowerCase().includes(lowerCaseSearchTerm));

    return nameMatches || roleMatches || descriptionMatches || tagsMatches;
  });

  if (loading) {
    return (
      <div className="container py-8 px-4 text-center">
        <p>Loading experts...</p>
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
      {/* Search and filter UI */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search experts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 w-full rounded-md border"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredExperts.length === 0 ? (
          <p className="col-span-full text-center text-muted-foreground">No experts found matching your search.</p>
        ) : (
          filteredExperts.map((expert) => (
            <Card key={expert.id} className="overflow-hidden flex flex-col">
              <div className={`h-32 bg-${expert.color}-500 relative overflow-hidden`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <GhibliAvatar
                    initials={expert.initials}
                    color={expert.color}
                    size="lg"
                    className="border-4 border-white"
                  />
                </div>
              </div>
              <CardHeader className="pt-16 text-center">
                <CardTitle>{expert.name}</CardTitle>
                <CardDescription className={`text-${expert.color}-600 dark:text-${expert.color}-400`}>
                  {expert.role} | {expert.experience}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center flex-grow flex flex-col justify-between">
                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{expert.description}</p>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-4">{expert.bio}</p>
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  {expert.tags.map((tag, i) => (
                    <Badge key={i} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex space-x-4 justify-center mt-4">
                  <Link href={`/contact/${expert.id}?type=email`}>
                    <Button variant="outline" size="icon" className="w-10 h-10 rounded-full">
                      <Mail className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href={`/schedule/${expert.id}`}>
                    <Button variant="outline" size="icon" className="w-10 h-10 rounded-full">
                      <Calendar className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href={`/sessions/${expert.id}`}>
                    <Button variant="outline" size="icon" className="w-10 h-10 rounded-full">
                      <Video className="h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center p-6 mt-auto">
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/experts/${expert.id}`}>View Profile</Link>
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}