"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { useAuth } from "@/app/context/authContext";
import { Loader2, GraduationCap } from "lucide-react";
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

interface StudentProfile {
  uid: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isStudentApproved?: boolean | null;
}

export default function ManageStudentsPage() {
  const { userData, loading: authLoading } = useAuth();
  const router = useRouter();

  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!userData || userData.role !== "admin")) {
      router.push("/login");
      return;
    }

    if (!authLoading && userData?.role === "admin") {
      fetchStudents();
    }
  }, [authLoading, userData]);

  const fetchStudents = async () => {
    try {
      const q = query(collection(db, "users"), where("role", "==", "student"));
      const snapshot = await getDocs(q);
      const fetched: StudentProfile[] = [];

      snapshot.forEach((docSnap) => {
        fetched.push({ uid: docSnap.id, ...docSnap.data() } as StudentProfile);
      });

      const sorted = fetched.sort((a, b) => {
        const getPriority = (status: boolean | null | undefined) => {
          if (status === null || status === undefined) return 0; // Pending
          if (status === true) return 1; // Approved
          return 2; // Rejected
        };
        return getPriority(a.isStudentApproved) - getPriority(b.isStudentApproved);
      });

      setStudents(sorted);
    } catch (err: any) {
      console.error("Error fetching students:", err);
      setError("Failed to fetch students. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateApproval = async (uid: string, status: boolean) => {
    try {
      await updateDoc(doc(db, "users", uid), {
        isStudentApproved: status,
      });

      setStudents((prev) =>
        prev
          .map((stu) =>
            stu.uid === uid ? { ...stu, isStudentApproved: status } : stu
          )
          .sort((a, b) => {
            const getPriority = (s: boolean | null | undefined) => {
              if (s === null || s === undefined) return 0;
              if (s === true) return 1;
              return 2;
            };
            return getPriority(a.isStudentApproved) - getPriority(b.isStudentApproved);
          })
      );
    } catch (err) {
      console.error("Error updating approval:", err);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8 px-4">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        <p className="text-lg">Loading Students...</p>
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
        <GraduationCap className="h-8 w-8 text-primary" /> Manage Students
      </h1>

      <Card className="w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Student Users
          </CardTitle>
          <CardDescription className="text-center">
            Review, approve or reject student registrations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>Manage student approvals and details.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.uid}>
                  <TableCell>{student.firstName} {student.lastName}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>
                    {student.isStudentApproved === true && (
                      <span className="text-green-600 font-semibold">Approved</span>
                    )}
                    {student.isStudentApproved === false && (
                      <span className="text-red-600 font-semibold">Rejected</span>
                    )}
                    {student.isStudentApproved === null || student.isStudentApproved === undefined ? (
                      <span className="text-yellow-600 font-medium">Pending</span>
                    ) : null}
                  </TableCell>
                  <TableCell className="flex gap-2 justify-center">
                    {student.isStudentApproved !== true && (
                      <Button size="sm" onClick={() => updateApproval(student.uid, true)}>
                        Approve
                      </Button>
                    )}
                    {student.isStudentApproved !== false && (
                      <Button variant="destructive" size="sm" onClick={() => updateApproval(student.uid, false)}>
                        Reject
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {students.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No student users found.
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
