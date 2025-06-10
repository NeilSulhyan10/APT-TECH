"use client"; // This is crucial for client-side React features like useState and useRouter

import { useState } from "react";
import { useRouter } from "next/navigation"; // Correct import for useRouter in Next.js App Router
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth"; // Firebase Auth functions
import { auth, provider } from "@/config/firebase"; // Your Firebase client-side auth instance and Google provider

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";

export default function RegisterPage() {
  // --- New state for multi-step form ---
  const [currentStep, setCurrentStep] = useState(1); // 1: Role selection, 2: Details/Google signup
  // --- End new state ---

  // State for all form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [college, setCollege] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [selectedRole, setSelectedRole] = useState("user"); // State for role, default to 'user' (student)
  const [agreeTerms, setAgreeTerms] = useState(false);

  // UI states
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  // Helper function to parse Google Display Name into first/last name
  const parseDisplayName = (displayName: string | null): { firstName: string, lastName: string } => {
    if (!displayName) {
      return { firstName: "N/A", lastName: "N/A" };
    }
    const parts = displayName.split(" ");
    const firstName = parts[0] || "N/A";
    const lastName = parts.slice(1).join(" ") || "N/A";
    return { firstName, lastName };
  };

  // Handles email/password registration
  const handleEmailPasswordRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!agreeTerms) {
      setError("Please agree to the terms and conditions.");
      return;
    }
    if (!email || !password || !firstName || !lastName || !college || !yearOfStudy || !selectedRole) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log("User successfully created in Firebase Auth. UID:", user.uid);

      const token = await user.getIdToken();

      const userProfileData = {
        uid: user.uid,
        email: user.email,
        firstName: firstName,
        lastName: lastName,
        college: college,
        year_of_study: yearOfStudy,
        role: selectedRole, // Include the selected role
        status: selectedRole === 'user' ? 'approved' : 'pending', // Set status based on role
        createdAt: new Date().toISOString(),
      };

      console.log("Sending user profile data to backend:", userProfileData);

      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(userProfileData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save user profile to database.");
      }

      console.log("User profile saved to Firestore:", data.message);

      // We don't store authToken/userInfo in localStorage here anymore.
      // AuthContext will handle it upon onAuthStateChanged.
      // After registration, AuthContext will fetch the new user's profile and then redirect.
      // For now, we'll redirect immediately to login, allowing AuthContext to handle the full flow.
      router.push("/login?registered=true"); // Redirect to login after successful registration

    } catch (err: any) {
      console.error("Registration error:", err);

      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please try logging in.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. It must be at least 6 characters.');
      } else if (err.code === 'auth/invalid-email') {
        setError('The email address is not valid.');
      } else {
        setError(err.message || "An unexpected error occurred during registration.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handles Google Sign-in
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      console.log("Signed in with Google. UID:", user.uid);

      const token = await user.getIdToken();
      const { firstName: googleFirstName, lastName: googleLastName } = parseDisplayName(user.displayName);

      // Use the selectedRole from the form for Google sign-in (already present in state)
      const roleForGoogleUser = selectedRole;
      const statusForGoogleUser = roleForGoogleUser === 'user' ? 'approved' : 'pending';

      const userProfileData = {
        uid: user.uid,
        email: user.email || "",
        firstName: googleFirstName,
        lastName: googleLastName,
        college: "N/A", // Google sign-in doesn't provide this, set default or ask later
        year_of_study: "N/A", // Google sign-in doesn't provide this, set default or ask later
        role: roleForGoogleUser, // Assign the selected role for Google sign-in
        status: statusForGoogleUser, // Assign status based on selected role
        createdAt: new Date().toISOString(),
      };

      console.log("Sending Google user profile data to backend:", userProfileData);

      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(userProfileData)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save Google user profile.");
      }

      console.log("Google user profile saved to Firestore:", data.message);

      // Similar to email/password, let AuthContext handle subsequent state and redirection
      router.push("/login?registered=true");

    } catch (err: any) {
      console.error("Google sign-in error:", err);

      if (err.code === 'auth/popup-closed-by-user') {
        setError('Google sign-in cancelled.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setError('Google sign-in cancelled or blocked by browser.');
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        setError('An account with this email already exists using a different sign-in method.');
      } else {
        setError(err.message || "An unexpected error occurred during Google sign-in.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8 px-4">
      <Card className="w-full max-w-md">
        {/* Step 1: Role Selection */}
        {currentStep === 1 && (
          <>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Select Your Role</CardTitle>
              <CardDescription className="text-center">
                Choose how you'd like to join APT-TECH Connect.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">Register as</Label>
                <Select
                  name="role"
                  value={selectedRole}
                  onValueChange={(value) => setSelectedRole(value as 'user' | 'expert')} // Cast to ensure correct type
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Student/Candidate</SelectItem>
                    <SelectItem value="expert">Expert/Trainer</SelectItem>
                    {/* Admin role is NOT offered on public registration for security */}
                  </SelectContent>
                </Select>
              </div>
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                className="w-full"
                onClick={() => {
                  if (selectedRole) {
                    setCurrentStep(2); // Proceed to step 2
                    setError(null); // Clear any previous error
                  } else {
                    setError("Please select a role to proceed.");
                  }
                }}
              >
                Next
              </Button>
              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </>
        )}

        {/* Step 2: User Details / Google Sign-in */}
        {currentStep === 2 && (
          <form onSubmit={handleEmailPasswordRegister}>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Create Your Account</CardTitle>
              <CardDescription className="text-center">
                Fill in your details or sign up with Google.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input
                    name="firstName"
                    id="firstName"
                    placeholder="Enter your first name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input
                    name="lastName"
                    id="lastName"
                    placeholder="Enter your last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  name="email"
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  name="password"
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="college">College/University</Label>
                <Input
                  name="college"
                  id="college"
                  placeholder="Enter your college"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year of Study</Label>
                <Select
                  name="year"
                  value={yearOfStudy}
                  onValueChange={(value) => setYearOfStudy(value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">First Year</SelectItem>
                    <SelectItem value="2">Second Year</SelectItem>
                    <SelectItem value="3">Third Year</SelectItem>
                    <SelectItem value="4">Final Year</SelectItem>
                    <SelectItem value="pg">Post Graduate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Role display (read-only) for context */}
              <div className="space-y-2">
                <Label htmlFor="selectedRoleDisplay">Selected Role</Label>
                <Input
                  id="selectedRoleDisplay"
                  value={selectedRole === 'user' ? 'Student/Candidate' : 'Expert/Trainer'}
                  readOnly
                  className="bg-muted-foreground/10" // Make it look like a read-only field
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreeTerms}
                  onCheckedChange={(checked) => setAgreeTerms(!!checked)}
                />
                <Label htmlFor="terms" className="text-sm">
                  I agree to the{" "}
                  <Link href="/terms" className="text-primary hover:underline">
                    terms and conditions
                  </Link>
                </Label>
              </div>
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing Up..." : "Sign Up"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
              >
                {googleLoading ? "Signing in with Google..." : "Sign up with Google"}
              </Button>

              {/* Back button for multi-step */}
              <Button
                type="button"
                variant="ghost"
                className="w-full mt-2"
                onClick={() => setCurrentStep(1)} // Go back to step 1
              >
                Back
              </Button>

              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
