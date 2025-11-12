import React, { useState, useEffect, useCallback, useMemo } from "react";
import { db, appIdentifier } from "./config/firebase";
import { useAuth } from "./hooks/useAuth";
import { useFirestore } from "./hooks/useFirestore";
import { usePdfProcessing, fileToBase64 } from "./hooks/usePdfProcessing";
import { extractArticlesFromPage, summarizeArticle } from "./services/extractionService";
import { incrementExtractionCounter } from "./services/trackingService";
import { Header } from "./components/Header";
import { LoginPage } from "./components/LoginPage";
import { SettingsPage } from "./components/SettingsPage";
import { SummaryModal } from "./components/SummaryModal";
import { MainApp } from "./components/MainApp";
import { VIEWS, MOBILE_TABS } from "./constants/schemas";
import { LoaderIcon, FileTextIcon } from "./icons/Icons";

const App = () => {
  // Auth state
  const {
    user,
    isAuthReady,
    isLoading: authIsLoading,
    error: authError,
    handleSignIn,
    handleSignOut,
    setError: setAuthError,
  } = useAuth(db, appIdentifier);
  const { fetchUserApiKey, saveUserApiKey } = useFirestore(db, appIdentifier);
  const { processPdfToImages, fileToBase64: convertFileToBase64 } = usePdfProcessing();

  // UI state
  const [currentView, setCurrentView] = useState(VIEWS.LOADING);
  const [userApiKey, setUserApiKey] = useState(null);
  const [error, setError] = useState("");

  // Document/PDF state
  const [file, setFile] = useState(null);
  const [renderedPages, setRenderedPages] = useState([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // Articles state
  const [articles, setArticles] = useState([]);
  const [currentArticleIndex, setCurrentArticleIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isBackgroundProcessing, setIsBackgroundProcessing] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [summaryText, setSummaryText] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);

  // Resize state
  const [sidebarWidth, setSidebarWidth] = useState(30);
  const [isDragging, setIsDragging] = useState(false);
  const minWidthPercent = 30;

  // Mobile state
  const [mobileActiveTab, setMobileActiveTab] = useState(MOBILE_TABS.DOCUMENT);

  // Fetch API key on user login
  useEffect(() => {
    if (user) {
      fetchUserApiKey(user.uid)
        .then((key) => setUserApiKey(key))
        .catch((err) => {
          console.error(err);
          setError(err.message);
        });
    }
  }, [user, fetchUserApiKey]);

  // Determine view based on auth and API key status
  useEffect(() => {
    if (isAuthReady) {
      if (!user) {
        setCurrentView(VIEWS.LOGIN);
      } else if (!userApiKey) {
        setCurrentView(VIEWS.SETTINGS);
      } else {
        setCurrentView(VIEWS.MAIN);
      }
    }
  }, [isAuthReady, user, userApiKey]);

  // Save API key
  const handleSaveApiKey = useCallback(
    async (key) => {
      if (!user) return;
      try {
        await saveUserApiKey(user.uid, key);
        setUserApiKey(key);
        setError("");
        setCurrentView(VIEWS.MAIN);
      } catch (err) {
        setError(err.message);
      }
    },
    [user, saveUserApiKey]
  );

  // Handle file upload
  const handleFileChange = (event) => {
    setError("");
    const uploadedFile = event.target.files[0];

    if (
      uploadedFile &&
      (uploadedFile.type.startsWith("image/") || uploadedFile.type === "application/pdf")
    ) {
      setFile(uploadedFile);
      setRenderedPages([]);
      setCurrentPageIndex(0);
      setArticles([]);
      setCurrentArticleIndex(0);
      setIsBackgroundProcessing(false);
      setIsLoading(false);
    } else {
      setError("Please upload an image file (PNG, JPG, JPEG) or a PDF file.");
      setFile(null);
    }
  };

  // Process image/PDF
  const processImage = useCallback(async () => {
    if (!file || !db || !userApiKey) {
      setError("System not ready. Please ensure you are logged in and have set your API key.");
      return;
    }

    setIsLoading(true);
    setError("");
    setArticles([]);
    let pagesToProcess = [];

    try {
      if (file.type === "application/pdf") {
        pagesToProcess = await processPdfToImages(file, setError);
        setRenderedPages(pagesToProcess);
        setCurrentPageIndex(0);
      } else {
        const imageResult = await convertFileToBase64(file);
        pagesToProcess.push({ ...imageResult, pageNumber: 1 });
        setRenderedPages(pagesToProcess);
      }

      if (pagesToProcess.length === 0) {
        throw new Error("No pages found to process.");
      }

      await incrementExtractionCounter(db, appIdentifier, user?.uid);

      const totalPages = pagesToProcess.length;
      const firstPage = pagesToProcess[0];
      setError(`Step 2: Analyzing Page 1/${totalPages} (Foreground)...`);

      const firstPageArticles = await extractArticlesFromPage(firstPage, userApiKey);

      if (firstPageArticles.length > 0) {
        setArticles(firstPageArticles);
        setCurrentArticleIndex(0);
        setError(
          `Extraction started! ${firstPageArticles.length} articles found on Page 1. Reading enabled.`
        );
      } else {
        setArticles([]);
        setError(
          `Extraction started! No articles found on Page 1. Analyzing remaining pages in background.`
        );
      }

      setIsLoading(false);

      if (totalPages > 1) {
        setIsBackgroundProcessing(true);

        (async () => {
          let backgroundError = null;
          let successCount = firstPageArticles.length;

          for (let i = 1; i < totalPages; i++) {
            const page = pagesToProcess[i];
            setError(`Step 3 (Background): Analyzing Page ${i + 1}/${totalPages}...`);

            try {
              const newArticles = await extractArticlesFromPage(page, userApiKey);

              if (newArticles.length > 0) {
                setArticles((prev) => {
                  successCount += newArticles.length;
                  return [...prev, ...newArticles];
                });
                setError(`Page ${i + 1} complete. Total articles now: ${successCount}.`);
              }
            } catch (e) {
              console.error(`Background processing failed for Page ${i + 1}:`, e);
              backgroundError = `Warning: Failed to extract Page ${i + 1}. Continuing...`;
              setError(backgroundError);
            }
          }

          setArticles((finalArticles) => {
            const finalMessage = `All ${totalPages} pages processed. Total articles: ${finalArticles.length}.`;
            setError(backgroundError || finalMessage);
            return finalArticles;
          });

          setIsBackgroundProcessing(false);
        })();
      }
    } catch (e) {
      console.error("Processing error:", e);
      setError(`Extraction failed: ${e.message || "An unknown error occurred."}`);
      setIsLoading(false);
      setIsBackgroundProcessing(false);
    }
  }, [file, db, userApiKey, processPdfToImages, convertFileToBase64, user?.uid]);

  // Summarize article
  const handleSummarize = useCallback(
    async (articleBody) => {
      if (!articleBody) return;

      setIsModalOpen(true);
      setIsSummarizing(true);
      setSummaryText("");
      setError("");

      try {
        const summary = await summarizeArticle(articleBody, userApiKey);
        setSummaryText(summary);
      } catch (e) {
        console.error("Summarization error:", e);
        setSummaryText(`Failed to generate summary: ${e.message || "An unknown error occurred."}`);
      } finally {
        setIsSummarizing(false);
      }
    },
    [userApiKey]
  );

  // Resize logic
  const startDragging = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const stopDragging = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrag = useCallback(
    (e) => {
      if (!isDragging) return;

      const appContainer = document.getElementById("app-container");
      if (!appContainer) return;

      const containerRect = appContainer.getBoundingClientRect();
      const newWidthPx = e.clientX - containerRect.left;
      const maxWidthPx = containerRect.width - (containerRect.width * minWidthPercent) / 100;

      if (newWidthPx >= (containerRect.width * minWidthPercent) / 100 && newWidthPx <= maxWidthPx) {
        const newWidthPercent = (newWidthPx / containerRect.width) * 100;
        setSidebarWidth(newWidthPercent);
      }
    },
    [isDragging, minWidthPercent]
  );

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleDrag);
      document.addEventListener("mouseup", stopDragging);
      document.body.style.cursor = "col-resize";
    } else {
      document.removeEventListener("mousemove", handleDrag);
      document.removeEventListener("mouseup", stopDragging);
      document.body.style.cursor = "default";
    }
    return () => {
      document.removeEventListener("mousemove", handleDrag);
      document.removeEventListener("mouseup", stopDragging);
      document.body.style.cursor = "default";
    };
  }, [isDragging, handleDrag, stopDragging]);

  // Current article memo
  const currentArticle = useMemo(() => {
    if (articles.length > 0) {
      return articles[currentArticleIndex];
    }
    return null;
  }, [articles, currentArticleIndex]);

  // Render content based on view
  let content;
  switch (currentView) {
    case VIEWS.LOGIN:
      content = <LoginPage isLoading={authIsLoading} error={authError} onSignIn={handleSignIn} />;
      break;
    case VIEWS.SETTINGS:
      content = (
        <SettingsPage
          userApiKey={userApiKey}
          error={error}
          onSave={handleSaveApiKey}
          onBack={() => setCurrentView(VIEWS.MAIN)}
        />
      );
      break;
    case VIEWS.MAIN:
      content = (
        <MainApp
          file={file}
          renderedPages={renderedPages}
          currentPageIndex={currentPageIndex}
          articles={articles}
          currentArticleIndex={currentArticleIndex}
          currentArticle={currentArticle}
          isLoading={isLoading}
          isBackgroundProcessing={isBackgroundProcessing}
          isSummarizing={isSummarizing}
          error={error}
          sidebarWidth={sidebarWidth}
          mobileActiveTab={mobileActiveTab}
          onFileChange={handleFileChange}
          onPageNavigate={(dir) => {
            if (dir === "prev" && currentPageIndex > 0) setCurrentPageIndex((p) => p - 1);
            else if (dir === "next" && currentPageIndex < renderedPages.length - 1)
              setCurrentPageIndex((p) => p + 1);
          }}
          onArticleNavigate={(dir) => {
            if (dir === "next" && currentArticleIndex < articles.length - 1)
              setCurrentArticleIndex((p) => p + 1);
            else if (dir === "prev" && currentArticleIndex > 0)
              setCurrentArticleIndex((p) => p - 1);
          }}
          onProcessImage={processImage}
          onSummarize={handleSummarize}
          onResizeStart={startDragging}
          onTabChange={setMobileActiveTab}
        />
      );
      break;
    case VIEWS.LOADING:
    default:
      content = (
        <div className="flex flex-col items-center justify-center h-full text-gray-600 bg-gray-50">
          <LoaderIcon className="w-10 h-10 animate-spin mb-4 text-blue-500" />
          <p className="text-lg font-medium">Loading authentication...</p>
          {error && <p className="text-sm text-red-500 mt-4 p-2 bg-red-100 rounded">{error}</p>}
        </div>
      );
  }

  return (
    <div className="w-screen h-screen bg-gray-100 flex flex-col">
      <Header
        user={user}
        onSettingsClick={() => setCurrentView(VIEWS.SETTINGS)}
        onSignOut={() => {
          handleSignOut();
          setArticles([]);
          setRenderedPages([]);
          setFile(null);
          setError("");
        }}
      />
      <div className="flex-grow w-full h-full">{content}</div>
      <SummaryModal
        isOpen={isModalOpen}
        isSummarizing={isSummarizing}
        summaryText={summaryText}
        articleTitle={currentArticle?.title}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default App;
