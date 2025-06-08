// app/admin/student-analytics/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/config/firebase";
import { useAuth } from "@/app/context/authContext"; // Ensure this path is correct
import {
  Loader2,
  BarChart2,
  BookOpenText, // For purchases
  GraduationCap, // For colleges
  CalendarDays, // For academic year
} from "lucide-react";
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
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator"; // For visual separation

// Define the shape of student data needed for analytics
interface StudentData {
  uid: string;
  college?: string;
  year?: string | number;
  purchasedPackages?: string[]; // Array of package IDs
}

export default function StudentAnalyticsPage() {
  const { userData, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  const [allStudents, setAllStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination for Colleges
  const [collegePage, setCollegePage] = useState(0);
  const collegesPerPage = 5;

  // --- Authorization and Initial Data Fetch ---
  useEffect(() => {
    if (authLoading) {
      return; // Still loading auth state
    }

    // Redirect if not authenticated or not an admin
    if (!isAuthenticated || userData?.role !== "admin") {
      console.warn(
        "Unauthorized access attempt to student analytics. Redirecting."
      );
      router.push("/login"); // Or to an access denied page
      return;
    }

    // If authorized, fetch student data
    if (userData?.role === "admin") {
      fetchAllStudentData();
    }
  }, [authLoading, isAuthenticated, userData, router]);

  // --- Function to Fetch All Student Data ---
  const fetchAllStudentData = async () => {
    setLoading(true);
    setError(null);
    try {
      const q = query(
        collection(db, "users"),
        where("role", "==", "student")
      );
      const snapshot = await getDocs(q);
      const fetchedStudents: StudentData[] = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        fetchedStudents.push({
          uid: docSnap.id,
          college: data.college || undefined,
          year: data.year || undefined,
          purchasedPackages: data.purchasedPackages || [], // Ensure it's an array
        });
      });
      setAllStudents(fetchedStudents);
    } catch (err: any) {
      console.error("Error fetching all student data for analytics:", err);
      setError("Failed to load student data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- Memoized Analytics Calculations ---

  // 1. College Distribution (Most to Least)
  const collegeCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    allStudents.forEach((student) => {
      if (student.college) {
        counts[student.college] = (counts[student.college] || 0) + 1;
      }
    });
    // Convert to array and sort
    return Object.entries(counts).sort(([, countA], [, countB]) => countB - countA);
  }, [allStudents]);

  // Paginated Colleges for display
  const paginatedColleges = useMemo(() => {
    const startIndex = collegePage * collegesPerPage;
    return collegeCounts.slice(startIndex, startIndex + collegesPerPage);
  }, [collegeCounts, collegePage, collegesPerPage]);

  const totalCollegePages = Math.ceil(collegeCounts.length / collegesPerPage);

  // 2. Academic Year Distribution
  const yearCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    allStudents.forEach((student) => {
      if (student.year) {
        counts[String(student.year)] = (counts[String(student.year)] || 0) + 1;
      }
    });
    // Sort years (e.g., alphabetically or numerically if they are numbers)
    return Object.entries(counts).sort(([yearA], [yearB]) => yearA.localeCompare(yearB));
  }, [allStudents]);

  // 3. Purchase Distribution
  const purchaseCounts = useMemo(() => {
    const counts: {
      'no_purchase': number;    
      'tcs-nqt': number;
      'infosys&wipro': number;
      'completepackage': number;
      'other_purchases': number; // For packages not explicitly listed
    } = {
      'no_purchase': 0,
      'tcs-nqt': 0,
      'infosys&wipro': 0,
      'completepackage': 0,
      'other_purchases': 0,
    };

    allStudents.forEach(student => {
      if (!student.purchasedPackages || student.purchasedPackages.length === 0) {
        counts['no_purchase']++;
      } else {
        let foundSpecificPackage = false;
        student.purchasedPackages.forEach(pkg => {
          if (pkg === 'tcs-nqt') {
            counts['tcs-nqt']++;
            foundSpecificPackage = true;
          } else if (pkg === 'infosys&wipro') {
            counts['infosys&wipro']++;
            foundSpecificPackage = true;
          } else if (pkg === 'completepackage') {
            counts['completepackage']++;
            foundSpecificPackage = true;
          }
          // If a student has multiple specific packages, they'll be counted for each.
          // If you want to count a student only once for *any* purchase, this logic needs adjustment.
        });
        if (!foundSpecificPackage && student.purchasedPackages.length > 0) {
          counts['other_purchases']++;
        }
      }
    });

    return counts;
  }, [allStudents]);


  // --- Render Loading State ---
  if (authLoading || loading) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8 px-4">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        <p className="text-lg">Loading Student Analytics...</p>
      </div>
    );
  }

  // --- Render Access Denied State ---
  if (!isAuthenticated || userData?.role !== "admin") {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8 px-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-red-600">
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-red-500">
              You do not have administrative privileges to view this page.
            </p>
            <Button onClick={() => router.push("/")} className="w-full mt-4">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- Render Error State ---
  if (error) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8 px-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-red-600">
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-red-500">{error}</p>
            <Button onClick={fetchAllStudentData} className="w-full mt-4">
              Try Again
            </Button>
            <Button variant="outline" onClick={() => router.push("/admin/dashboard")} className="w-full mt-2">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- Main Analytics Content ---
  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
        <BarChart2 className="h-8 w-8 text-primary" /> Student Analytics
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: College Distribution */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-medium">
              Top Colleges
            </CardTitle>
            <GraduationCap className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {collegeCounts.length === 0 ? (
              <p className="text-muted-foreground">No college data available.</p>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>College</TableHead>
                      <TableHead className="text-right">Students</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedColleges.map(([collegeName, count]) => (
                      <TableRow key={collegeName}>
                        <TableCell className="font-medium">{collegeName}</TableCell>
                        <TableCell className="text-right">{count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex justify-between items-center mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCollegePage((prev) => Math.max(0, prev - 1))}
                    disabled={collegePage === 0}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {collegePage + 1} of {totalCollegePages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCollegePage((prev) => Math.min(totalCollegePages - 1, prev + 1))}
                    disabled={collegePage >= totalCollegePages - 1}
                  >
                    Next
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Card 2: Academic Year Distribution */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-medium">
              Academic Years
            </CardTitle>
            <CalendarDays className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {yearCounts.length === 0 ? (
              <p className="text-muted-foreground">No academic year data available.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Year</TableHead>
                    <TableHead className="text-right">Students</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {yearCounts.map(([yearName, count]) => (
                    <TableRow key={yearName}>
                      <TableCell className="font-medium">{yearName}</TableCell>
                      <TableCell className="text-right">{count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Card 3: Mentorship Purchases */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-medium">
              Mentorship Purchases
            </CardTitle>
            <BookOpenText className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {allStudents.length === 0 ? (
              <p className="text-muted-foreground">No student data to analyze purchases.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Package Type</TableHead>
                    <TableHead className="text-right">Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">No Purchase</TableCell>
                    <TableCell className="text-right">{purchaseCounts.no_purchase}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">TCS-NQT</TableCell>
                    <TableCell className="text-right">{purchaseCounts['tcs-nqt']}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Infosys & Wipro</TableCell>
                    <TableCell className="text-right">{purchaseCounts['infosys&wipro']}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Complete Package</TableCell>
                    <TableCell className="text-right">{purchaseCounts.completepackage}</TableCell>
                  </TableRow>
                  {purchaseCounts.other_purchases > 0 && (
                      <TableRow>
                          <TableCell className="font-medium">Other Purchases</TableCell>
                          <TableCell className="text-right">{purchaseCounts.other_purchases}</TableCell>
                      </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8" />

      <div className="flex justify-end">
        <Button onClick={() => router.push("/admin/dashboard")}>
          Back to Admin Dashboard
        </Button>
      </div>
    </div>
  );
}