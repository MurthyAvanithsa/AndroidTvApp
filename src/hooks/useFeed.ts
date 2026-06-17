import { useState, useEffect, useCallback } from 'react';
import { Image } from 'react-native';

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
export function useFeed(initialUrl: string | null | undefined, options: { headers?: Record<string, string>, pageSize?: number, itemLimit?: number, prefetchKeys?: string[] } = {}) {
  const { headers, pageSize = 4, itemLimit = 0, prefetchKeys = [] } = options;
  const [allData, setAllData] = useState<any[]>([]); // Full list of items fetched so far
  const [displayedData, setDisplayedData] = useState<any[]>([]); // Slice of items currently visible
  const [feedTitle, setFeedTitle] = useState<string | null>(null); // Top-level feed title
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [nextUrl, setNextUrl] = useState<string | null>(null);

  const prefetchImages = useCallback(async (items: any[]) => {
    if (!items.length) return;
    
    const urlsToPrefetch: string[] = [];
    items.forEach(item => {
      const mediaGroup = item?.media_group || [];
      const imageMediaGroup = mediaGroup.find((group: any) => group?.type === 'image');
      if (imageMediaGroup?.media_item) {
        if (prefetchKeys && prefetchKeys.length > 0) {
          prefetchKeys.forEach(key => {
            const selectedImage = imageMediaGroup.media_item.find((img: any) => img?.key === key && img?.src);
            if (selectedImage?.src) {
              urlsToPrefetch.push(selectedImage.src);
            }
          });
        } else {
          // Fallback: prefetch all images in the media group if no keys are specified
          imageMediaGroup.media_item.forEach((img: any) => {
            if (img?.src) {
              urlsToPrefetch.push(img.src);
            }
          });
        }
      }
    });

    if (urlsToPrefetch.length > 0) {
      console.log(`🖼️ useFeed: Prefetching ${urlsToPrefetch.length} images...`);
      await Promise.allSettled(urlsToPrefetch.map(url => Image.prefetch(url)));
    }
  }, [prefetchKeys]);
console.log("Prefetch Images",prefetchImages);
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
        let updatedAll = [...allData, ...newItems];
        if (itemLimit > 0 && updatedAll.length > itemLimit) {
          updatedAll = updatedAll.slice(0, itemLimit);
          setNextUrl(null); // Stop pagination if limit reached
        }
        setAllData(updatedAll);
        await prefetchImages(newItems);
        // If we are appending via API, we usually show the whole new page
        setDisplayedData(updatedAll);
        console.log(`✅ Feed Pagination: Appended ${newItems.length} items from API.`);
      } else {
        let finalItems = newItems;
        if (itemLimit > 0 && finalItems.length > itemLimit) {
          finalItems = finalItems.slice(0, itemLimit);
        }
        setAllData(finalItems);
        const initialBatch = finalItems.slice(0, pageSize);
        await prefetchImages(finalItems);
        // Start with the first batch (Local Pagination)
        setDisplayedData(initialBatch);
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
      const nextCount = Math.min(displayedData.length + pageSize, allData.length);
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
