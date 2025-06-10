// app/context/AuthContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { onAuthStateChanged, User } from "firebase/auth"; // <--- Import 'User' type from firebase/auth
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/config/firebase";

// Define the shape of your user data that will be stored in context
export interface UserData {
  uid: string;
  email: string;
  role: "student" | "expert" | "admin" | "pending_admin";
  firstName?: string | null;
  lastName?: string | null;
  isExpertApproved?: boolean | null;
  expertise?: string | null;
  bio?: string | null;
}

// Define the shape of the AuthContext
interface AuthContextType {
  userData: UserData | null;
  loading: boolean;
  isAuthenticated: boolean;
  refreshUserData: () => void;
  user: User | null; // <--- ADD THIS LINE: Expose the Firebase User object
}

// Create the context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the props for AuthProvider
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null); // <--- NEW STATE to hold the Firebase User object

  // Function to fetch or refresh user profile from Firestore
  // Ensure the firebaseUser parameter is typed correctly as 'User | null'
  const fetchUserProfile = async (user: User | null) => {
    if (!user) { // Use 'user' parameter here
      setUserData(null);
      setFirebaseUser(null); // Clear Firebase user state
      localStorage.removeItem("userInfo");
      setLoading(false);
      return;
    }

    try {
      const userDocRef = doc(db, "users", user.uid); // Use 'user.uid'
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const profileData = userDocSnap.data() as UserData;
        setUserData({ ...profileData });

        localStorage.setItem(
          "userInfo",
          JSON.stringify({
            uid: user.uid,
            email: profileData.email,
            role: profileData.role,
          })
        );
      } else {
        console.warn(
          "User profile not found in Firestore for UID:",
          user.uid
        );
        await auth.signOut();
        setUserData(null);
        setFirebaseUser(null); // Clear Firebase user state on sign out
        localStorage.removeItem("userInfo");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setUserData(null);
      setFirebaseUser(null); // Clear Firebase user state on error
      localStorage.removeItem("userInfo");
    } finally {
      setLoading(false);
    }
  };

  // This effect runs once on mount to set up the authentication listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user); // <--- SET THE FIREBASE USER OBJECT HERE
      if (user) {
        // Firebase user exists, now fetch their custom profile data (role, etc.)
        await fetchUserProfile(user);
      } else {
        // No Firebase user, clear state
        setUserData(null);
        localStorage.removeItem("userInfo");
        setLoading(false);
      }
    });

    // Cleanup the subscription on unmount
    return () => unsubscribe();
  }, []);

  // This function can be called by components to manually refresh user data
  const refreshUserData = async () => {
    if (auth.currentUser) {
      setLoading(true);
      setFirebaseUser(auth.currentUser); // Ensure the firebaseUser state is updated if refreshed externally
      await fetchUserProfile(auth.currentUser);
    } else {
      setLoading(false);
      setFirebaseUser(null); // Clear if no current user
    }
  };

  const isAuthenticated = !!userData;

  // The context value now includes the Firebase User object
  const contextValue = {
    userData,
    loading,
    isAuthenticated,
    refreshUserData,
    user: firebaseUser, // <--- EXPOSE the firebaseUser state as 'user' in the context
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Custom hook to consume the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};