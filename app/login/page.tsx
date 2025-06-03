"use client";

import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";

// Import necessary Firebase Auth functions and your auth instance/provider
import { auth, provider } from "@/config/firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  setPersistence, // Import setPersistence
  browserSessionPersistence, // Import session persistence option
  browserLocalPersistence, // Import local persistence option
} from "firebase/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false); // New state for 'Remember me' checkbox
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const router = useRouter();

  // Helper function to handle common login logic after Firebase Auth succeeds
  const handleSuccessfulLogin = async (user: any) => {
    try {
      const token = await user.getIdToken();
      console.log("Firebase ID Token obtained:", token);

      // Send the token to your backend for verification (in the Authorization header)
      const response = await fetch("/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Login failed on backend verification."
        );
      }

      const data = await response.json();
      console.log("Backend verification successful:", data);

      // Store the token and user info
      localStorage.setItem("authToken", token);
      localStorage.setItem("userInfo", JSON.stringify(data.user));

      // Redirect
      router.push("/"); // Redirect to home or dashboard
    } catch (err: any) {
      console.error("Post-auth process error:", err);
      // If there's an error after successful Firebase auth but before backend verification,
      // it's good to sign out the user from Firebase to avoid a partial login state.
      signOut(auth);
      localStorage.removeItem("authToken");
      localStorage.removeItem("userInfo");
      setError(
        err.message ||
          "An error occurred after authentication. Please try again."
      );
    }
  };

  // Email/Password Login Handler
  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // --- NEW: Set Firebase persistence based on 'rememberMe' state ---
      await setPersistence(
        auth,
        rememberMe ? browserLocalPersistence : browserSessionPersistence
      );

      // Authenticate with Firebase using email and password
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await handleSuccessfulLogin(user); // Call common logic
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
      setLoading(false);
    }
  };

  // Google Login Handler
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null);

    try {
      // --- NEW: Set Firebase persistence based on 'rememberMe' state ---
      await setPersistence(
        auth,
        rememberMe ? browserLocalPersistence : browserSessionPersistence
      );

      // Initiate Google sign-in popup
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await handleSuccessfulLogin(user); // Call common logic
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
      setGoogleLoading(false);
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
              <Checkbox
                id="remember"
                checked={rememberMe} // Bind checkbox to state
                onCheckedChange={(checked) => setRememberMe(!!checked)} // Update state on change
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
