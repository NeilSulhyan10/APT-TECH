// app/expert/dashboard/page.tsx
"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UserProfile {
    uid: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
}

export default function ExpertDashboardPage() {
    const router = useRouter();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkAuthAndRole = async () => {
            setLoading(true);
            setError(null);
            const firebaseUser = auth.currentUser;

            if (!firebaseUser) {
                setError("No authenticated user found. Redirecting to login...");
                router.push('/login');
                return;
            }

            try {
                const userDocRef = doc(db, 'users', firebaseUser.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    const profile = userDocSnap.data() as UserProfile;
                    setUserProfile(profile);

                    if (profile.role === 'expert' || profile.role === 'admin') { // Allow admin to see expert dashboard too, if desired
                        console.log("Expert/Admin access granted.");
                    } else {
                        setError("Access Denied: You do not have expert privileges. Redirecting to Home...");
                        router.push('/');
                    }
                } else {
                    setError("User profile not found in database. Redirecting to login...");
                    signOut(auth);
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('userInfo');
                    router.push('/login');
                }
            } catch (err: any) {
                console.error("Error checking user role:", err);
                setError(`Failed to verify role: ${err.message}. Redirecting to login...`);
                signOut(auth);
                localStorage.removeItem('authToken');
                localStorage.removeItem('userInfo');
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };
        checkAuthAndRole();
    }, [router]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            localStorage.removeItem('authToken');
            localStorage.removeItem('userInfo');
            router.push('/login');
        } catch (error) {
            console.error("Error logging out:", error);
            setError("Failed to log out. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8 px-4">
                <Loader2 className="mr-2 h-8 w-8 animate-spin" />
                <p className="text-lg">Verifying expert access...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8 px-4">
                <div className="text-center text-red-500">
                    <p>{error}</p>
                    {error.includes("Redirecting to Home") && (
                        <Button onClick={() => router.push('/')} className="mt-4">
                            Go to Home
                        </Button>
                    )}
                    {error.includes("Redirecting to login") && (
                        <Button onClick={() => router.push('/login')} className="mt-4">
                            Go to Login
                        </Button>
                    )}
                </div>
            </div>
        );
    }

    if (!userProfile || (userProfile.role !== 'expert' && userProfile.role !== 'admin')) {
        return null;
    }

    return (
        <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8 px-4">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">Expert Dashboard</h1>
                <p className="text-xl text-muted-foreground mb-8">Welcome, {userProfile.firstName} {userProfile.lastName} ({userProfile.email})!</p>
                <p className="mb-4">This is your expert area. Here you can manage your sessions and content.</p>
                <Button onClick={handleLogout} className="mt-8" variant="destructive">
                    Logout from Expert Dashboard
                </Button>
            </div>
        </div>
    );
}