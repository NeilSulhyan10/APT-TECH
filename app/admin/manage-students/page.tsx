  // app/admin/manage-students/page.tsx (Updated to use API routes)
  "use client";

  import { useState, useEffect } from "react";
  import { useRouter } from "next/navigation";
  import { Loader2, GraduationCap, BarChart2, Monitor } from "lucide-react";
  import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
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

  // Assuming AuthContext handles getting the user's ID token
  import { useAuth } from "@/app/context/authContext"; // Ensure this path is correct

  // Define the shape of your student profile
  interface StudentProfile {
    uid: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    isStudentApproved?: boolean | null;
  }

  export default function ManageStudentsPage() {
    const { userData, loading: authLoading, isAuthenticated, user } = useAuth(); // Get Firebase user object for ID token
    const router = useRouter();

    const [students, setStudents] = useState<StudentProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoadingUid, setActionLoadingUid] = useState<string | null>(null);

    useEffect(() => {
      if (authLoading) {
        return;
      }

      if (!isAuthenticated || userData?.role !== "admin") {
        console.warn("Unauthorized access attempt to manage students. Redirecting.");
        router.push("/login");
        return;
      }

      if (userData?.role === "admin" && user) { // Ensure Firebase user object is available
        fetchStudents();
      }
    }, [authLoading, isAuthenticated, userData, user, router]);

    const fetchStudents = async () => {
      setLoading(true);
      setError(null);
      try {
        const idToken = await user?.getIdToken(); // Get ID token for API authorization
        if (!idToken) {
          throw new Error("No authentication token available.");
        }

        const response = await fetch('/api/admin/students', {
          headers: {
            'Authorization': `Bearer ${idToken}`,
          },
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || 'Failed to fetch students from API.');
        }

        const fetchedStudents: StudentProfile[] = await response.json();
        setStudents(fetchedStudents);
      } catch (err: any) {
        console.error("Error fetching students via API:", err);
        setError("Failed to fetch students. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    const updateApproval = async (uid: string, status: boolean) => {
      if (!userData || userData.role !== 'admin' || !user) {
        setError("Authorization error: You are not an admin or not logged in.");
        return;
      }
      setActionLoadingUid(uid);
      setError(null);

      try {
        const idToken = await user.getIdToken();
        if (!idToken) {
          throw new Error("No authentication token available.");
        }

        const response = await fetch('/api/admin/update-student-approval', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
          },
          body: JSON.stringify({ uid, status }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || 'Failed to update student approval via API.');
        }

        // Re-fetch students to ensure UI is consistent with backend, or update local state
        // For simplicity, re-fetching is safer after an update.
        await fetchStudents();

      } catch (err: any) {
        console.error("Error updating approval via API:", err);
        setError(`Failed to update student approval: ${err.message || 'An unexpected error occurred.'}`);
      } finally {
        setActionLoadingUid(null);
      }
    };

    // The addAdminLog helper would ideally be moved to an API route as well
    // For now, it stays client-side if you don't create a separate log API.
    // OR: you could call a /api/admin/log endpoint here
    // const addAdminLog = async (adminId: string, adminName: string, description: string) => { /* ... */ };

    // ... (rest of the component remains largely the same for rendering, loading, error states) ...
    if (authLoading || loading) {
      return (
        <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8 px-4">
          <Loader2 className="mr-2 h-8 w-8 animate-spin" />
          <p className="text-lg">Loading Students...</p>
        </div>
      );
    }

    if (!isAuthenticated || userData?.role !== 'admin') {
      return (
        <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8 px-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center text-red-600">Access Denied</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-red-500">You do not have administrative privileges to view this page.</p>
              <Button onClick={() => router.push('/')} className="w-full mt-4">
                Go to Home
              </Button>
            </CardContent>
          </Card>
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
              <Button onClick={fetchStudents} className="w-full mt-4">
                Try Again
              </Button>
              <Button variant="outline" onClick={() => router.push("/")} className="w-full mt-2">
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
                    <TableCell>{student.firstName || 'N/A'} {student.lastName || ''}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>
                      {student.isStudentApproved === true && (
                        <span className="text-green-600 font-semibold">Approved</span>
                      )}
                      {student.isStudentApproved === false && (
                        <span className="text-red-600 font-semibold">Rejected</span>
                      )}
                      {(student.isStudentApproved === null || student.isStudentApproved === undefined) ? (
                        <span className="text-yellow-600 font-medium">Pending</span>
                      ) : null}
                    </TableCell>
                    <TableCell className="flex gap-2 justify-center">
                      {student.isStudentApproved !== true && (
                        <Button
                          size="sm"
                          onClick={() => updateApproval(student.uid, true)}
                          disabled={actionLoadingUid === student.uid}
                        >
                          {actionLoadingUid === student.uid ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          Approve
                        </Button>
                      )}
                      {student.isStudentApproved !== false && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => updateApproval(student.uid, false)}
                          disabled={actionLoadingUid === student.uid}
                        >
                          {actionLoadingUid === student.uid ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
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
          <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6">
            <Button
              variant="outline"
              onClick={() => router.push("/admin/dashboard")}
              className="w-full sm:w-auto"
            >
              Back to Dashboard
            </Button>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button
                onClick={() => router.push("/admin/student-analytics")}
                className="w-full sm:w-auto"
              >
                <BarChart2 className="mr-2 h-4 w-4" /> View Student Analytics
              </Button>
              <Button
                onClick={() => router.push("/student-view")}
                className="w-full sm:w-auto"
                variant="secondary"
              >
                <Monitor className="mr-2 h-4 w-4" /> Simulate Student View
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    );
  }