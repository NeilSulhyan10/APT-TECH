"use client"; // This is crucial for client-side React features like useState and useRouter

import { useState } from "react";
import { useRouter } from "next/navigation"; // Correct import for useRouter in Next.js App Router
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth"; // Firebase Auth functions
import { doc, setDoc, serverTimestamp } from "firebase/firestore"; // Import Firestore functions: doc, setDoc, serverTimestamp
import { auth, provider, db } from "@/config/firebase"; // Your Firebase client-side auth instance, Google provider, and db

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
  const [currentStep, setCurrentStep] = useState(1);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [college, setCollege] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [selectedRole, setSelectedRole] = useState<"student" | "expert">("student");
  const [agreeTerms, setAgreeTerms] = useState(false);

  // New states for expert-specific fields (for initial population)
  const [expertProfessionalRole, setExpertProfessionalRole] = useState(""); // e.g., "Aptitude Expert"
  const [expertBio, setExpertBio] = useState("");
  const [expertTags, setExpertTags] = useState(""); // Comma-separated tags

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
    // Basic validation for common fields
    if (!email || !password || !firstName || !lastName || !college || !yearOfStudy || !selectedRole) {
      setError("Please fill in all required fields.");
      return;
    }
    // Additional validation for expert fields if role is expert
    if (selectedRole === 'expert' && (!expertProfessionalRole || !expertBio || !expertTags)) {
        setError("Please fill in all required expert details.");
        return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Create user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log("User successfully created in Firebase Auth. UID:", user.uid);

      const token = await user.getIdToken();

      // 2. Prepare data for the 'users' collection (all users get this)
      const userProfileData = {
        uid: user.uid,
        email: user.email,
        firstName: firstName,
        lastName: lastName,
        college: college,
        year_of_study: yearOfStudy,
        role: selectedRole, // 'student' or 'expert'
        status: selectedRole === 'student' ? 'approved' : 'pending', // 'approved' for student, 'pending' for expert by default
        isExpertApproved: selectedRole === 'expert' ? false : null, // Only for experts, defaults to false
        createdAt: serverTimestamp(), // Use Firestore server timestamp
      };

      console.log("Sending user profile data to backend (users collection):", userProfileData);

      // Send to /api/users endpoint to store in 'users' collection (backend handles doc(uid).set())
      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Pass ID token for server-side auth check
        },
        body: JSON.stringify(userProfileData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save user profile to database.");
      }

      console.log("User profile saved to Firestore (users collection):", data.message);

      // 3. Conditionally create document in 'experts' collection if role is expert
      if (selectedRole === 'expert') {
        const expertProfileForCollection = {
          // Fields that are specific to the expert's public profile
          name: `${firstName} ${lastName}`, // Combined name for display
          bio: expertBio,
          role: expertProfessionalRole, // The professional role like "Aptitude Expert"
          tags: expertTags.split(',').map(tag => tag.trim()).filter(tag => tag), // Split and clean tags
          
          // Initialize other expert fields with default values
          experience: 'Newly Joined', // Default value
          color: 'gray', // Default color for avatar background, can be updated later
          description: `Specializes in ${expertProfessionalRole || 'various subjects'}.`, // Basic description
          initials: `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase(),
          rating: 0,
          resources: 0,
          sessions: 0,
          students: 0,
          // NOTE: uid, email, isExpertApproved, createdAt are in the 'users' collection
          // but you might want to link it with expertId: user.uid,
          // or just assume the doc ID is the UID
        };
        console.log("Creating expert profile in 'experts' collection:", expertProfileForCollection);
        // Use setDoc with user.uid as the document ID for the experts collection
        await setDoc(doc(db, "experts", user.uid), expertProfileForCollection);
        console.log("Expert profile created in 'experts' collection.");
      }

      // AuthContext will handle redirection after successful login/registration
      // (as it observes onAuthStateChanged and fetches user data)

    } catch (err: any) {
      console.error("Registration error:", err);
      // More user-friendly error messages based on Firebase error codes
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

  // Handles Google Sign-in (similar logic, but Google provides some fields)
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      console.log("Signed in with Google. UID:", user.uid);

      const token = await user.getIdToken();
      const { firstName: googleFirstName, lastName: googleLastName } = parseDisplayName(user.displayName);

      // 2. Prepare data for the 'users' collection (all users get this)
      const userProfileData = {
        uid: user.uid,
        email: user.email || "",
        firstName: googleFirstName,
        lastName: googleLastName,
        college: "N/A", // Google doesn't provide, default
        year_of_study: "N/A", // Google doesn't provide, default
        role: selectedRole,
        status: selectedRole === 'student' ? 'approved' : 'pending',
        isExpertApproved: selectedRole === 'expert' ? false : null,
        createdAt: serverTimestamp(),
      };

      console.log("Sending Google user profile data to backend (users collection):", userProfileData);

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

      console.log("Google user profile saved to Firestore (users collection):", data.message);

      // 3. Conditionally create document in 'experts' collection if role is expert
      if (selectedRole === 'expert') {
        const expertProfileForCollection = {
          name: `${googleFirstName} ${googleLastName}`,
          bio: expertBio,
          role: expertProfessionalRole,
          tags: expertTags.split(',').map(tag => tag.trim()).filter(tag => tag),
          
          experience: 'Newly Joined',
          color: 'gray',
          description: `Specializes in ${expertProfessionalRole || 'various subjects'}.`,
          initials: `${googleFirstName.charAt(0)}${googleLastName.charAt(0)}`.toUpperCase(),
          rating: 0,
          resources: 0,
          sessions: 0,
          students: 0,
        };
        console.log("Creating expert profile in 'experts' collection:", expertProfileForCollection);
        await setDoc(doc(db, "experts", user.uid), expertProfileForCollection);
        console.log("Expert profile created in 'experts' collection.");
      }

      // AuthContext will handle redirection after successful login/registration

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
                  onValueChange={(value) => setSelectedRole(value as "student" | "expert")}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student/Candidate</SelectItem>
                    <SelectItem value="expert">Expert/Trainer</SelectItem>
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
                    setError(null);
                    setCurrentStep(2);
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
              {selectedRole === 'student' && (
                <>
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
                </>
              )}

              {selectedRole === 'expert' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="expertRole">Your Professional Role (e.g., "Aptitude Expert")</Label>
                    <Input
                      name="expertRole"
                      id="expertRole"
                      placeholder="e.g., Aptitude Expert, Soft Skills Trainer"
                      value={expertProfessionalRole}
                      onChange={(e) => setExpertProfessionalRole(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expertBio">Your Bio</Label>
                    <textarea
                      id="expertBio"
                      rows={4}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={expertBio}
                      onChange={(e) => setExpertBio(e.target.value)}
                      placeholder="Tell us about your experience and expertise."
                      required
                    ></textarea>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expertTags">Tags (comma-separated, e.g., "Aptitude, Vedic Math")</Label>
                    <Input
                      name="expertTags"
                      id="expertTags"
                      placeholder="e.g., Aptitude, TCS NQT, Soft Skills"
                      value={expertTags}
                      onChange={(e) => setExpertTags(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}

              {/* Role display (read-only) for context */}
              <div className="space-y-2">
                <Label htmlFor="selectedRoleDisplay">Selected Role</Label>
                <Input
                  id="selectedRoleDisplay"
                  value={selectedRole === 'student' ? 'Student/Candidate' : 'Expert/Trainer'}
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
                onClick={() => setCurrentStep(1)}
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