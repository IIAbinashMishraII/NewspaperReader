import React from "react";
import { LoaderIcon } from "../icons/Icons";

export const SummaryModal = ({ isOpen, isSummarizing, summaryText, articleTitle, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100">
        <div className="p-6">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
            Summary: {articleTitle || "Article"}
          </h3>

          {isSummarizing ? (
            <div className="flex flex-col items-center justify-center h-48 text-blue-500">
              <LoaderIcon className="w-8 h-8 mb-3" />
              <p className="text-lg font-medium">Generating summary...</p>
            </div>
          ) : (
            <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
              {summaryText || "Summary could not be generated."}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end bg-gray-50 dark:bg-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white font-semibold rounded-lg transition duration-150 shadow-md disabled:opacity-50"
            disabled={isSummarizing}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
