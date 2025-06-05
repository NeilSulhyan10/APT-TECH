"use client"; // This directive makes this component a Client Component

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { User, BookOpen, CircleUser } from "lucide-react"; // Removed LogOut icon, kept CircleUser
import { ModeToggle } from "./mode-toggle";
import Image from "next/image";
import MobileNav from "./mobile-nav";
import { cn } from "@/lib/utils";

// auth is imported here for potential future use or if onAuthStateChanged was enabled
// but signOut is NOT used directly in this Navbar
import { auth } from '@/config/firebase';

export default function Navbar() {
  const [userName, setUserName] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // console.log("Navbar useEffect: Running on mount/re-render."); // Keep for debugging if needed
    const storedUserInfo = localStorage.getItem('userInfo');

    // console.log("Navbar useEffect: userInfo in localStorage:", storedUserInfo ? "Exists" : "Does NOT exist");

    if (storedUserInfo) {
      try {
        const userInfo = JSON.parse(storedUserInfo);
        // console.log("Navbar useEffect: Parsed userInfo from localStorage:", userInfo);

        // Prioritize firstName, then email, then uid for display
        // This relies on `login/page.tsx` correctly storing `firstName` in userInfo.
        const displayUserName = userInfo.firstName;
        setUserName(displayUserName);
        // console.log("Navbar useEffect: userName set to:", displayUserName);

      } catch (e) {
        console.error("Navbar useEffect: Failed to parse userInfo from localStorage:", e);
        localStorage.removeItem('userInfo');
        localStorage.removeItem('authToken');
        setUserName(null); // Ensure no name is displayed
      }
    } else {
      setUserName(null);
      // console.log("Navbar useEffect: No userInfo in localStorage, userName set to null.");
    }
  }, []); // Empty dependency array means this effect runs once on mount

  // handleLogout function is intentionally REMOVED from Navbar as per your request
  // It should only be present on the Profile page.

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
            // If user is logged in, show a single Profile link with user's name and icon
            <Link href="/profile"> {/* No 'hidden' class here, it should always be visible */}
              <Button variant="outline" size="sm" className="gap-1 flex"> {/* 'flex' ensures icon and text are inline */}
                <CircleUser className="h-4 w-4" />
                <span>Hello, {userName}!</span> {/* Greeting and name combined */}
              </Button>
            </Link>
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
                  <BookOpen className="h-4 w-4" />
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
