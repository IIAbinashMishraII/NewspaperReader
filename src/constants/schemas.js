// Define the required structured output for the AI
export const articleSchema = {
  type: "ARRAY",
  items: {
    type: "OBJECT",
    properties: {
      title: {
        type: "STRING",
        description: "The headline or title of the newspaper article.",
      },
      body: {
        type: "STRING",
        description: "The complete, continuous body text of the article, ignoring column breaks.",
      },
    },
    required: ["title", "body"],
    propertyOrdering: ["title", "body"],
  },
};

// View constants
export const VIEWS = {
  LOADING: "loading",
  LOGIN: "login",
  SETTINGS: "settings",
  MAIN: "main",
};

// Mobile tab constants
export const MOBILE_TABS = {
  DOCUMENT: "document",
  ARTICLES: "articles",
};
