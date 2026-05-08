import { useState, useEffect, useCallback } from 'react';

interface FeedResponse {
  entry?: any[];
  items?: any[];
  next?: string;
  [key: string]: any;
}

const PAGE_SIZE = 4; // Reveal 4 items at a time for local pagination

/**
 * Reusable hook to fetch feed data from a URL with pagination support.
 * Now supports "Local Pagination" if the API doesn't provide a 'next' link.
 */
export function useFeed(initialUrl: string | null | undefined, headers?: Record<string, string>) {
  const [allData, setAllData] = useState<any[]>([]); // Full list of items fetched so far
  const [displayedData, setDisplayedData] = useState<any[]>([]); // Slice of items currently visible
  const [feedTitle, setFeedTitle] = useState<string | null>(null); // Top-level feed title
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [nextUrl, setNextUrl] = useState<string | null>(null);

  const fetchFeed = useCallback(async (url: string, isAppend: boolean = false) => {
    if (isAppend) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setAllData([]);
      setDisplayedData([]);
    }
    setError(null);

    try {
      console.log(`📡 useFeed: Fetching ${url}`);
      const response = await fetch(url, headers ? { headers } : undefined);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} for URL: ${url}`);
      }
      const json: FeedResponse = await response.json();

      // Capture the top-level feed title (e.g. "Featured Carousel")
      if (json.title) setFeedTitle(json.title);

      const newItems = json.entry || json.items || [];
      const hasNext = !!json.next;

      // Handle the "stop if empty" requirement
      if (newItems.length === 0 && hasNext) {
        console.warn("⚠️ Feed returned 'next' but no data. Stopping pagination.");
        setNextUrl(null);
      } else {
        setNextUrl(json.next || null);
      }

      if (isAppend) {
        const updatedAll = [...allData, ...newItems];
        setAllData(updatedAll);
        // If we are appending via API, we usually show the whole new page
        setDisplayedData(updatedAll);
        console.log(`✅ Feed Pagination: Appended ${newItems.length} items from API.`);
      } else {
        setAllData(newItems);
        // Start with the first batch (Local Pagination)
        setDisplayedData(newItems.slice(0, PAGE_SIZE));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch feed');
      console.error("Feed fetch error:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [allData]);

  useEffect(() => {
    if (initialUrl) {
      fetchFeed(initialUrl);
    } else {
      setAllData([]);
      setDisplayedData([]);
      setNextUrl(null);
    }
  }, [initialUrl]); // Removed fetchFeed from deps to prevent loop

  const loadMore = useCallback(() => {
    if (loading || loadingMore) return;

    // 1. If there is a nextUrl, fetch from API
    if (nextUrl) {
      console.log("🔄 Feed: Loading next page from API...", nextUrl);
      fetchFeed(nextUrl, true);
      return;
    }

    // 2. If no nextUrl, check if we have more local items to reveal
    if (displayedData.length < allData.length) {
      const nextCount = Math.min(displayedData.length + PAGE_SIZE, allData.length);
      console.log(`🔄 Feed: Revealing ${nextCount} local items...`);
      setDisplayedData(allData.slice(0, nextCount));
    }
  }, [nextUrl, loading, loadingMore, displayedData, allData, fetchFeed]);

  return { 
    data: displayedData, 
    feedTitle,
    loading, 
    loadingMore, 
    error, 
    loadMore, 
    hasMore: !!nextUrl || displayedData.length < allData.length
  };
}
