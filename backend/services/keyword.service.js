/**
 * Production-grade Keyword Normalization & Matching Engine
 */

/**
 * Clean and normalize text by stripping emojis, punctuation, extra whitespaces, and newlines.
 * @param {string} text 
 * @param {boolean} caseSensitive 
 * @returns {string}
 */
export const normalizeText = (text, caseSensitive = false) => {
  if (!text || typeof text !== "string") return "";

  let cleaned = text
    // Convert newlines and tabs to single spaces
    .replace(/[\r\n\t]+/g, " ")
    // Remove emojis and unicode symbols
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "")
    // Remove punctuation marks (! ? . , - _ # @ : ; " ' ` ~ + = * / \ [ ] { } ( ) < >)
    .replace(/[!?,.\-_#@:;"'`~+=*/\\\[\]{}()<>]|/g, "")
    // Collapse multiple spaces into one space
    .replace(/\s+/g, " ")
    .trim();

  if (!caseSensitive) {
    cleaned = cleaned.toLowerCase();
  }

  return cleaned;
};

/**
 * Normalizes an array or string of keywords
 * @param {string|string[]} keywords 
 * @param {boolean} caseSensitive 
 * @returns {string[]}
 */
export const normalizeKeywordsList = (keywords, caseSensitive = false) => {
  if (!keywords) return [];

  const rawList = Array.isArray(keywords)
    ? keywords
    : String(keywords).split(",");

  return rawList
    .map((k) => normalizeText(String(k), caseSensitive))
    .filter(Boolean);
};

/**
 * Tests if an incoming comment or DM text matches a campaign's keywords.
 * @param {string} incomingText 
 * @param {string[]} campaignKeywords 
 * @param {Object} options 
 * @param {string} options.matchType - 'contains' | 'exact' | 'starts_with' | 'ends_with'
 * @param {boolean} options.exactMatch - boolean flag fallback
 * @param {boolean} options.caseSensitive - boolean flag
 * @returns {{ isMatch: boolean, matchedKeyword: string }}
 */
export const matchKeyword = (incomingText, campaignKeywords = [], options = {}) => {
  const { matchType = "contains", exactMatch = false, caseSensitive = false } = options;

  const normalizedInput = normalizeText(incomingText, caseSensitive);
  const normalizedKeywords = normalizeKeywordsList(campaignKeywords, caseSensitive);

  if (!normalizedInput || normalizedKeywords.length === 0) {
    return { isMatch: false, matchedKeyword: "" };
  }

  const effectiveMode = exactMatch ? "exact" : matchType;

  for (const keyword of normalizedKeywords) {
    let matched = false;

    switch (effectiveMode) {
      case "exact":
        matched = normalizedInput === keyword;
        break;
      case "starts_with":
        matched = normalizedInput.startsWith(keyword);
        break;
      case "ends_with":
        matched = normalizedInput.endsWith(keyword);
        break;
      case "contains":
      default:
        // Match full words or substring
        matched = normalizedInput.includes(keyword);
        break;
    }

    if (matched) {
      return { isMatch: true, matchedKeyword: keyword };
    }
  }

  return { isMatch: false, matchedKeyword: "" };
};
