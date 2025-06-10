"use client";

import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/authContext";
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
import { Input } from "@/components/ui/input";
import { Loader2, ShieldCheck } from "lucide-react";

interface Admin {
  uid: string;
  email: string;
  firstName?: string;
  lastName?: string;
  password?: string;
}

export default function ManageAdminsPage() {
  const { userData, loading: authLoading } = useAuth();
  const router = useRouter();

  const [admins, setAdmins] = useState<Admin[]>([]);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!userData || userData.role !== "admin")) {
      router.push("/login");
      return;
    }

    if (!authLoading && userData?.role === "admin") {
      const q = query(collection(db, "users"), where("role", "==", "admin"));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list: Admin[] = [];
        snapshot.forEach((docSnap) =>
          list.push({ uid: docSnap.id, ...(docSnap.data() as any) })
        );
        setAdmins(list);
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [authLoading, userData]);

  const handleAddAdmin = async () => {
    if (!email) return;

    try {
      setAdding(true);

      await addDoc(collection(db, "users"), {
        email,
        firstName,
        lastName,
        role: "admin",
        createdAt: new Date(),
      });

      setEmail("");
      setFirstName("");
      setLastName("");
    } catch (err) {
      console.error("Error adding admin:", err);
      setError("Failed to add admin.");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (uid: string) => {
    try {
      await deleteDoc(doc(db, "users", uid));
    } catch (err) {
      console.error("Error deleting admin:", err);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-8 w-8 mr-2" />
        <p>Loading admins...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
        <ShieldCheck className="h-8 w-8 text-primary" />
        Manage Admins
      </h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add Admin</CardTitle>
          <CardDescription>Fill out details to create a new admin.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <Input
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
            <Input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button disabled={adding} onClick={handleAddAdmin}>
              {adding ? "Adding..." : "Add Admin"}
            </Button>
          </div>
          {error && <p className="text-red-600">{error}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Admins</CardTitle>
          <CardDescription>Remove admin access as needed.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>List of all admins.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.uid}>
                  <TableCell>
                    {admin.firstName} {admin.lastName}
                  </TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(admin.uid)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {admins.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    No admins found.
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
