"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";

// Create the context
const AppContext = createContext(undefined);

// Provider component that wraps your app and makes the context available
export function AppProvider({ children }) {
  const { userId, isSignedIn, isLoaded } = useAuth();
  const { user: clerkUser } = useUser();
  const [user, setUser] = useState(null);
  const [userSubmissions, setUserSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ensure user exists in MongoDB when they sign in
  useEffect(() => {
    let isMounted = true;

    const ensureAndFetchUser = async () => {
      if (!isSignedIn || !userId || !clerkUser) {
        if (isMounted) {
          setUser(null);
          setUserSubmissions([]);
          setLoading(false);
        }
        return;
      }

      setLoading(true);

      try {
        // Ensure user exists in MongoDB (upsert)
        const ensureResponse = await fetch("/api/users/ensure", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clerkId: userId,
            email: clerkUser.primaryEmailAddress?.emailAddress || "",
            firstName: clerkUser.firstName || "",
            lastName: clerkUser.lastName || "",
            fullName: clerkUser.fullName || "",
            profileImageUrl: clerkUser.imageUrl || "",
          }),
        });

        if (isMounted && ensureResponse.ok) {
          const userData = await ensureResponse.json();
          setUser(userData);
        }

        // Fetch submissions
        const submissionsResponse = await fetch(
          `/api/submissions?userId=${userId}`
        );

        if (isMounted && submissionsResponse.ok) {
          const submissionsData = await submissionsResponse.json();
          setUserSubmissions(submissionsData);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    ensureAndFetchUser();

    return () => {
      isMounted = false;
    };
  }, [userId, isSignedIn, isLoaded, clerkUser]);

  // Context value
  const value = {
    user,
    isSignedIn,
    isLoaded,
    userId,
    userSubmissions,
    loading,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Custom hook to use the context
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
