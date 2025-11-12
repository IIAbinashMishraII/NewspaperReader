import { fetchWithBackoff } from "./apiService";
import { articleSchema } from "../constants/schemas";

/**
 * Extract articles from a single page
 */
export const extractArticlesFromPage = async (pageData, userApiKey) => {
  if (!userApiKey) {
    throw new Error("API Key is missing. Please set it in Settings.");
  }

  const userQuery =
    "Analyze this image of a newspaper page. Please identify and extract all separate articles. For each article, provide a clear, concise title and the complete, continuous body text, ensuring to combine text across columns logically. Ignore any advertisements, captions, or filler text. Return the result as a JSON array of objects.";

  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          { text: userQuery },
          {
            inlineData: {
              mimeType: pageData.mimeType,
              data: pageData.base64,
            },
          },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: articleSchema,
    },
  };

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${userApiKey}`;

  const result = await fetchWithBackoff(apiUrl, payload);
  const jsonText = result?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (jsonText) {
    try {
      const parsedArticles = JSON.parse(jsonText);
      return parsedArticles.map((a) => ({
        ...a,
        sourcePage: pageData.pageNumber,
      }));
    } catch (e) {
      console.error("JSON Parsing Error:", e);
      throw new Error("AI returned invalid JSON. Try a different page or image.");
    }
  }
  return [];
};

/**
 * Summarize an article
 */
export const summarizeArticle = async (articleBody, userApiKey) => {
  if (!articleBody || !userApiKey) {
    throw new Error("Missing article body or API key");
  }

  const userQuery = `Summarize the following newspaper article from UPSC perspective in concise bullet points, focusing only on the main events or arguments:\n\nArticle: ${articleBody}`;

  const payload = {
    contents: [{ parts: [{ text: userQuery }] }],
    systemInstruction: {
      parts: [
        {
          text: "You are a helpful reading assistant. Summarize the provided text accurately. Format the summary using Markdown bullet points.",
        },
      ],
    },
  };

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${userApiKey}`;
  const result = await fetchWithBackoff(apiUrl, payload);

  const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Could not generate summary. The article body might be too short or complex.");
  }

  return text;
};
