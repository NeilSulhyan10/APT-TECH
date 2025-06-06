"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { User, BookOpen, CircleUser, Home, CheckCircle2, Users, GraduationCap, Briefcase } from "lucide-react"; // Added new icons
import { ModeToggle } from "./mode-toggle";
import Image from "next/image";
import MobileNav from "./mobile-nav";
import { cn } from "@/lib/utils";

import { useAuth } from '@/context/AuthContext'; // Import useAuth hook for centralized auth state

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const { user, userProfile, loading } = useAuth(); // Get auth state and profile from context
    const [isClient, setIsClient] = useState(false); // To ensure rendering only on client

    // This effect runs once to confirm client-side environment
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Determine the user's display name for the profile button.
    // Falls back to email or a generic 'Profile' if name is not available.
    const displayUserName = userProfile?.firstName || userProfile?.email?.split('@')[0] || 'Profile';

    // Helper to get the correct dashboard path based on role.
    // This is useful for the generic "Dashboard" link for non-admin roles.
    const getDashboardPath = (role: string) => {
        switch (role) {
            case 'admin':
                return '/admin/dashboard';
            case 'expert':
                return '/expert/dashboard';
            case 'user':
                return '/user/dashboard';
            default:
                return '/'; // Fallback
        }
    };

    // Render nothing on the server or if AuthContext is still loading
    // This prevents hydration errors and ensures user data is ready before rendering.
    if (!isClient || loading) {
        return null;
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                {/* Logo and Site Title */}
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

                {/* Main Navigation Links (hidden on smaller screens) */}
                <nav className="hidden md:flex items-center gap-6">
                    {/* Conditional rendering based on user's login status and role */}
                    {user && userProfile ? ( // User is logged in AND profile data is available
                        <>
                            {userProfile.role === 'admin' ? (
                                // Admin Navbar Links
                                <>
                                    <Link href="/admin/dashboard" className={cn("text-sm font-medium transition-colors hover:text-primary", pathname === "/admin/dashboard" ? "text-primary" : "text-muted-foreground")}>
                                        <Home className="inline-block h-4 w-4 mr-1" /> Dashboard
                                    </Link>
                                    <Link href="/admin/manage-experts" className={cn("text-sm font-medium transition-colors hover:text-primary", pathname === "/admin/manage-experts" ? "text-primary" : "text-muted-foreground")}>
                                        <CheckCircle2 className="inline-block h-4 w-4 mr-1" /> Approvals
                                    </Link>
                                    <Link href="/admin/manage-admins" className={cn("text-sm font-medium transition-colors hover:text-primary", pathname === "/admin/manage-admins" ? "text-primary" : "text-muted-foreground")}>
                                        <Users className="inline-block h-4 w-4 mr-1" /> Manage Admins
                                    </Link>
                                    <Link href="/admin/manage-users" className={cn("text-sm font-medium transition-colors hover:text-primary", pathname.startsWith("/admin/manage-users") ? "text-primary" : "text-muted-foreground")}>
                                        <GraduationCap className="inline-block h-4 w-4 mr-1" /> Manage Students
                                    </Link>
                                    <Link href="/admin/manage-experts-detailed" className={cn("text-sm font-medium transition-colors hover:text-primary", pathname.startsWith("/admin/manage-experts-detailed") ? "text-primary" : "text-muted-foreground")}>
                                        <Briefcase className="inline-block h-4 w-4 mr-1" /> Manage Experts
                                    </Link>
                                </>
                            ) : userProfile.role === 'expert' ? (
                                // Expert Navbar Links
                                <>
                                    <Link href={getDashboardPath(userProfile.role)} className={cn("text-sm font-medium transition-colors hover:text-primary", pathname.startsWith(getDashboardPath(userProfile.role)) ? "text-primary" : "text-muted-foreground")}>
                                        Dashboard
                                    </Link>
                                    <Link href="/expert/my-sessions" className={cn("text-sm font-medium transition-colors hover:text-primary", pathname === "/expert/my-sessions" ? "text-primary" : "text-muted-foreground")}>
                                        My Sessions
                                    </Link>
                                    <Link href="/expert/my-resources" className={cn("text-sm font-medium transition-colors hover:text-primary", pathname === "/expert/my-resources" ? "text-primary" : "text-muted-foreground")}>
                                        My Resources
                                    </Link>
                                    <Link href="/expert/profile-settings" className={cn("text-sm font-medium transition-colors hover:text-primary", pathname === "/expert/profile-settings" ? "text-primary" : "text-muted-foreground")}>
                                        Mentor Profile
                                    </Link>
                                </>
                            ) : ( // Default to 'user' (student) or other roles
                                // Student/Candidate Navbar Links (also for general logged-in users)
                                <>
                                    <Link href={getDashboardPath(userProfile.role)} className={cn("text-sm font-medium transition-colors hover:text-primary", pathname.startsWith(getDashboardPath(userProfile.role)) ? "text-primary" : "text-muted-foreground")}>
                                        Dashboard
                                    </Link>
                                    <Link href="/resources" className={cn("text-sm font-medium transition-colors hover:text-primary", pathname === "/resources" ? "text-primary" : "text-muted-foreground")}>
                                        Resources
                                    </Link>
                                    <Link href="/contact" className={cn("text-sm font-medium transition-colors hover:text-primary", pathname === "/contact" ? "text-primary" : "text-muted-foreground")}>
                                        Contact
                                    </Link>
                                    <Link href="/forums" className={cn("text-sm font-medium transition-colors hover:text-primary", pathname === "/forums" ? "text-primary" : "text-muted-foreground")}>
                                        Forums
                                    </Link>
                                    <Link href="/experts" className={cn("text-sm font-medium transition-colors hover:text-primary", pathname === "/experts" ? "text-primary" : "text-muted-foreground")}>
                                        Experts
                                    </Link>
                                    <Link href="/qa-sessions" className={cn("text-sm font-medium transition-colors hover:text-primary", pathname === "/qa-sessions" ? "text-primary" : "text-muted-foreground")}>
                                        Q&A Sessions
                                    </Link>
                                    <Link href="/mentorship" className={cn("text-sm font-medium transition-colors hover:text-primary", pathname === "/mentorship" ? "text-primary" : "text-muted-foreground")}>
                                        Mentorship
                                    </Link>
                                </>
                            )}
                        </>
                    ) : (
                        // Public/Logged-Out Navbar Links
                        <>
                            <Link href="/resources" className={cn("text-sm font-medium transition-colors hover:text-primary", pathname === "/resources" ? "text-primary" : "text-muted-foreground")}>
                                Resources
                            </Link>
                            <Link href="/contact" className={cn("text-sm font-medium transition-colors hover:text-primary", pathname === "/contact" ? "text-primary" : "text-muted-foreground")}>
                                Contact
                            </Link>
                            {/* Login/Register buttons here for larger screens when logged out */}
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
                </nav>

                {/* Right-aligned elements: Mode Toggle and Profile/Login/Register Buttons */}
                <div className="flex items-center gap-2">
                    <ModeToggle />
                    {user ? ( // If user is logged in (regardless of role), show profile button
                        <Link href="/profile" passHref>
                            <Button asChild variant="outline" size="sm" className="gap-1 flex">
                                <a>
                                    <CircleUser className="h-4 w-4" />
                                    <span>Hello, {displayUserName}!</span>
                                </a>
                            </Button>
                        </Link>
                    ) : (
                        // Login/Register buttons here for smaller screens, or if they were hidden in nav on large screens
                        // We avoid duplicating these for large screens since they are in <nav> above.
                        // This block primarily serves MobileNav or if MD+ buttons were removed from <nav> for aesthetic choice.
                        // For the current setup, these might seem redundant if the <nav> block for !user is always visible,
                        // but it ensures MobileNav has the props it needs, or if this changes later.
                        <>
                           {/* These buttons are intentionally placed here for MobileNav's use,
                                and are hidden on larger screens by "hidden md:block" in the <nav> section.
                                If you only have the <nav> section, you can remove these entirely.
                                Keeping them for now as per previous structure. */}
                           <Link href="/login" className="hidden md:block"> {/* Hidden on MD+ as they are in <nav> */}
                               <Button variant="outline" size="sm" className="gap-1">
                                   <User className="h-4 w-4" />
                                   <span>Login</span>
                               </Button>
                           </Link>
                           <Link href="/register" className="hidden md:block"> {/* Hidden on MD+ as they are in <nav> */}
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
