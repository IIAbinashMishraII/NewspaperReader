import { useCallback } from "react";

/**
 * Convert File to Base64
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result.split(",")[1];
      resolve({ base64: base64String, mimeType: file.type });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

/**
 * Custom hook for PDF processing
 */
export const usePdfProcessing = () => {
  const processPdfToImages = useCallback(async (pdfFile, setError) => {
    try {
      setError("Step 1: Initializing PDF Reader...");
      const pdfjsLib = await import(
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.min.mjs"
      );
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs";

      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      const pagesData = [];

      for (let i = 1; i <= numPages; i++) {
        setError(`Step 1: Rendering Page ${i} of ${numPages} to high-resolution image...`);
        const page = await pdf.getPage(i);

        const scale = 2.5;
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport: viewport }).promise;

        const imageDataUrl = canvas.toDataURL("image/png");
        const base64 = imageDataUrl.split(",")[1];

        pagesData.push({ base64, mimeType: "image/png", pageNumber: i });
      }
      return pagesData;
    } catch (e) {
      console.error("PDF Rendering Error:", e);
      throw new Error("Failed to render PDF: The file might be corrupted or is too large/complex.");
    }
  }, []);

  return {
    processPdfToImages,
    fileToBase64,
  };
};
