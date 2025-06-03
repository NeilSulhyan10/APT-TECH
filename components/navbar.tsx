"use client"; // This directive makes this component a Client Component

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation'; // Added usePathname for active link styling
import { Button } from "@/components/ui/button";
import { User, BookOpen, LogOut } from "lucide-react"; // Added LogOut icon
import { ModeToggle } from "./mode-toggle";
import Image from "next/image";
import MobileNav from "./mobile-nav";
import { cn } from "@/lib/utils"; // Assuming this utility is available

// Import Firebase auth instance and signOut function
import { auth } from '@/config/firebase'; // Ensure your client-side auth instance is exported from here
import { signOut } from 'firebase/auth'; // Firebase function to sign out the user

export default function Navbar() {
  // State to hold the logged-in user's display name
  const [userName, setUserName] = useState<string | null>(null);
  const router = useRouter(); // Initialize Next.js router
  const pathname = usePathname(); // Get current path for active link styling

  // Effect to read user info from localStorage on component mount
  useEffect(() => {
    console.log("Navbar useEffect: Running on mount/re-render."); // Debugging log
    const storedAuthToken = localStorage.getItem('authToken');
    const storedUserInfo = localStorage.getItem('userInfo');

    console.log("Navbar useEffect: authToken in localStorage:", storedAuthToken ? "Exists" : "Does NOT exist"); // Debugging log
    console.log("Navbar useEffect: userInfo in localStorage:", storedUserInfo ? "Exists" : "Does NOT exist"); // Debugging log

    if (storedUserInfo) {
      try {
        const userInfo = JSON.parse(storedUserInfo);
        console.log("Navbar useEffect: Parsed userInfo:", userInfo); // Debugging log
        // Prioritize firstName, then email, then uid for display
        setUserName(userInfo.firstName || userInfo.email || userInfo.uid);
      } catch (e) {
        console.error("Navbar useEffect: Failed to parse userInfo from localStorage:", e); // Debugging log
        // If parsing fails, clear potentially corrupted data
        localStorage.removeItem('userInfo');
        localStorage.removeItem('authToken');
        setUserName(null); // Ensure no name is displayed
      }
    } else {
      setUserName(null); // Explicitly set to null if no userInfo is found
    }

    // Optional: You could also add an onAuthStateChanged listener here
    // to react to real-time Firebase Auth state changes.
    // This is more robust for dynamic auth state changes (e.g., token expiry)
    // but might cause extra re-renders if not carefully managed.
    // const unsubscribe = onAuthStateChanged(auth, (user) => {
    //   console.log("onAuthStateChanged fired. User:", user ? user.uid : "null");
    //   if (user) {
    //     // User is signed in, update state if needed
    //     const currentInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    //     if (user.uid !== currentInfo.uid || !currentInfo.uid) { // Only update if it's a different user or missing
    //         const newInfo = { uid: user.uid, email: user.email, firstName: user.displayName?.split(" ")[0] || '' };
    //         localStorage.setItem('userInfo', JSON.stringify(newInfo));
    //         setUserName(newInfo.firstName || newInfo.email || newInfo.uid);
    //     }
    //   } else {
    //     // User is signed out
    //     localStorage.removeItem('userInfo');
    //     localStorage.removeItem('authToken');
    //     setUserName(null);
    //   }
    // });
    // return () => unsubscribe(); // Cleanup the listener on unmount
  }, []); // Empty dependency array means this effect runs once on mount

  // Handles user logout
  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out the user from Firebase Authentication
      localStorage.removeItem('authToken'); // Clear the authentication token from local storage
      localStorage.removeItem('userInfo'); // Clear user information from local storage
      setUserName(null); // Reset the userName state to null
      router.push('/login'); // Redirect the user to the login page
    } catch (error) {
      console.error("Error logging out:", error);
      // Optionally display an error message to the user if logout fails
      // setError("Failed to log out. Please try again.");
    }
  };

  const routes = [
    { href: "/", label: "Home" },
    { href: "/forums", label: "Forums" },
    { href: "/experts", label: "Experts" },
    { href: "/qa-sessions", label: "Q&A Sessions" },
    { href: "/resources", label: "Resources" },
    { href: "/mentorship", label: "Mentorship" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            {/* Ensure your image path is correct. The console previously showed a 404 for this. */}
            <Image src="/images/apt-tech-logo.png" alt="APT-TECH Logo" width={40} height={40} className="h-10 w-auto" />
            <span className="font-bold text-xl hidden sm:inline-block">
              <span className="text-black dark:text-white">APT</span>
              <span className="text-blue-600">TECH</span>
              <span className="text-xs block text-muted-foreground -mt-1">Campus Recruitment Training</span>
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {routes.map((route) => {
            const isActive = pathname === route.href;
            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
              >
                {route.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ModeToggle />
          {/* Conditional rendering based on authentication status */}
          {userName ? (
            // If user is logged in, show their name and a Logout button
            <>
              <span className="text-gray-800 dark:text-gray-200 font-medium hidden md:block">
                Hello, {userName}!
              </span>
              <Button onClick={handleLogout} variant="outline" size="sm" className="gap-1 hidden md:flex">
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </>
          ) : (
            // If no user is logged in, show Login and Register buttons
            <>
              <Link href="/login" className="hidden md:block">
                <Button variant="outline" size="sm" className="gap-1">
                  <User className="h-4 w-4" />
                  <span>Login</span>
                </Button>
              </Link>
              <Link href="/register" className="hidden md:block">
                <Button size="sm" className="gap-1">
                  <BookOpen className="h-4 w-4" /> {/* Keeping BookOpen as per your original code */}
                  <span>Register</span>
                </Button>
              </Link>
            </>
          )}
          <MobileNav />
        </div>
      </div>
    </header>
  );
}