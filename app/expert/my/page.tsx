// app/expert/my-sessions/page.tsx
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function ExpertMySessionsPage() {
  const router = useRouter();
  const { user, userProfile, loading, error } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (error) {
        router.push('/login');
      } else if (!user) {
        router.push('/login');
      } else if (userProfile && userProfile.role !== 'expert') {
        // Redirect if not an expert
        router.push('/'); // Or appropriate dashboard
      }
    }
  }, [user, userProfile, loading, error, router]);

  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8 px-4">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        <p className="text-lg">Loading your sessions...</p>
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

  if (!userProfile || userProfile.role !== 'expert') {
      return null;
  }

  return (
    <div className="container p-4 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">My Q&A Sessions</h1>
      <p className="text-muted-foreground text-center mb-8">
        (This page will display your scheduled and past Q&A sessions.)
      </p>

      <div className="text-center">
        <p>No sessions found yet. Start by creating a new session!</p>
        <Button className="mt-4">Create New Session</Button>
      </div>

      <div className="flex justify-center mt-8">
        <Button onClick={() => router.push('/expert/dashboard')} variant="outline">Back to Dashboard</Button>
      </div>
    </div>
  );
}
