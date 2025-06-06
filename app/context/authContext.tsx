// app/context/AuthContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firebase'; // Assuming your firebase config is here

// Define the shape of your user data that will be stored in context
export interface UserData { // Exporting the interface for use in other files if needed
  uid: string;
  email: string;
  // Updated roles to include 'pending_admin' and potentially 'guest' or 'rejected_admin' if tracked
  role: 'student' | 'expert' | 'admin' | 'pending_admin';
  firstName?: string | null; // Made nullable to match potential Firebase data
  lastName?: string | null;  // Made nullable
  isExpertApproved?: boolean | null; // For expert role, can be true, false, or null (for pending)
  expertise?: string | null; // Added for experts
  bio?: string | null;       // Added for experts
  // Add any other profile fields you want globally accessible, matching your Firestore schema
}

// Define the shape of the AuthContext
interface AuthContextType {
  userData: UserData | null;
  loading: boolean;
  isAuthenticated: boolean; // Convenience flag
  // Add a way to refresh user data if needed (e.g., after profile update)
  refreshUserData: () => void;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the props for AuthProvider
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true); // Start true, as we're checking auth state

  // Function to fetch or refresh user profile from Firestore
  const fetchUserProfile = async (firebaseUser: any) => {
    if (!firebaseUser) {
      setUserData(null);
      localStorage.removeItem('userInfo');
      setLoading(false);
      return;
    }

    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        // Cast the data to UserData. TypeScript will now properly check for consistency
        const profileData = userDocSnap.data() as UserData;
        setUserData({ ...profileData }); // Ensure all properties are copied
        
        // Update localStorage with basic, non-sensitive info for quick checks on refresh
        localStorage.setItem('userInfo', JSON.stringify({ 
          uid: firebaseUser.uid, 
          email: profileData.email, 
          role: profileData.role 
        }));
      } else {
        // If user document doesn't exist, it might be a new sign-up or an error
        console.warn("User profile not found in Firestore for UID:", firebaseUser.uid);
        // Handle this case: Maybe redirect to a profile creation page, or force logout
        // For now, logging out is a safe fallback.
        await auth.signOut();
        setUserData(null);
        localStorage.removeItem('userInfo');
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setUserData(null); // Clear user data on error
      localStorage.removeItem('userInfo');
    } finally {
      setLoading(false);
    }
  };

  // This effect runs once on mount to set up the authentication listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Firebase user exists, now fetch their custom profile data (role, etc.)
        await fetchUserProfile(user);
      } else {
        // No Firebase user, clear state
        setUserData(null);
        localStorage.removeItem('userInfo');
        setLoading(false);
      }
    });

    // Cleanup the subscription on unmount
    return () => unsubscribe();
  }, []); // Empty dependency array means it runs only once on mount

  // This function can be called by components to manually refresh user data
  const refreshUserData = async () => {
    if (auth.currentUser) {
      setLoading(true); // Indicate loading while refreshing
      await fetchUserProfile(auth.currentUser);
    } else {
      // If no current user, just set loading to false as there's nothing to fetch
      setLoading(false);
    }
  };

  const isAuthenticated = !!userData; // True if userData is not null

  const contextValue = { userData, loading, isAuthenticated, refreshUserData };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to consume the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};