import React from "react";
import { UserIcon, LoaderIcon } from "../icons/Icons";

export const LoginPage = ({ isLoading, error, onSignIn }) => (
  <div className="flex flex-col items-center justify-center h-full p-8 bg-gray-50">
    <UserIcon className="w-16 h-16 text-blue-600 mb-6" />
    <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome Back</h2>
    <p className="text-gray-600 mb-8 text-center max-w-sm">
      Sign in to securely use your own Gemini API key for article extraction.
    </p>

    <div className="space-y-4 w-full max-w-sm">
      <button
        onClick={() => onSignIn("google")}
        disabled={isLoading}
        className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 transition duration-200 flex items-center justify-center shadow-md disabled:bg-gray-400"
      >
        {isLoading ? <LoaderIcon className="w-5 h-5 mr-3" /> : "Sign In with Google"}
      </button>
      <button
        onClick={() => onSignIn("github")}
        disabled={isLoading}
        className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-gray-800 hover:bg-gray-900 transition duration-200 flex items-center justify-center shadow-md disabled:bg-gray-400"
      >
        {isLoading ? <LoaderIcon className="w-5 h-5 mr-3" /> : "Sign In with GitHub"}
      </button>

      {error && (
        <div className="mt-4 text-red-600 text-sm p-3 bg-red-100 rounded-lg border border-red-300">
          {error}
        </div>
      )}

      <p className="text-center text-xs text-gray-400 pt-4">
        *Note: You must enable these providers in your Firebase project settings.
      </p>
    </div>
  </div>
);
