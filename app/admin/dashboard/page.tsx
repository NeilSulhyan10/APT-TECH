// app/admin/dashboard/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext'; // Import useAuth hook
import { Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Ensure this UserProfile interface matches the one in AuthContext.tsx
interface UserProfile {
    uid: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string; // 'user', 'expert', 'admin'
    status?: 'pending' | 'approved' | 'rejected';
    createdAt?: string; // ISO string
    // Add any other profile fields you store
}

// Interface for admin activity logs, must match backend schema
interface AdminActivity {
    id: string;
    adminUid: string;
    adminEmail: string;
    action: string; // e.g., 'approve_expert', 'reject_expert', 'assign_admin_role'
    targetUid: string;
    targetEmail: string;
    targetRole: string; // Role of the target user
    targetFirstName: string;
    targetLastName: string;
    timestamp: string; // ISO string
}

export default function AdminDashboardPage() {
    const router = useRouter();
    // Destructure properties from useAuth hook
    const { user, userProfile, loading: authLoading, error: authError, logout } = useAuth();
    
    // States for dashboard-specific data
    const [otherAdmins, setOtherAdmins] = useState<UserProfile[]>([]);
    const [adminActivities, setAdminActivities] = useState<AdminActivity[]>([]);
    const [dashboardDataLoading, setDashboardDataLoading] = useState(false); // Separate loading for dashboard data
    const [dashboardDataError, setDashboardDataError] = useState<string | null>(null); // Separate error for dashboard data

    // Function to fetch all users and filter for other admins
    const fetchOtherAdmins = async (currentAdminUid: string) => {
        try {
            const authToken = localStorage.getItem('authToken'); // Get auth token for protected API
            if (!authToken) {
                setDashboardDataError("Authentication token missing for fetching other admins.");
                return;
            }

            const response = await fetch('/api/users', {
                headers: { 'Authorization': `Bearer ${authToken}` } // Send token for admin check
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch all users.');
            }
            const allUsers: UserProfile[] = await response.json();
            // Filter out the current admin and non-admin roles
            const filteredAdmins = allUsers.filter(
                (u: UserProfile) => u.role === 'admin' && u.uid !== currentAdminUid
            );
            setOtherAdmins(filteredAdmins);
        } catch (err: any) {
            console.error("Error fetching other admins:", err);
            setDashboardDataError(`Failed to load other administrators: ${err.message}`);
        }
    };

    // Function to fetch admin activity logs from the backend API
    const fetchAdminActivities = async () => {
        try {
            const authToken = localStorage.getItem('authToken');
            if (!authToken) {
                setDashboardDataError("Authentication required to fetch activity logs.");
                return;
            }

            const response = await fetch('/api/admin/activities', {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch admin activities.');
            }

            const activities: AdminActivity[] = await response.json();
            setAdminActivities(activities);
            console.log(`Fetched ${activities.length} admin activities from backend.`);

        } catch (err: any) {
            console.error("Error fetching admin activities:", err);
            setDashboardDataError(`Failed to fetch admin activities: ${err.message}`);
        }
    };

    useEffect(() => {
        // This effect runs when auth state (user, userProfile, authLoading, authError) from AuthContext changes
        if (!authLoading) { // Only proceed if AuthContext has finished loading its initial state
            if (authError) {
                // If there's an authentication error from AuthContext, redirect to login
                console.error("AuthContext Error:", authError);
                router.push('/login');
            } else if (!user) {
                // If no user is logged in (after authLoading is false), redirect to login
                router.push('/login');
            } else if (userProfile && userProfile.role !== 'admin') {
                // If user is logged in but not an "admin", redirect based on their actual role
                console.warn("Access Denied: User is not an admin. Role:", userProfile.role);
                if (userProfile.role === 'expert') {
                    router.push('/expert/dashboard');
                } else {
                    router.push('/user/dashboard'); // Default for regular users
                }
            } else if (userProfile && userProfile.role === 'admin') {
                // User is an admin, now fetch dashboard-specific data
                setDashboardDataLoading(true); // Start loading dashboard specific data
                setDashboardDataError(null); // Clear previous dashboard data errors
                Promise.all([
                    fetchOtherAdmins(user.uid), // Pass current admin UID to exclude self
                    fetchAdminActivities()
                ]).finally(() => {
                    setDashboardDataLoading(false); // Finish loading dashboard specific data
                });
            }
        }
    }, [user, userProfile, authLoading, authError, router]); // Dependencies for this effect

    // Determine overall loading and error states for rendering
    const overallLoading = authLoading || dashboardDataLoading;
    const displayError = authError || dashboardDataError;

    if (overallLoading) {
        return (
            <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8 px-4">
                <Loader2 className="mr-2 h-8 w-8 animate-spin" />
                <p className="text-lg">Verifying admin access and loading dashboard data...</p>
            </div>
        );
    }

    if (displayError) {
        return (
            <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8 px-4">
                <div className="text-center text-red-500">
                    <p>{displayError}</p>
                    <Button onClick={() => router.push('/login')} className="mt-4">
                        Go to Login
                    </Button>
                </div>
            </div>
        );
    }

    // If not admin (and not in loading/error state), it means they were redirected by useEffect, so return null
    if (!userProfile || userProfile.role !== 'admin') {
        return null;
    }

    return (
        <div className="container flex flex-col items-center justify-start min-h-screen py-8 px-4">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-4">Admin Dashboard</h1>
                <p className="text-xl text-muted-foreground">Welcome, {userProfile.firstName} {userProfile.lastName} ({userProfile.email})!</p>
            </div>

            {/* Admin Management Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg mb-12">
                <Link href="/admin/manage-experts" passHref>
                    <Button asChild className="w-full">
                        <a>Manage Expert/Mentor Approvals</a>
                    </Button>
                </Link>

                <Link href="/admin/manage-admins" passHref>
                    <Button asChild className="w-full">
                        <a>Manage Admins</a>
                    </Button>
                </Link>

                <Link href="/admin/manage-users" passHref>
                    <Button asChild className="w-full">
                        <a>Manage All Users (Students, Experts, Content)</a>
                    </Button>
                </Link>

                {/* Use the logout function from AuthContext */}
                <Button onClick={logout} className="w-full" variant="destructive">
                    Logout from Admin
                </Button>
            </div>

            {/* Section: Other Administrators */}
            <div className="w-full max-w-4xl mb-12">
                <h2 className="text-2xl font-bold mb-4">Other Administrators</h2>
                {otherAdmins.length === 0 ? (
                    <p className="text-muted-foreground">No other administrators found or you are the only one.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {otherAdmins.map((admin) => (
                            <Card key={admin.uid}>
                                <CardHeader>
                                    <CardTitle>{admin.firstName} {admin.lastName}</CardTitle>
                                    <CardDescription>{admin.email}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">UID: {admin.uid}</p>
                                    {admin.createdAt && (
                                        <p className="text-sm text-muted-foreground">Joined: {new Date(admin.createdAt).toLocaleDateString()}</p>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Section: Admin Activity Log */}
            <div className="w-full max-w-4xl mb-12">
                <h2 className="text-2xl font-bold mb-4">Admin Activity Log</h2>
                {adminActivities.length === 0 && !dashboardDataError ? (
                    <p className="text-muted-foreground">No recent admin activities to display.</p>
                ) : (
                    <div className="space-y-4">
                        {dashboardDataError && <p className="text-red-500 text-sm">{dashboardDataError}</p>}
                        {adminActivities.map((activity) => (
                            <Card key={activity.id}>
                                <CardContent className="p-4">
                                    <p className="text-sm font-medium">
                                        <span className="font-semibold">{activity.adminEmail}</span> ({activity.adminUid.substring(0, 8)}...)
                                        {activity.action === 'approved_expert' && ` approved expert ${activity.targetFirstName} ${activity.targetLastName} (${activity.targetEmail})`}
                                        {activity.action === 'rejected_expert' && ` rejected expert ${activity.targetFirstName} ${activity.targetLastName} (${activity.targetEmail})`}
                                        {activity.action === 'approved_mentor' && ` approved mentor ${activity.targetFirstName} ${activity.targetLastName} (${activity.targetEmail})`}
                                        {activity.action === 'rejected_mentor' && ` rejected mentor ${activity.targetFirstName} ${activity.targetLastName} (${activity.targetEmail})`}
                                        {activity.action === 'approved_admin' && ` approved new admin ${activity.targetFirstName} ${activity.targetLastName} (${activity.targetEmail})`}
                                        {activity.action === 'rejected_admin' && ` rejected admin request for ${activity.targetFirstName} ${activity.targetLastName} (${activity.targetEmail})`}
                                        {activity.action === 'assigned_admin_role' && ` assigned admin role to ${activity.targetFirstName} ${activity.targetLastName} (${activity.targetEmail})`}
                                        {activity.action === 'removed_admin_role' && ` removed admin role from ${activity.targetFirstName} ${activity.targetLastName} (${activity.targetEmail})`}
                                        {/* Add more activity types here as you implement them */}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {new Date(activity.timestamp).toLocaleString()}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
