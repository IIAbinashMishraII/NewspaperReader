import { doc, setDoc, getDoc, runTransaction } from "firebase/firestore";

/**
 * Track new user signup
 */
export const trackNewUser = async (firestore, uid, authUser, appIdentifier) => {
  const userRef = doc(firestore, "artifacts", appIdentifier, "public", "data", "users_meta", uid);
  try {
    const docSnap = await getDoc(userRef);
    if (!docSnap.exists()) {
      await setDoc(userRef, {
        firstSeen: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        email: authUser?.email || "private",
        name: authUser?.displayName || "N/A",
      });
    } else {
      await setDoc(userRef, { lastActive: new Date().toISOString() }, { merge: true });
    }
  } catch (e) {
    console.error("Error tracking user:", e);
  }
};

/**
 * Increment extraction counter for analytics
 */
export const incrementExtractionCounter = async (firestore, appIdentifier, userId) => {
  if (!firestore) return;
  const countRef = doc(
    firestore,
    "artifacts",
    appIdentifier,
    "public",
    "data",
    "analytics",
    "extraction_count"
  );

  try {
    await runTransaction(firestore, async (transaction) => {
      const countDoc = await transaction.get(countRef);
      const newCount = countDoc.exists() ? countDoc.data().total + 1 : 1;
      transaction.set(countRef, {
        total: newCount,
        lastRun: new Date().toISOString(),
        lastUserId: userId || "unknown",
      });
    });
  } catch (e) {
    console.error("Transaction failed (Could not increment counter):", e);
  }
};
