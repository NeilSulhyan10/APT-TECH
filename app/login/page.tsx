"use client";

import { useState, useEffect } from "react"; // Ensure useEffect is imported
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";

import { auth, provider } from "@/config/firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useAuth } from "@/context/AuthContext"; // Import useAuth hook

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const router = useRouter();
  const { user, userProfile, loading: authLoading } = useAuth(); // Get auth state from context

  // Redirect if already authenticated and profile loaded
  // This useEffect will be triggered by AuthContext updates after successful login
  useEffect(() => {
    // Only proceed if AuthContext has finished its initial loading of user and profile
    if (!authLoading && user && userProfile) {
      if (userProfile.role === "admin") {
        router.push("/admin/dashboard");
      } else if (userProfile.role === "expert") {
        router.push("/expert/dashboard");
      } else {
        router.push("/user/dashboard"); // Default for regular users
      }
    }
  }, [user, userProfile, authLoading, router]); // Dependencies: changes in user, userProfile, authLoading, or router trigger this effect

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Authenticate user with Firebase
      // AuthContext's onAuthStateChanged listener will detect this success,
      // fetch the user's profile, update global state, and trigger the useEffect above for redirection.
      await signInWithEmailAndPassword(auth, email, password);

      console.log("Firebase Auth (Email/Password) successful. AuthContext will handle profile fetching & redirection.");

      // Removed direct localStorage updates and router.push calls here
      // The AuthContext and its useEffect will manage the state and navigation flow.

    } catch (err: any) {
      console.error("Login error:", err);
      if (err.code === "auth/invalid-email") {
        setError("The email address is not valid.");
      } else if (err.code === "auth/user-disabled") {
        setError("This user account has been disabled.");
      } else if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      ) {
        setError("Invalid email or password. Please check your credentials.");
      } else if (err.code === "auth/network-request-failed") {
        setError("Network error. Please check your internet connection.");
      } else {
        setError(err.message || "An unexpected error occurred during login.");
      }
    } finally {
      setLoading(false); // Reset loading state regardless of success or failure
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null);

    try {
      // 1. Authenticate user with Google using Firebase popup
      // AuthContext's onAuthStateChanged listener will detect this success,
      // fetch the user's profile, update global state, and trigger the useEffect above for redirection.
      await signInWithPopup(auth, provider);

      console.log("Firebase Auth (Google) successful. AuthContext will handle profile fetching & redirection.");

      // Removed direct localStorage updates and router.push calls here
      // The AuthContext and its useEffect will manage the state and navigation flow.

    } catch (err: any) {
      console.error("Google login error:", err);
      if (err.code === "auth/popup-closed-by-user") {
        setError("Google sign-in cancelled.");
      } else if (err.code === "auth/cancelled-popup-request") {
        setError("Google sign-in cancelled or blocked by browser.");
      } else if (err.code === "auth/account-exists-with-different-credential") {
        setError(
          "An account with this email already exists using a different sign-in method. Please login with that method."
        );
      } else {
        setError(
          err.message || "An unexpected error occurred during Google login."
        );
      }
    } finally {
      setGoogleLoading(false); // Reset loading state regardless of success or failure
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8 px-4">
      <Card className="w-full max-w-md">
        <form onSubmit={handleEmailPasswordLogin}>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Welcome back
            </CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m.badve@apt-tech.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="remember" />
              <Label
                htmlFor="remember"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Remember me
              </Label>
            </div>
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
            >
              {googleLoading
                ? "Signing in with Google..."
                : "Sign in with Google"}
            </Button>

            <div className="text-center text-sm">
              Don't have an account?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
