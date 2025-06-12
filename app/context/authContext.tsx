"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

import { onAuthStateChanged, User } from "firebase/auth";

import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "@/config/firebase";

import { useRouter, usePathname } from "next/navigation"; // <--- NEW: Import for redirection

// Define the shape of your user data that will be stored in context

export interface UserData {
  uid: string;
  email: string;
  role: "student" | "expert" | "admin" | "pending_admin";
  firstName?: string | null;
  lastName?: string | null;
  isExpertApproved?: boolean | null;
  expertise?: string | null;
  bio?: string | null; // Add other fields you store in Firestore, e.g., college, year_of_study
  college?: string | null;
  year_of_study?: string | null;
}

// Define the shape of the AuthContext

interface AuthContextType {
  userData: UserData | null;
  loading: boolean;
  isAuthenticated: boolean;
  refreshUserData: () => void;
  user: User | null;
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
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);

  const router = useRouter(); // <--- NEW: Initialize useRouter
  const pathname = usePathname(); // <--- NEW: Initialize usePathname // Function to fetch or refresh user profile from Firestore
  const fetchUserProfile = async (user: User | null) => {
    if (!user) {
      setUserData(null);
      setFirebaseUser(null);
      localStorage.removeItem("userInfo");
      setLoading(false);

      return;
    }

    try {
      const userDocRef = doc(db, "users", user.uid);

      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const profileData = userDocSnap.data() as UserData;

        setUserData({ ...profileData }); // Fix 3: Include firstName and lastName in localStorage

        localStorage.setItem(
          "userInfo",

          JSON.stringify({
            uid: user.uid,

            email: profileData.email,

            role: profileData.role,

            firstName: profileData.firstName, // <-- Include firstName

            lastName: profileData.lastName, // <-- Include lastName // Include other critical data if needed, e.g., isExpertApproved
            isExpertApproved: profileData.isExpertApproved,
          })
        );
      } else {
        console.warn(
          "User profile not found in Firestore for UID:",

          user.uid,

          "This might indicate a delay in Firestore write or missing data. Keeping user authenticated."
        ); // FIX 1: DO NOT signOut if Firestore profile is not immediately found. // Instead, set a default userData and allow them to remain authenticated.

        setUserData({
          uid: user.uid,

          email: user.email || "", // Use Firebase User's email as fallback

          role: "student", // Default to 'student' if profile is missing in Firestore

          firstName: user.displayName?.split(" ")[0] || null, // Try to get from Google displayName

          lastName: user.displayName?.split(" ").slice(1).join(" ") || null, // Try to get from Google displayName

          isExpertApproved: null, // Default value if not found

          expertise: null, // Default

          bio: null, // Default
        }); // Also update localStorage with default role/name

        localStorage.setItem(
          "userInfo",

          JSON.stringify({
            uid: user.uid,

            email: user.email || "",

            role: "student",

            firstName: user.displayName?.split(" ")[0] || null,

            lastName: user.displayName?.split(" ").slice(1).join(" ") || null,
          })
        ); // You might want to eventually redirect to a "complete your profile" page // if critical data is missing, instead of just defaulting.
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);

      setUserData(null);

      setFirebaseUser(null); // Clear Firebase user state on error

      localStorage.removeItem("userInfo"); // Do NOT sign out here automatically. The Firebase Auth session is still valid. // Show an error in the UI or ask user to refresh.
    } finally {
      setLoading(false);
    }
  }; // This effect runs once on mount to set up the authentication listener

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user); // Set loading to true immediately when auth state changes to fetch new profile

      setLoading(true);

      await fetchUserProfile(user);
    }); // Cleanup the subscription on unmount

    return () => unsubscribe();
  }, []); // Empty dependency array means this runs once on mount // FIX 2: NEW useEffect for role-based redirection

  useEffect(() => {
    // Redirect only if:

    // 1. Auth context is no longer loading.

    // 2. We have complete userData (meaning firebaseUser and profile data is loaded).

    // 3. We are currently on an authentication-related page (login, register) OR we are on a page that logged-in users shouldn't be on.

    if (!loading && userData) {
      const currentRole = userData.role;

      const isAuthenticatedPage =
        pathname === "/login" || pathname === "/register";

      let targetPath = "/"; // Default student dashboard

      if (currentRole === "admin" || currentRole === "pending_admin") {
        targetPath = "/admin/dashboard";
      } else if (currentRole === "expert") {
        targetPath = "/experts/dashboard";
      } // 'student' role (from your interface, which maps to 'user' in register.tsx) defaults to '/' // If user is on a login/register page AND they are now authenticated, redirect them

      if (isAuthenticatedPage) {
        console.log(
          `Redirecting authenticated ${currentRole} from ${pathname} to ${targetPath}`
        );

        router.push(targetPath);
      } // You might add additional logic here for unauthorized access to specific routes // e.g., if a student navigates to '/admin/dashboard', redirect them to '/' // Example: // else if (currentRole === 'student' && pathname.startsWith('/admin')) { //   router.push('/'); // }
    } else if (
      !loading &&
      !userData &&
      pathname !== "/login" &&
      pathname !== "/register"
    ) {
      // If not loading, no user data (means unauthenticated), and not on login/register page,
      // redirect to login. This handles protected routes.
      // Be cautious: this can lead to redirect loops if not managed well with public routes.
      // console.log("Not authenticated and not on login/register. Redirecting to /login");
      // router.push('/login'); // Uncomment if you want to force login for unauthenticated users
    }
  }, [loading, userData, router, pathname]); // Dependencies for this effect // This function can be called by components to manually refresh user data

  const refreshUserData = async () => {
    if (auth.currentUser) {
      setLoading(true);

      setFirebaseUser(auth.currentUser);

      await fetchUserProfile(auth.currentUser);
    } else {
      setLoading(false);

      setFirebaseUser(null);
    }
  };

  const isAuthenticated = !!userData; // isAuthenticated depends on fetched userData // The context value now includes the Firebase User object

  const contextValue = {
    userData,

    loading,

    isAuthenticated,

    refreshUserData,

    user: firebaseUser,
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
