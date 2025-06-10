// app/login/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Checkbox } from "@/components/ui/checkbox"; // Keeping rememberMe checkbox
import Link from "next/link";
import { Loader2 } from "lucide-react"; // For loading spinner
import { signOut } from "firebase/auth"; // For potential cleanup on error
// Import necessary Firebase Auth functions and your auth instance/provider
import { auth, provider } from "@/config/firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  setPersistence,
  browserSessionPersistence,
  browserLocalPersistence,
} from "firebase/auth";

// Import your AuthContext hook
import { useAuth } from '@/app/context/authContext'; // Adjust path if different

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // For email/password login button
  const [googleLoading, setGoogleLoading] = useState(false); // For Google login button

  const router = useRouter();

  // Get authentication state from AuthContext
  const { userData, loading: authContextLoading, isAuthenticated } = useAuth();

  // --- Redirection Logic ---
  useEffect(() => {
    // Only proceed if AuthContext has finished its initial loading check
    if (authContextLoading) {
      return;
    }

    // If already authenticated and userData is available, redirect based on role
    if (isAuthenticated && userData) {
      let redirectPath = '/'; // Default for general authenticated users

      if (userData.role === 'admin') {
        redirectPath = '/admin/dashboard';
      } else if (userData.role === 'expert') {
        redirectPath = '/experts/dashboard';
      } else if (userData.role === 'student') {
        redirectPath = '/'; // Students can go to their profile or a specific student dashboard
      }
      // You can add more specific redirections based on role and approval status if needed
      // e.g., if (userData.role === 'expert' && userData.isExpertApproved === false) { redirectPath = '/expert-pending-approval'; }

      router.push(redirectPath);
      console.log(`User ${userData.email} (${userData.role}) redirected to ${redirectPath}`);
    }
    // If not authenticated, do nothing, stay on login page to allow login.
  }, [isAuthenticated, userData, authContextLoading, router]); // Dependencies: reruns when these change

  // --- Email/Password Login Handler ---
  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null); // Clear previous errors

    try {
      // Set Firebase persistence based on "Remember me" checkbox
      await setPersistence(
        auth,
        rememberMe ? browserLocalPersistence : browserSessionPersistence
      );

      await signInWithEmailAndPassword(auth, email, password);

      // Successfully signed in via Firebase Auth.
      // The `onAuthStateChanged` listener in AuthContext will now trigger,
      // fetch the full user profile, update `userData`, and then the useEffect above
      // will handle the role-based redirection.
      console.log("Firebase email/password sign-in successful. AuthContext will handle redirection.");

    } catch (err: any) {
      console.error("Email/Password Login error:", err);
      // Provide user-friendly error messages based on Firebase Auth error codes
      if (err.code === 'auth/invalid-email' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/user-disabled') {
        setError('This account has been disabled.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many login attempts. Please try again later.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Network error. Please check your internet connection.');
      } else {
        setError(`Login failed: ${err.message || 'An unexpected error occurred.'}`);
      }
    } finally {
      setLoading(false); // Stop loading regardless of success or failure
    }
  };

  // --- Google Login Handler ---
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null); // Clear previous errors

    try {
      // Set Firebase persistence based on "Remember me" checkbox
      await setPersistence(
        auth,
        rememberMe ? browserLocalPersistence : browserSessionPersistence
      );

      await signInWithPopup(auth, provider);

      // Successfully signed in via Google popup.
      // Similar to email/password, AuthContext will handle the subsequent
      // profile fetching and role-based redirection.
      console.log("Google sign-in successful. AuthContext will handle redirection.");

    } catch (err: any) {
      console.error("Google Login error:", err);
      if (err.code === "auth/popup-closed-by-user") {
        setError("Google sign-in cancelled.");
      } else if (err.code === "auth/cancelled-popup-request") {
        setError("Google sign-in cancelled or blocked by browser.");
      } else if (err.code === "auth/account-exists-with-different-credential") {
        setError("An account with this email already exists using a different sign-in method. Please login with that method.");
      } else {
        setError(`Google login failed: ${err.message || 'An unexpected error occurred.'}`);
      }
    } finally {
      setGoogleLoading(false); // Stop loading regardless of success or failure
    }
  };

  // --- Conditional Rendering for Loading/Redirecting ---
  // If AuthContext is still loading OR if user is authenticated and userData is available
  // (meaning redirection is in progress or about to happen), show a "Redirecting..." message.
  if (authContextLoading || (isAuthenticated && userData)) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8 px-4">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        <p className="text-lg">Redirecting to your dashboard...</p>
      </div>
    );
  }

  // --- Login Form UI ---
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
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(!!checked)}
              />
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