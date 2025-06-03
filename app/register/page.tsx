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
  // State for all form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [college, setCollege] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState(""); // Controlled state for Select
  const [agreeTerms, setAgreeTerms] = useState(false); // Renamed for clarity

  // UI states
  const [loading, setLoading] = useState(false); // For email/password signup button
  const [googleLoading, setGoogleLoading] = useState(false); // For Google signup button
  const [error, setError] = useState<string | null>(null); // For displaying error messages to the user

  const router = useRouter(); // Initialize useRouter hook for navigation

  // Handles email/password registration
  const handleEmailPasswordRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission

    // Basic client-side validation
    if (!agreeTerms) {
      setError("Please agree to the terms and conditions.");
      return;
    }
    if (!email || !password || !firstName || !lastName || !college || !yearOfStudy) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true); // Start loading state for the button
    setError(null); // Clear any previous errors

    try {
      // 1. Create user in Firebase Authentication
      // This is the crucial step: Firebase handles the user account creation and password hashing.
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user; // Get the user object from the successful credential

      console.log("User successfully created in Firebase Auth. UID:", user.uid);

      // 2. Get Firebase ID token for backend verification
      // This token proves the user's identity to your backend.
      const token = await user.getIdToken();

      // 3. Prepare additional user profile data for Firestore
      // This data will be sent to your backend API to be saved in your Firestore database.
      // The 'uid' links this profile data to the Firebase Auth user.
      const userProfileData = {
        uid: user.uid, // The unique Firebase Auth User ID
        email: user.email, // Email from Firebase Auth
        firstName: firstName,
        lastName: lastName,
        college: college,
        year_of_study: yearOfStudy,
        createdAt: new Date().toISOString(), // Timestamp for when the profile was created
      };

      // 4. Send additional user profile data to your backend API
      // This POST request goes to your /api/users endpoint to save the profile in Firestore.
      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Send the ID token in the header for backend verification
        },
        body: JSON.stringify(userProfileData) // Send the profile data in the body
      });

      const data = await res.json(); // Parse the response from your backend

      // Check if the backend API call was successful
      if (!res.ok) {
        // If backend returns an error (e.g., Firestore write failed)
        throw new Error(data.error || "Failed to save user profile to database.");
      }

      console.log("User profile saved to Firestore:", data.message);

      // 5. Store the Firebase ID token and user info locally for immediate session
      localStorage.setItem("authToken", token);
      localStorage.setItem("userInfo", JSON.stringify(userProfileData)); // Store the full profile data

      // 6. Redirect to a protected page after successful registration
      router.push("/"); // Navigate to your dashboard or a welcome page

    } catch (err: any) {
      console.error("Registration error:", err); // Log the full error object for debugging

      // Provide user-friendly error messages based on Firebase Auth error codes
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please try logging in.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. It must be at least 6 characters.');
      } else if (err.code === 'auth/invalid-email') {
        setError('The email address is not valid.');
      } else {
        // Fallback for other unexpected errors
        setError(err.message || "An unexpected error occurred during registration.");
      }
    } finally {
      setLoading(false); // End loading state
    }
  };

  // Handles Google Sign-in (Minor adjustments for consistency)
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true); // Start Google loading state
    setError(null); // Clear any previous errors

    try {
      // 1. Authenticate with Google using Firebase signInWithPopup
      const result = await signInWithPopup(auth, provider);
      const user = result.user; // User object from successful Google sign-in

      console.log("Signed in with Google. UID:", user.uid);

      // 2. Get Firebase ID token for backend verification
      const token = await user.getIdToken();

      // 3. Prepare user profile data for Firestore (adjust defaults for Google users)
      const userProfileData = {
        uid: user.uid,
        email: user.email || "", // Email might be null/undefined for some providers
        firstName: user.displayName?.split(" ")[0] || "",
        lastName: "N/A",
        college: "N/A", // Google sign-in doesn't provide this, set default or ask later
        year_of_study: "N/A", // Google sign-in doesn't provide this, set default or ask later
        createdAt: new Date().toISOString(),
      };

      // 4. Send profile data to backend (same /api/users POST endpoint)
      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Send token for backend verification
        },
        body: JSON.stringify(userProfileData)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save Google user profile.");
      }

      console.log("Google user profile saved to Firestore:", data.message);

      // 5. Store token and user info locally
      localStorage.setItem("authToken", token);
      localStorage.setItem("userInfo", JSON.stringify(userProfileData));

      // 6. Redirect after successful Google sign-in
      router.push("/");

    } catch (err: any) {
      console.error("Google sign-in error:", err); // Log the full error

      // Provide user-friendly error messages
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
      setGoogleLoading(false); // End Google loading state
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8 px-4">
      <Card className="w-full max-w-md">
        {/* Attach the email/password submission handler to the form */}
        <form onSubmit={handleEmailPasswordRegister}>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
            <CardDescription className="text-center">
              Enter your details to register for APT-TECH Connect
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
                  value={firstName} // Controlled input
                  onChange={(e) => setFirstName(e.target.value)} // Update state
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  name="lastName"
                  id="lastName"
                  placeholder="Enter your last name"
                  value={lastName} // Controlled input
                  onChange={(e) => setLastName(e.target.value)} // Update state
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
                value={email} // Controlled input
                onChange={(e) => setEmail(e.target.value)} // Update state
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                name="password"
                id="password"
                type="password"
                value={password} // Controlled input
                onChange={(e) => setPassword(e.target.value)} // Update state
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="college">College/University</Label>
              <Input
                name="college"
                id="college"
                placeholder="Enter your college"
                value={college} // Controlled input
                onChange={(e) => setCollege(e.target.value)} // Update state
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Year of Study</Label>
              <Select
                name="year"
                value={yearOfStudy} // Controlled component: value tied to state
                onValueChange={(value) => setYearOfStudy(value)} // Update state on change
                required // Mark as required
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
              {/* Removed hidden input as Select is now fully controlled by state */}
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={agreeTerms}
                onCheckedChange={(checked) => setAgreeTerms(!!checked)} // Ensure boolean
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

            {/* Google Sign In Button */}
            <Button
              type="button" // Important: set type="button" to prevent form submission
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
            >
              {googleLoading ? "Signing in with Google..." : "Sign up with Google"}
            </Button>

            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
