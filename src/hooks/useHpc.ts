import { useState, useEffect, useCallback } from 'react';

const HPC_URL = 'https://tbndsp-prod.trilogyapps.com/v1/hpc';
const INITIAL_SIZE = 4;
const INCREMENT_SIZE = 4;

// Preset names to exclude from the home feed
const EXCLUDED_PRESET_NAMES = ['MyList', 'ContinueWatching'];

interface HpcEntry {
  index: number;
  feed_url: string;
  preset_name: string;
  extensions: any;
}

/**
 * Hook to fetch HPC (Home Page Content) and manage incremental "lazy loading" of rails.
 */
export function useHpc() {
  const [allEntries, setAllEntries] = useState<HpcEntry[]>([]);
  const [displayedData, setDisplayedData] = useState<HpcEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHpc() {
      setLoading(true);
      setError(null);
      try {
        console.log(`🌐 HPC: Fetching main feed from ${HPC_URL}...`);
        const response = await fetch(HPC_URL);
        if (!response.ok) throw new Error(`HTTP ${response.status} at ${HPC_URL}`);
        
        const json = await response.json();
        const entries = json.entry || [];

        const filteredEntries = entries.filter(
          (e: HpcEntry) => !EXCLUDED_PRESET_NAMES.includes(e.preset_name)
        );

        if (filteredEntries.length === 0) {
          console.warn("⚠️ HPC: Feed returned successfully but contains 0 entries after filtering.");
        }
        console.log(`🚫 HPC: Excluded ${entries.length - filteredEntries.length} rails (${EXCLUDED_PRESET_NAMES.join(', ')}).`);

        setAllEntries(filteredEntries);
        // Initially show only the first batch
        setDisplayedData(filteredEntries.slice(0, INITIAL_SIZE));
        console.log(`✅ HPC: Loaded ${filteredEntries.length} rails after filter. Displaying first ${INITIAL_SIZE}.`);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch HPC');
        console.error("HPC fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchHpc();
  }, []);

  const loadMore = useCallback(() => {
    if (loading || loadingMore || displayedData.length >= allEntries.length) return;

    setLoadingMore(true);
    
    // Simulate a small delay for smoother UI transition if needed, 
    // or just append immediately.
    setTimeout(() => {
      const currentCount = displayedData.length;
      const nextCount = Math.min(currentCount + INCREMENT_SIZE, allEntries.length);
      const nextBatch = allEntries.slice(0, nextCount);
      
      console.log(`🔄 HPC: Revealing rails ${currentCount + 1} to ${nextCount}...`);
      setDisplayedData(nextBatch);
      setLoadingMore(false);
    }, 100); 
  }, [displayedData, allEntries, loading, loadingMore]);

  return {
    data: displayedData,
    loading,
    loadingMore,
    error,
    loadMore,
    hasMore: displayedData.length < allEntries.length
  };
}
