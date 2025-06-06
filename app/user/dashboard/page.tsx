// app/user/dashboard/page.tsx
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

export default function UserDashboardPage() {
  const router = useRouter();
  const { user, userProfile, loading, error, logout } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (error) {
        router.push('/login');
      } else if (!user) {
        router.push('/login');
      } else if (userProfile && userProfile.role !== 'user') {
        // Redirect if not a regular user
        if (userProfile.role === 'admin') {
          router.push('/admin/dashboard');
        } else if (userProfile.role === 'expert') {
          router.push('/expert/dashboard');
        } else {
          router.push('/'); // Fallback
        }
      }
    }
  }, [user, userProfile, loading, error, router]);

  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8 px-4">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        <p className="text-lg">Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8 px-4">
        <div className="text-center text-red-500">
          <p>{error}</p>
          <Button onClick={() => router.push('/login')} className="mt-4">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  if (!userProfile || userProfile.role !== 'user') {
      return null;
  }

  return (
    <div className="container p-4 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">Student Dashboard</h1>
      <p className="text-xl text-muted-foreground text-center mb-8">
        Welcome, {userProfile.firstName} {userProfile.lastName}!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle>My Courses</CardTitle></CardHeader>
          <CardContent><p>View your enrolled courses.</p></CardContent>
          <CardFooter><Button onClick={() => router.push('/user/my-courses')}>Go to My Courses</Button></CardFooter>
        </Card>
        <Card>
          <CardHeader><CardTitle>Explore Experts</CardTitle></CardHeader>
          <CardContent><p>Find experts for Q&A or mentorship.</p></CardContent>
          <CardFooter><Button onClick={() => router.push('/experts')}>Browse Experts</Button></CardFooter>
        </Card>
        <Card>
          <CardHeader><CardTitle>Forums</CardTitle></CardHeader>
          <CardContent><p>Participate in discussions.</p></CardContent>
          <CardFooter><Button onClick={() => router.push('/forums')}>Go to Forums</Button></CardFooter>
        </Card>
        {/* Add more cards for other user functionalities */}
      </div>

      <div className="flex justify-center mt-8">
        <Button onClick={logout} variant="destructive">Logout</Button>
      </div>
    </div>
  );
}
