import React from "react";
import {
  UploadIcon,
  FileTextIcon,
  ChevronLeft,
  ChevronRight,
  LoaderIcon,
  ArrowLeft,
  ArrowRight,
} from "../icons/Icons";
import { MOBILE_TABS } from "../constants/schemas";

export const MainApp = ({
  file,
  renderedPages,
  currentPageIndex,
  articles,
  currentArticleIndex,
  currentArticle,
  isLoading,
  isBackgroundProcessing,
  isSummarizing,
  error,
  sidebarWidth,
  mobileActiveTab,
  onFileChange,
  onPageNavigate,
  onArticleNavigate,
  onProcessImage,
  onSummarize,
  onResizeStart,
  onTabChange,
}) => {
  const currentPageDisplayUrl =
    renderedPages.length > 0 && renderedPages[currentPageIndex]
      ? `data:${renderedPages[currentPageIndex].mimeType};base64,${renderedPages[currentPageIndex].base64}`
      : null;

  return (
    <div
      id="app-container"
      className="w-full h-[calc(100vh-64px)] flex flex-col md:flex-row border-t border-gray-200 overflow-hidden"
    >
      {/* LEFT PANEL - Document Viewer */}
      <div
        className={`${
          mobileActiveTab === MOBILE_TABS.DOCUMENT ? "flex" : "hidden"
        } md:flex flex-col bg-gray-50 border-b md:border-b-0 md:border-r border-gray-200 overflow-hidden`}
        style={{
          flexShrink: 0,
          width: window.innerWidth < 768 ? "100%" : `${sidebarWidth}%`,
        }}
      >
        {/* Header */}
        <div className="p-4 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-700 mb-2 flex items-center">
            <FileTextIcon className="w-5 h-5 mr-2 text-red-500" />
            Original Document View
            {renderedPages.length > 0 && (
              <span className="text-sm font-semibold ml-3 px-3 py-1 rounded-full bg-red-100 text-red-700">
                Page {currentPageIndex + 1} of {renderedPages.length}
              </span>
            )}
          </h2>
        </div>

        {/* Scrollable Image Area */}
        <div className="flex-grow overflow-y-auto p-4 bg-white shadow-inner">
          {currentPageDisplayUrl ? (
            <img
              src={currentPageDisplayUrl}
              alt="Newspaper Preview"
              className="w-full h-auto rounded-sm shadow-md"
            />
          ) : (
            <p className="text-gray-500 text-center p-8">
              Upload a newspaper image or PDF page to begin extraction.
            </p>
          )}
        </div>

        {/* Fixed Bottom Control */}
        <div className="p-4 border-t bg-white flex-shrink-0 space-y-3 pb-16 md:pb-3">
          <label
            htmlFor="file-upload"
            className="block w-full text-center py-2 px-4 rounded-lg font-semibold text-white transition duration-200 bg-blue-600 hover:bg-blue-700 cursor-pointer shadow-md"
          >
            <input
              id="file-upload"
              type="file"
              accept="image/*, application/pdf"
              onChange={onFileChange}
              className="hidden"
            />
            <UploadIcon className="w-5 h-5 mr-2 inline-block" />
            Upload New Newspaper Page
          </label>

          {/* Page Navigation */}
          {renderedPages.length > 1 && (
            <div className="flex justify-between items-center space-x-2">
              <button
                onClick={() => onPageNavigate("prev")}
                disabled={currentPageIndex === 0 || isLoading}
                className="flex items-center justify-center flex-1 py-2 px-4 rounded-lg font-semibold text-sm bg-indigo-500 hover:bg-indigo-600 text-white disabled:bg-gray-400 shadow-md"
              >
                <ChevronLeft className="w-5 h-5 mr-1" /> Prev
              </button>
              <button
                onClick={() => onPageNavigate("next")}
                disabled={currentPageIndex === renderedPages.length - 1 || isLoading}
                className="flex items-center justify-center flex-1 py-2 px-4 rounded-lg font-semibold text-sm bg-indigo-500 hover:bg-indigo-600 text-white disabled:bg-gray-400 shadow-md"
              >
                Next <ChevronRight className="w-5 h-5 ml-1" />
              </button>
            </div>
          )}

          {/* Extraction Button */}
          <button
            onClick={onProcessImage}
            disabled={!file || isLoading || isBackgroundProcessing || articles.length > 0}
            className={`w-full py-3 px-4 rounded-lg font-bold text-white flex items-center justify-center text-sm ${
              !file || isLoading || isBackgroundProcessing || articles.length > 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 shadow-md"
            }`}
          >
            {isLoading || isBackgroundProcessing ? (
              <>
                <LoaderIcon className="w-5 h-5 mr-3" />
                {isBackgroundProcessing ? "Processing..." : "Initializing..."}
              </>
            ) : (
              "Start Extraction"
            )}
          </button>
        </div>
      </div>

      {/* RESIZER - Desktop only */}
      <div
        className="hidden md:block w-2 cursor-col-resize bg-gray-300 hover:bg-gray-400 transition-colors"
        onMouseDown={onResizeStart}
      />

      {/* RIGHT PANEL - Articles */}
      <div
        className={`${
          mobileActiveTab === MOBILE_TABS.ARTICLES ? "flex" : "hidden"
        } md:flex flex-col flex-grow h-full overflow-hidden bg-gray-50`}
      >
        {/* Header */}
        <header className="border-b flex-shrink-0 p-4 bg-white flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-gray-800">
            Article ({articles.length > 0 ? `${currentArticleIndex + 1}/${articles.length}` : "0"})
          </h2>
          {isBackgroundProcessing && (
            <span className="text-sm font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-full flex items-center">
              <LoaderIcon className="w-4 h-4 mr-1" /> Processing...
            </span>
          )}
        </header>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-4 space-y-4 pb-16 md:pb-4">
          {error && (
            <div className="text-sm p-3 rounded-lg border text-blue-600 bg-blue-50 border-blue-200">
              {error}
            </div>
          )}

          {articles.length === 0 && !isLoading && !file && !isBackgroundProcessing && (
            <div className="text-center p-12 text-gray-500">
              <FileTextIcon className="w-10 h-10 mx-auto mb-4" />
              <p>Articles will appear here after processing.</p>
            </div>
          )}

          {currentArticle && (
            <div className="space-y-4">
              <h3 className="text-3xl font-extrabold text-gray-900 border-l-4 border-blue-500 pl-4">
                {currentArticle.title}
              </h3>
              <p className="text-sm text-gray-500 italic">Page {currentArticle.sourcePage}</p>
              <button
                onClick={() => onSummarize(currentArticle.body)}
                disabled={isSummarizing || isLoading}
                className="px-4 py-2 rounded-lg font-semibold text-sm bg-yellow-500 hover:bg-yellow-600 text-gray-800 shadow-md disabled:opacity-50"
              >
                {isSummarizing ? "Summarizing..." : "Summarize"}
              </button>
              <div className="text-gray-700 leading-relaxed text-base whitespace-pre-wrap">
                {currentArticle.body}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="flex justify-between p-3 border-t bg-white flex-shrink-0 shadow-md pb-16 md:pb-3">
          <button
            onClick={() => onArticleNavigate("prev")}
            disabled={currentArticleIndex === 0 || articles.length === 0}
            className={`flex-1 mx-1 py-2 rounded-lg font-semibold text-sm ${
              currentArticleIndex === 0 || articles.length === 0
                ? "bg-gray-200 text-gray-500"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            <ArrowLeft className="w-5 h-5 inline mr-1" /> Prev
          </button>
          <button
            onClick={() => onArticleNavigate("next")}
            disabled={currentArticleIndex === articles.length - 1 || articles.length === 0}
            className={`flex-1 mx-1 py-2 rounded-lg font-semibold text-sm ${
              currentArticleIndex === articles.length - 1 || articles.length === 0
                ? "bg-gray-200 text-gray-500"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            Next <ArrowRight className="w-5 h-5 inline ml-1" />
          </button>
        </div>
      </div>

      {/* MOBILE TAB SWITCHER */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 flex z-30 shadow-lg">
        <button
          onClick={() => onTabChange(MOBILE_TABS.DOCUMENT)}
          className={`flex-1 py-3 text-center font-semibold text-sm transition ${
            mobileActiveTab === MOBILE_TABS.DOCUMENT
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-700 border-r"
          }`}
        >
          📄 Document
        </button>
        <button
          onClick={() => onTabChange(MOBILE_TABS.ARTICLES)}
          className={`flex-1 py-3 text-center font-semibold text-sm transition ${
            mobileActiveTab === MOBILE_TABS.ARTICLES
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          📰 Articles
        </button>
      </div>
    </div>
  );
};
