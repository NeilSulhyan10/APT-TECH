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
    role: string; // 'user', 'expert', 'admin'
    status?: 'pending' | 'approved' | 'rejected';
    createdAt?: string;
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
                // User is signed in
                setUser(firebaseUser);
                try {
                    // Fetch user's profile from Firestore
                    const userDocRef = doc(db, 'users', firebaseUser.uid);
                    const userDocSnap = await getDoc(userDocRef);

                    if (userDocSnap.exists()) {
                        const profileData = userDocSnap.data() as UserProfile;
                        setUserProfile(profileData);
                        // Also update localStorage for quick access/initial navbar rendering
                        localStorage.setItem('userInfo', JSON.stringify(profileData));
                    } else {
                        // User exists in Auth but not in Firestore (should ideally not happen post-registration)
                        console.warn("User profile not found in Firestore for UID:", firebaseUser.uid);
                        setError("User profile data incomplete. Please contact support.");
                        setUserProfile(null);
                        // Optionally force logout or redirect to profile completion
                        // signOut(auth);
                    }
                } catch (err: any) {
                    console.error("Error fetching user profile:", err);
                    setError(`Failed to load profile: ${err.message}`);
                    setUserProfile(null);
                }
            } else {
                // User is signed out
                setUser(null);
                setUserProfile(null);
                localStorage.removeItem('userInfo'); // Clear local storage on sign out
                localStorage.removeItem('authToken');
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
            // onAuthStateChanged listener will handle clearing state and localStorage
            router.push('/login'); // Redirect to login page
        } catch (err: any) {
            console.error("Error during logout:", err);
            setError(`Logout failed: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

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
