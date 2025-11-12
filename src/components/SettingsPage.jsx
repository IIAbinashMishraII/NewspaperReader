import React, { useState } from "react";
import { SaveIcon } from "../icons/Icons";

export const SettingsPage = ({ userApiKey, error, onSave, onBack }) => {
  const [keyInput, setKeyInput] = useState(userApiKey || "");
  const [isSaving, setIsSaving] = useState(false);
  const [localError, setLocalError] = useState("");

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
    <div className="p-8 max-w-3xl mx-auto h-full overflow-y-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">
        {userApiKey ? "Manage API Key" : "Setup Required: Enter API Key"}
      </h2>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-lg text-blue-800">
        <p className="font-semibold">Your security is important:</p>
        <p className="text-sm">
          We need your personal **Gemini API Key** to perform article extraction. This key is stored
          securely in your private Firestore account and is never visible to others.
        </p>
      </div>

      <div className="space-y-4">
        <label className="block text-gray-700 font-medium">Gemini API Key:</label>
        <input
          type="password"
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
          placeholder="AIzaSy..."
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />

        {userApiKey && (
          <p className="text-sm text-green-600 font-semibold">
            Current Key Status: {userApiKey.length > 0 ? "Key is set and active." : "No key set."}
          </p>
        )}

        {(localError || error) && (
          <div className="text-red-600 text-sm p-3 bg-red-100 rounded-lg border border-red-300">
            {localError || error}
          </div>
        )}

        <div className="flex justify-between pt-4">
          <button
            onClick={handleSave}
            disabled={isSaving || keyInput === userApiKey}
            className="flex items-center px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition duration-150 shadow-md disabled:bg-gray-400"
          >
            <SaveIcon className="w-5 h-5 mr-2" />
            {isSaving ? "Saving..." : "Save Key"}
          </button>

          {userApiKey && (
            <button
              onClick={onBack}
              className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition duration-150 shadow-md"
            >
              Back to Reader
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
