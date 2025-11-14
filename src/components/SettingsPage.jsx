import React, { useState, useEffect } from "react";
import { SaveIcon } from "../icons/Icons";
import { getTodayStats, getAllTimeStats, formatTime } from "../services/readingStatsService";

export const SettingsPage = ({ userApiKey, error, onSave, onBack, db, user, appIdentifier }) => {
  const [keyInput, setKeyInput] = useState(userApiKey || "");
  const [isSaving, setIsSaving] = useState(false);
  const [localError, setLocalError] = useState("");
  const [activeTab, setActiveTab] = useState("api"); // 'api' or 'stats'
  const [todayStats, setTodayStats] = useState(null);
  const [allTimeStats, setAllTimeStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Fetch stats when component mounts or when user changes
  useEffect(() => {
    if (activeTab === "stats" && user && db) {
      fetchStats();
    }
  }, [activeTab, user, db]);

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const today = await getTodayStats(db, user.uid, appIdentifier);
      const allTime = await getAllTimeStats(db, user.uid, appIdentifier);
      setTodayStats(today);
      setAllTimeStats(allTime);
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleSave = async () => {
    setLocalError("");
    if (!keyInput.startsWith("AIzaSy") || keyInput.length < 30) {
      setLocalError('Please enter a valid Gemini API Key (starts with "AIzaSy...").');
      return;
    }
    setIsSaving(true);
    await onSave(keyInput);
    setIsSaving(false);
  };

  return (
    <div className="w-full h-[calc(100vh-64px)] overflow-y-auto bg-white dark:bg-gray-900 transition-colors duration-200">
      <div className="p-8 max-w-3xl mx-auto pb-20">
        {/* Tabs */}
        <div className="flex space-x-4 border-b border-gray-300 dark:border-gray-700 mb-6">
          <button
            onClick={() => setActiveTab("api")}
            className={`py-2 px-4 bg-white dark:bg-black border-black dark:border-white font-semibold border-b-2 transition ${
              activeTab === "api"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
            }`}
          >
            API Key
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`py-2 px-4 bg-white dark:bg-black border-black dark:border-white font-semibold border-b-2 transition ${
              activeTab === "stats"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
            }`}
          >
            📊 Reading Stats
          </button>
        </div>

        {/* API Key Tab */}
        {activeTab === "api" && (
          <>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
              {userApiKey ? "Manage API Key" : "Setup Required: Enter API Key"}
            </h2>

            <div className="bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-500 p-4 mb-6 rounded-lg text-blue-800 dark:text-blue-200">
              <p className="font-semibold">Your security is important:</p>
              <p className="text-sm">
                We need your personal **Gemini API Key** to perform article extraction. This key is
                stored securely in your private Firestore account and is never visible to others.
              </p>
            </div>

            <div className="space-y-4">
              <label className="block text-gray-700 dark:text-gray-300 font-medium">
                Gemini API Key:
              </label>
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition"
              />

              {userApiKey && (
                <p className="text-sm text-green-600 dark:text-green-400 font-semibold">
                  ✓ Current Key Status: Key is set and active.
                </p>
              )}

              {(localError || error) && (
                <div className="text-red-600 dark:text-red-400 text-sm p-3 bg-red-100 dark:bg-red-900 rounded-lg border border-red-300 dark:border-red-700">
                  {localError || error}
                </div>
              )}

              <div className="flex justify-between pt-4">
                <button
                  onClick={handleSave}
                  disabled={isSaving || keyInput === userApiKey}
                  className="flex items-center px-6 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white font-semibold rounded-lg transition shadow-md disabled:bg-gray-400 dark:disabled:bg-gray-600"
                >
                  <SaveIcon className="w-5 h-5 mr-2" />
                  {isSaving ? "Saving..." : "Save Key"}
                </button>

                {userApiKey && (
                  <button
                    onClick={onBack}
                    className="px-6 py-2 bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-800 text-white font-semibold rounded-lg transition shadow-md"
                  >
                    Back to Reader
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {/* Reading Stats Tab */}
        {activeTab === "stats" && (
          <>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
              📊 Reading Statistics
            </h2>

            {statsLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin">⌛</div>
                <p className="text-gray-600 dark:text-gray-400 mt-4">Loading statistics...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Today's Stats */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-lg p-6 border border-blue-200 dark:border-blue-700">
                  <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-4">
                    Today
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                      <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                        Articles Extracted
                      </p>
                      <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                        {todayStats?.articlesExtracted || 0}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                      <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                        Extractions
                      </p>
                      <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                        {todayStats?.extractionCount || 0}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow col-span-2">
                      <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                        Time Spent
                      </p>
                      <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                        {formatTime(todayStats?.timeSpentSeconds || 0)}
                      </p>
                    </div>
                  </div>
                  {todayStats && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                      Last updated: {new Date(todayStats.lastUpdated).toLocaleTimeString()}
                    </p>
                  )}
                </div>

                {/* All-Time Stats */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 rounded-lg p-6 border border-green-200 dark:border-green-700">
                  <h3 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-4">
                    All-Time
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                      <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                        Total Articles
                      </p>
                      <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                        {allTimeStats?.totalArticlesExtracted || 0}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                      <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                        Total Extractions
                      </p>
                      <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                        {allTimeStats?.totalExtractions || 0}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow col-span-2">
                      <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                        Total Time Spent
                      </p>
                      <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                        {formatTime(allTimeStats?.totalTimeSpentSeconds || 0)}
                      </p>
                    </div>
                  </div>
                  {allTimeStats && (
                    <div className="mt-4 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <p>First used: {new Date(allTimeStats.firstUsed).toLocaleDateString()}</p>
                      <p>Last updated: {new Date(allTimeStats.lastUpdated).toLocaleTimeString()}</p>
                    </div>
                  )}
                </div>

                {/* No Stats Message */}
                {!todayStats && !allTimeStats && (
                  <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-gray-600 dark:text-gray-400">No reading statistics yet.</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                      Extract articles to start tracking your reading!
                    </p>
                  </div>
                )}

                <button
                  onClick={onBack}
                  className="w-full px-6 py-2 bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-800 text-white font-semibold rounded-lg transition shadow-md"
                >
                  Back to Reader
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
