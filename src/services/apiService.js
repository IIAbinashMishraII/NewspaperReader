/**
 * Custom fetch wrapper with exponential backoff.
 */
export const fetchWithBackoff = async (apiUrl, payload) => {
  const MAX_RETRIES = 5;
  let delay = 1000;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.json();
        console.error("API Error Response:", errorBody);
        throw new Error(
          `API call failed: ${response.statusText} (${response.status}). Details: ${
            errorBody.error?.message || "Check your API key."
          }`
        );
      }

      return await response.json();
    } catch (error) {
      if (attempt === MAX_RETRIES - 1) {
        throw new Error(`API failed after ${MAX_RETRIES} attempts: ${error.message}`);
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
};
