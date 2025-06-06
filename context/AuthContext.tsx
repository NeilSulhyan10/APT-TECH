"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firebase'; // Your Firebase client-side auth and db instances
import { useRouter } from 'next/navigation';

// Define the shape of your UserProfile stored in Firestore
interface UserProfile {
    uid: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'user' | 'expert' | 'admin'; // Explicitly define roles
    status: 'pending' | 'approved' | 'rejected'; // New status field for experts/admins
    college?: string;
    year_of_study?: string;
    createdAt: string; // ISO string
    // Add any other profile fields you store
}

// Define the shape of the context value
interface AuthContextType {
    user: FirebaseUser | null; // Firebase Auth user object
    userProfile: UserProfile | null; // User's full profile from Firestore
    loading: boolean; // True while checking auth state or fetching profile
    error: string | null; // Any authentication or data fetching error
    logout: () => Promise<void>; // Function to log out
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true); // Initial loading state
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        // This listener will be the primary source of truth for auth state
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setLoading(true); // Start loading when auth state changes
            setError(null); // Clear previous errors

            if (firebaseUser) {
                // User is signed in via Firebase Auth
                setUser(firebaseUser);
                try {
                    // Fetch user's profile from Firestore
                    const userDocRef = doc(db, 'users', firebaseUser.uid);
                    const userDocSnap = await getDoc(userDocRef);

                    if (userDocSnap.exists()) {
                        const profileData = userDocSnap.data() as UserProfile;
                        setUserProfile(profileData);
                        // Also update localStorage for quick access/initial navbar rendering
                        // Ensure it's the full profile, including role and status
                        localStorage.setItem('userInfo', JSON.stringify(profileData));
                    } else {
                        // Scenario: User exists in Firebase Auth but no profile in Firestore.
                        // This indicates a potential issue during signup or a malformed user.
                        console.warn("User profile not found in Firestore for UID:", firebaseUser.uid);
                        setError("User profile data incomplete. Please contact support or try re-registering.");
                        setUserProfile(null);
                        // Optionally, you might want to automatically sign them out or redirect
                        // to a profile completion page in a production app.
                        // For now, they'll be treated as unauthenticated for feature access.
                        await signOut(auth); // Force sign out if profile is missing
                    }
                } catch (err: any) {
                    console.error("Error fetching user profile:", err);
                    setError(`Failed to load profile: ${err.message}`);
                    setUserProfile(null);
                }
            } else {
                // User is signed out (or initial state)
                setUser(null);
                setUserProfile(null);
                localStorage.removeItem('userInfo'); // Clear local storage on sign out
                localStorage.removeItem('authToken'); // Clear auth token from local storage
            }
            setLoading(false); // End loading once auth state and profile are processed
        });

        // Cleanup listener on component unmount
        return () => unsubscribe();
    }, []); // Empty dependency array ensures this runs once on mount

    const handleLogout = async () => {
        setLoading(true);
        setError(null);
        try {
            await signOut(auth);
            // The onAuthStateChanged listener above will handle clearing state and localStorage
            router.push('/login'); // Redirect to login page
        } catch (err: any) {
            console.error("Error during logout:", err);
            setError(`Logout failed: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // The value provided by the context to consuming components
    const value = {
        user,
        userProfile,
        loading,
        error,
        logout: handleLogout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook to use the AuthContext
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
