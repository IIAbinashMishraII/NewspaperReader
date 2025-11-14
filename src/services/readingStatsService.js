import { doc, setDoc, getDoc } from "firebase/firestore";

/**
 * Get today's reading stats
 */
export const getTodayStats = async (firestore, uid, appIdentifier) => {
  if (!firestore || !uid) return null;

  try {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const statsRef = doc(
      firestore,
      "artifacts",
      appIdentifier,
      "users",
      uid,
      "stats",
      `daily_${today}`
    );

    const docSnap = await getDoc(statsRef);
    return docSnap.exists() ? docSnap.data() : null;
  } catch (e) {
    console.error("Error fetching today's stats:", e);
    return null;
  }
};

/**
 * Get all-time stats
 */
export const getAllTimeStats = async (firestore, uid, appIdentifier) => {
  if (!firestore || !uid) return null;

  try {
    const statsRef = doc(firestore, "artifacts", appIdentifier, "users", uid, "stats", "all_time");

    const docSnap = await getDoc(statsRef);
    return docSnap.exists() ? docSnap.data() : null;
  } catch (e) {
    console.error("Error fetching all-time stats:", e);
    return null;
  }
};

/**
 * Increment article extraction count
 */
export const incrementArticleCount = async (firestore, uid, appIdentifier, articleCount) => {
  if (!firestore || !uid) return;

  try {
    const today = new Date().toISOString().split("T")[0];

    // Update today's stats
    const todayStatsRef = doc(
      firestore,
      "artifacts",
      appIdentifier,
      "users",
      uid,
      "stats",
      `daily_${today}`
    );

    const todaySnap = await getDoc(todayStatsRef);
    const todayCount = todaySnap.exists() ? todaySnap.data().articlesExtracted : 0;

    await setDoc(
      todayStatsRef,
      {
        articlesExtracted: todayCount + articleCount,
        extractionCount: (todaySnap.exists() ? todaySnap.data().extractionCount : 0) + 1,
        lastUpdated: new Date().toISOString(),
        date: today,
      },
      { merge: true }
    );

    // Update all-time stats
    const allTimeRef = doc(
      firestore,
      "artifacts",
      appIdentifier,
      "users",
      uid,
      "stats",
      "all_time"
    );

    const allTimeSnap = await getDoc(allTimeRef);
    const totalArticles = allTimeSnap.exists() ? allTimeSnap.data().totalArticlesExtracted : 0;
    const totalExtractions = allTimeSnap.exists() ? allTimeSnap.data().totalExtractions : 0;

    await setDoc(
      allTimeRef,
      {
        totalArticlesExtracted: totalArticles + articleCount,
        totalExtractions: totalExtractions + 1,
        lastUpdated: new Date().toISOString(),
        firstUsed: allTimeSnap.exists() ? allTimeSnap.data().firstUsed : new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (e) {
    console.error("Error updating stats:", e);
  }
};

/**
 * Update time spent on app
 */
export const updateTimeSpent = async (firestore, uid, appIdentifier, seconds) => {
  if (!firestore || !uid) return;

  try {
    const today = new Date().toISOString().split("T")[0];

    // Update today's time spent
    const todayStatsRef = doc(
      firestore,
      "artifacts",
      appIdentifier,
      "users",
      uid,
      "stats",
      `daily_${today}`
    );

    const todaySnap = await getDoc(todayStatsRef);
    const todayTimeSpent = todaySnap.exists() ? todaySnap.data().timeSpentSeconds : 0;

    await setDoc(
      todayStatsRef,
      {
        timeSpentSeconds: todayTimeSpent + seconds,
        lastUpdated: new Date().toISOString(),
        date: today,
      },
      { merge: true }
    );

    // Update all-time time spent
    const allTimeRef = doc(
      firestore,
      "artifacts",
      appIdentifier,
      "users",
      uid,
      "stats",
      "all_time"
    );

    const allTimeSnap = await getDoc(allTimeRef);
    const totalTimeSpent = allTimeSnap.exists() ? allTimeSnap.data().totalTimeSpentSeconds : 0;

    await setDoc(
      allTimeRef,
      {
        totalTimeSpentSeconds: totalTimeSpent + seconds,
        lastUpdated: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (e) {
    console.error("Error updating time spent:", e);
  }
};

/**
 * Format seconds to readable time (HH:MM:SS)
 */
export const formatTime = (totalSeconds) => {
  if (!totalSeconds || totalSeconds <= 0) return "0m";

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};
