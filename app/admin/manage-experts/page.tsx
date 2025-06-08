"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { useAuth } from "@/app/context/authContext";
import { Loader2, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface ExpertProfile {
  uid: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isExpertApproved?: boolean | null;
  expertise?: string;
  role: string;
}

export default function ManageExpertsPage() {
  const { userData, loading: authLoading } = useAuth();
  const router = useRouter();

  const [experts, setExperts] = useState<ExpertProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!userData || userData.role !== "admin")) {
      router.push("/login");
      return;
    }

    if (!authLoading && userData?.role === "admin") {
      const q = query(collection(db, "users"), where("role", "==", "expert"));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const fetched: ExpertProfile[] = [];

          snapshot.forEach((docSnap) => {
            fetched.push({ uid: docSnap.id, ...(docSnap.data() as any) });
          });

          // Sort by approval status: pending -> approved -> rejected
          const sorted = fetched.sort((a, b) => {
            const statusRank = (val: boolean | null | undefined) => {
              if (val === null || val === undefined) return 0; // Pending
              if (val === true) return 1; // Approved
              return 2; // Rejected
            };
            return statusRank(a.isExpertApproved) - statusRank(b.isExpertApproved);
          });

          setExperts(sorted);
          setLoading(false);
        },
        (err) => {
          console.error("Error fetching experts:", err);
          setError("Failed to fetch experts. Please try again.");
          setLoading(false);
        }
      );

      return () => unsubscribe();
    }
  }, [authLoading, userData]);

  const updateApproval = async (uid: string, status: boolean) => {
    try {
      await updateDoc(doc(db, "users", uid), {
        isExpertApproved: status,
      });
    } catch (err) {
      console.error("Error updating approval:", err);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8 px-4">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        <p className="text-lg">Loading Experts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8 px-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-red-500">{error}</p>
            <Button onClick={() => router.push("/")} className="w-full mt-4">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
        <Users className="h-8 w-8 text-primary" /> Manage Experts
      </h1>

      <Card className="w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            Expert Users
          </CardTitle>
          <CardDescription className="text-center">
            Review, approve or reject expert applications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>Manage expert approvals and details.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {experts.map((expert) => (
                <TableRow key={expert.uid}>
                  <TableCell>
                    {expert.firstName} {expert.lastName}
                  </TableCell>
                  <TableCell>{expert.email}</TableCell>
                  <TableCell>
                    {expert.isExpertApproved === true && (
                      <span className="text-green-600 font-semibold">Approved</span>
                    )}
                    {expert.isExpertApproved === false && (
                      <span className="text-red-600 font-semibold">Rejected</span>
                    )}
                    {(expert.isExpertApproved === null ||
                      expert.isExpertApproved === undefined) && (
                      <span className="text-yellow-600 font-medium">Pending</span>
                    )}
                  </TableCell>
                  <TableCell className="flex gap-2 justify-center">
                    {expert.isExpertApproved !== true && (
                      <Button
                        size="sm"
                        onClick={() => updateApproval(expert.uid, true)}
                      >
                        Approve
                      </Button>
                    )}
                    {expert.isExpertApproved !== false && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => updateApproval(expert.uid, false)}
                      >
                        Reject
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {experts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No expert users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
