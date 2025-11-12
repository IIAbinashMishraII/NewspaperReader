import { useCallback } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";

/**
 * Custom hook for Firestore operations
 */
export const useFirestore = (db, appIdentifier) => {
  const userSettingsRef = useCallback(
    (uid) => {
      return doc(db, "artifacts", appIdentifier, "users", uid, "settings", "config");
    },
    [db, appIdentifier]
  );

  const fetchUserApiKey = useCallback(
    async (uid) => {
      if (!db) return null;
      try {
        const docSnap = await getDoc(userSettingsRef(uid));
        if (docSnap.exists()) {
          return docSnap.data().geminiApiKey;
        }
        return null;
      } catch (e) {
        console.error("Error fetching API key:", e);
        throw new Error("Failed to retrieve API Key. Please re-enter it.");
      }
    },
    [userSettingsRef, db]
  );

  const saveUserApiKey = useCallback(
    async (uid, key) => {
      if (!db) return;
      try {
        await setDoc(userSettingsRef(uid), { geminiApiKey: key }, { merge: true });
        return key;
      } catch (e) {
        console.error("Error saving API Key:", e);
        throw new Error("Failed to save API Key. Please check permissions.");
      }
    },
    [userSettingsRef, db]
  );

  return {
    fetchUserApiKey,
    saveUserApiKey,
    userSettingsRef,
  };
};
