import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  GithubAuthProvider,
} from "firebase/auth";
import { auth } from "../config/firebase";
import { trackNewUser } from "../services/trackingService";

/**
 * Custom hook to handle authentication
 */
export const useAuth = (db, appIdentifier) => {
  const [user, setUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Initialize auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setUser(authUser);
        if (db) {
          await trackNewUser(db, authUser.uid, authUser, appIdentifier);
        }
      } else {
        setUser(null);
      }
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, [db, appIdentifier]);

  const handleSignIn = async (providerName) => {
    setError("");
    setIsLoading(true);

    const provider =
      providerName === "google" ? new GoogleAuthProvider() : new GithubAuthProvider();

    try {
      await signInWithPopup(auth, provider);
    } catch (e) {
      console.error(`Sign in with ${providerName} failed:`, e);
      setError(`Sign-in failed. Error: ${e.message.split("(")[0] || e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setError("");
    } catch (e) {
      console.error("Sign out failed:", e);
      setError("Sign out failed");
    }
  };

  return {
    user,
    isAuthReady,
    isLoading,
    error,
    handleSignIn,
    handleSignOut,
    setError,
  };
};
