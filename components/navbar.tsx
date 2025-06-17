// components/Navbar.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { User, BookOpen, CircleUser, Loader2 } from "lucide-react";
import { ModeToggle } from "./mode-toggle";
import Image from "next/image";
import MobileNav from "./mobile-nav";
import { cn } from "@/lib/utils";

import { useAuth } from '@/app/context/authContext'; // Adjust path if different

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const { userData, loading: authLoading, isAuthenticated } = useAuth();

  // Define route arrays for different roles
  const defaultRoutes = [ // These are for students and unauthenticated users
    { href: "/", label: "Home" },
    { href: "/forums", label: "Forums" },
    { href: "/experts", label: "Experts" },
    { href: "/qa-sessions", label: "Q&A Sessions" },
    { href: "/resources", label: "Resources" },
    { href: "/mentorship", label: "Mentorship" },
  ];

  const adminRoutes = [
    { href: "/admin/dashboard", label: "Home" },
    { href: "/admin/forums", label: "Forum" },
    { href: "/admin/manage-admins", label: "Manage Admin" },
    { href: "/admin/manage-experts", label: "Manage Experts" },
    { href: "/admin/manage-students", label: "Manage Students" },
    
  ];

  const expertRoutes = [
    { href: "/experts/dashboard", label: "Home" },
    { href: "/experts/sessions", label: "Sessions" },
    { href: "/forums", label: "Forum" },
    { href: "/experts/q&a", label: "Q&A" },
    { href: "/experts", label: "Experts" },
 // Using '&' in path as per request
     // Using '&' in path as per request
  ];

  // Select the appropriate routes based on the user's role
  let currentRoutes = defaultRoutes;
  if (isAuthenticated && userData?.role === 'admin') {
    currentRoutes = adminRoutes;
  } else if (isAuthenticated && userData?.role === 'expert') {
    currentRoutes = expertRoutes;
  } else {
    // If not authenticated or role is 'student' (or unknown), use defaultRoutes
    currentRoutes = defaultRoutes;
  }

  // Determine the display name: prioritize firstName, then email
  const displayUserName = userData?.firstName || userData?.email;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/images/apt-tech-logo.png" alt="APT-TECH Logo" width={40} height={40} />
            <span className="font-bold text-xl hidden sm:inline-block">
              <span className="text-black dark:text-white">APT</span>
              <span className="text-blue-600">TECH</span>
              <span className="text-xs block text-muted-foreground -mt-1">Campus Recruitment Training</span>
            </span>
          </Link>
        </div>

        {/* Dynamic Navigation Links for Desktop */}
        <nav className="hidden md:flex items-center gap-6">
          {currentRoutes.map((route) => {
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
          {/* Conditional rendering for user profile/login/register buttons */}
          {authLoading ? (
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          ) : isAuthenticated ? (
            <Link href="/profile">
              <Button variant="outline" size="sm" className="gap-1 flex">
                <CircleUser className="h-4 w-4" />
                <span>Hello, {displayUserName || 'User'}!</span>
              </Button>
            </Link>
          ) : (
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
          <MobileNav /> {/* Consider passing currentRoutes to MobileNav as well if it needs dynamic links */}
        </div>
      </div>
    </header>
  );
}