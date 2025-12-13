/**
 * Calculate Levenshtein distance between two strings
 * This measures the minimum number of single-character edits needed to change one string into another
 */
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = [];

  // Initialize DP table
  for (let i = 0; i <= m; i++) {
    dp[i] = [];
    dp[i][0] = i;
  }
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }

  // Fill DP table
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1, // deletion
          dp[i][j - 1] + 1, // insertion
          dp[i - 1][j - 1] + 1 // substitution
        );
      }
    }
  }

  return dp[m][n];
}

/**
 * Calculate similarity score between two strings (0-1, where 1 is identical)
 */
function similarity(str1: string, str2: string): number {
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 1;
  const distance = levenshteinDistance(str1, str2);
  return 1 - distance / maxLength;
}

/**
 * Check if search term matches any part of the text (fuzzy matching)
 * Returns a score from 0-1 indicating how well it matches
 */
function fuzzyMatch(searchTerm: string, text: string): number {
  if (!searchTerm || !text) return 0;

  const searchLower = searchTerm.toLowerCase().trim();
  const textLower = text.toLowerCase().trim();

  // Exact match gets highest score
  if (textLower === searchLower) return 1;

  // Contains match gets high score
  if (textLower.includes(searchLower)) return 0.9;

  // Check if all words in search term appear in text (in any order)
  const searchWords = searchLower.split(/\s+/).filter(w => w.length > 0);
  const textWords = textLower.split(/\s+/).filter(w => w.length > 0);
  
  if (searchWords.length > 0) {
    const allWordsMatch = searchWords.every(searchWord => 
      textWords.some(textWord => textWord.includes(searchWord) || searchWord.includes(textWord))
    );
    if (allWordsMatch) return 0.8;
  }

  // Calculate similarity score for best matching substring
  let bestScore = 0;
  const searchLength = searchLower.length;
  
  // Try matching against substrings of the text
  for (let i = 0; i <= textLower.length - searchLength; i++) {
    const substring = textLower.substring(i, i + searchLength);
    const score = similarity(searchLower, substring);
    if (score > bestScore) {
      bestScore = score;
    }
  }

  // Also try matching the entire text
  const fullScore = similarity(searchLower, textLower);
  if (fullScore > bestScore) {
    bestScore = fullScore;
  }

  // Boost score if search term is at the start of text
  if (textLower.startsWith(searchLower)) {
    bestScore = Math.max(bestScore, 0.85);
  }

  return bestScore;
}

/**
 * Fuzzy search through an array of items
 * @param items Array of items to search
 * @param searchTerm Search query
 * @param getSearchableText Function to extract searchable text from each item
 * @param threshold Minimum similarity score to include (0-1, default: 0.3)
 * @returns Array of items sorted by relevance (highest score first)
 */
export function fuzzySearch<T>(
  items: T[],
  searchTerm: string,
  getSearchableText: (item: T) => string | string[],
  threshold: number = 0.3
): Array<{ item: T; score: number }> {
  if (!searchTerm || !searchTerm.trim()) {
    return items.map(item => ({ item, score: 1 }));
  }

  const results: Array<{ item: T; score: number }> = [];

  for (const item of items) {
    const searchableTexts = getSearchableText(item);
    const texts = Array.isArray(searchableTexts) ? searchableTexts : [searchableTexts];
    
    let bestScore = 0;
    for (const text of texts) {
      if (!text) continue;
      const score = fuzzyMatch(searchTerm, text);
      if (score > bestScore) {
        bestScore = score;
      }
    }

    if (bestScore >= threshold) {
      results.push({ item, score: bestScore });
    }
  }

  // Sort by score (highest first)
  results.sort((a, b) => b.score - a.score);

  return results;
}

/**
 * Simple fuzzy search that returns filtered items (without scores)
 */
export function fuzzyFilter<T>(
  items: T[],
  searchTerm: string,
  getSearchableText: (item: T) => string | string[],
  threshold: number = 0.3
): T[] {
  return fuzzySearch(items, searchTerm, getSearchableText, threshold).map(r => r.item);
}

