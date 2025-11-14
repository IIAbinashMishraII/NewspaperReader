import React from "react";
import { FileTextIcon, SettingsIcon, LogOutIcon } from "../icons/Icons";

export const Header = ({ user, isDarkMode, onToggleDarkMode, onSettingsClick, onSignOut }) => (
  <header className="flex items-center justify-between p-4 bg-gray-900 dark:bg-gray-950 text-white shadow-lg flex-shrink-0 transition-colors duration-200">
    <h1 className="text-xl font-extrabold flex items-center">
      <FileTextIcon className="w-5 h-5 mr-2 text-red-400" />
      AI Newspaper Reader
    </h1>

    {user && (
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-300 hidden sm:inline">
          Welcome, {user.displayName || user.email || "User"}!
        </span>

        {/* Dark Mode Toggle */}
        <button
          onClick={onToggleDarkMode}
          className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 transition duration-150 shadow-md flex items-center"
          title="Toggle Dark Mode"
        >
          {isDarkMode ? "☀️" : "🌙"}
        </button>

        <button
          onClick={onSettingsClick}
          className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 transition duration-150 shadow-md flex items-center"
          title="Settings"
        >
          <SettingsIcon className="w-5 h-5" />
        </button>
        <button
          onClick={onSignOut}
          className="p-2 rounded-full bg-red-600 hover:bg-red-700 transition duration-150 shadow-md flex items-center"
          title="Sign Out"
        >
          <LogOutIcon className="w-5 h-5" />
        </button>
      </div>
    )}
  </header>
);
