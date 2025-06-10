// app/expert/dashboard/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/authContext'; // Your AuthContext hook

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, User, BookOpen, DollarSign, Calendar, Star, MessageSquareText } from 'lucide-react'; // Icons

export default function ExpertDashboardPage() {
  const { userData, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [loadingContent, setLoadingContent] = useState(true); // For actual dashboard content loading
  const [error, setError] = useState<string | null>(null);

  // --- Authorization and Initial Data Check ---
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        console.warn("Unauthenticated access attempt to expert dashboard. Redirecting to login.");
        router.push('/login');
        return;
      }

      // Check if user is an expert and is approved
      if (userData?.role !== 'expert') {
        console.warn("Non-expert user attempt to access expert dashboard. Redirecting to home.");
        setError("Access Denied: You do not have expert privileges.");
        router.push('/'); // Redirect to a general home page
        return;
      }

      if (userData?.isExpertApproved === false) {
        console.warn("Unapproved expert attempt to access expert dashboard. Redirecting to pending approval.");
        setError("Your expert application is still pending approval.");
        // You might want a dedicated 'pending-approval' page or just show a message
        router.push('/expert/pending-approval'); // Or show a specific message on this page
        return;
      }

      if (userData?.isExpertApproved === null) {
        // This state indicates they applied but no action yet (not explicitly false)
         console.warn("Expert application status unknown (null). Redirecting to pending approval.");
         router.push('/expert/pending-approval');
         return;
      }

      // If all checks pass, content can load
      setLoadingContent(false);
    }
  }, [userData, authLoading, isAuthenticated, router]);

  // --- Render Loading State (Auth or initial content) ---
  if (authLoading || loadingContent) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8 px-4">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        <p className="text-lg">Loading Expert Dashboard...</p>
      </div>
    );
  }

  // --- Render Access Denied/Error State (after auth loading) ---
  if (error) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8 px-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-red-500">{error}</p>
            <Button onClick={() => router.push('/')} className="w-full mt-4">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- Main Expert Dashboard Content ---
  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
        <User className="h-8 w-8 text-primary" /> Expert Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Welcome Card */}
        <Card className="md:col-span-2 lg:col-span-3 bg-gradient-to-r from-primary to-blue-500 text-primary-foreground">
          <CardHeader>
            <CardTitle className="text-4xl font-extrabold">
              Welcome, {userData?.firstName || 'Expert'}!
            </CardTitle>
            <CardDescription className="text-lg text-primary-foreground/90">
              Your hub for managing your expert services.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-medium">{userData?.email}</p>
          </CardContent>
        </Card>

        {/* Profile Overview Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <User className="h-5 w-5" /> My Profile
            </CardTitle>
            <CardDescription>View and manage your expert details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">
              <span className="font-semibold">Name:</span> {userData?.firstName} {userData?.lastName}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Expertise:</span> {userData?.expertise || 'Not set'}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Bio:</span> {userData?.bio || 'Not provided'}
            </p>
            <Button className="w-full mt-4" onClick={() => router.push('/expert/profile-settings')}>
              Edit Profile
            </Button>
          </CardContent>
        </Card>

        {/* Availability Management Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Calendar className="h-5 w-5" /> Manage Availability
            </CardTitle>
            <CardDescription>Set your consultation hours and breaks.</CardDescription>  
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Update your calendar to reflect when you are available for consultations.
            </p>
            <Button className="w-full" onClick={() => router.push('/expert/availability')}>
              Update Schedule
            </Button>
          </CardContent>
        </Card>

        {/* Earnings & Payouts Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <DollarSign className="h-5 w-5" /> Earnings & Payouts
            </CardTitle>
            <CardDescription>Track your earnings and payout history.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold mb-2">
              $0.00 <span className="text-sm text-muted-foreground">Total Earnings (Placeholder)</span>
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Detailed breakdown of your earnings and payout schedule.
            </p>
            <Button className="w-full" onClick={() => router.push('/expert/earnings')}>
              View Earnings
            </Button>
          </CardContent>
        </Card>

        {/* Consultations & Reviews Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <BookOpen className="h-5 w-5" /> Consultations & Reviews
            </CardTitle>
            <CardDescription>View past consultations and client feedback.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold mb-2">
              <Star className="inline-block h-6 w-6 text-yellow-400 mr-1" /> 0.0 <span className="text-sm text-muted-foreground">(0 reviews)</span>
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              See what clients are saying about your advice.
            </p>
            <Button className="w-full" onClick={() => router.push('/expert/reviews')}>
              View Reviews
            </Button>
          </CardContent>
        </Card>

        {/* Help & Support Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <MessageSquareText className="h-5 w-5" /> Help & Support
            </CardTitle>
            <CardDescription>Get assistance or report an issue.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Contact our support team for any questions or issues.
            </p>
            <Button className="w-full" onClick={() => router.push('/expert/support')}>
              Get Support
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}