// src/components/BootstrapProcess.tsx
//
// Caching strategy:
//   Layer 1 — TTL (30 min): skip ALL network calls if cache is fresh
//   Layer 2 — per-endpoint updatedAt: after TTL expires, fetch each endpoint's
//             latest updatedAt and only re-parse endpoints that actually changed.
//             This handles the case where layout.updatedAt hasn't changed but
//             child endpoints (card styles, screens, presets, routes) have.

import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import pkg from '../../../package.json';
import { useStrapiContext } from '../../context/StrapiContext';
import {
  parseCardStyles,
  parseScreenConfigs,
  parseScreenPresets,
  parseContentTypeRoutes,
  parseMenuConfig,
  type BootstrapData,
} from '../../utils/BootstrapUtils';

// ─── Cache Config ─────────────────────────────────────────────────────────────

const BOOTSTRAP_STORAGE_KEY = 'bootstrap_data';

const BOOTSTRAP_FETCHED_KEY = 'bootstrap_fetched_at';

// const TTL_MS = 30 * 60 * 1000; // 30 minutes
const TTL_MS = 1 * 60 * 1000; // 15 minutes for testing

// ─── Types ────────────────────────────────────────────────────────────────────

interface EndpointVersions {
  layout: string;
  screenConfigs: string;
  presets: string;
  contentRoutes: string;
  cardStyles: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Fetches an endpoint and returns { data, latestUpdatedAt }
// latestUpdatedAt = the most recent updatedAt across all items in the response
async function fetchEndpoint(
  url: string,
): Promise<{ data: any[]; latestUpdatedAt: string }> {
  let allData: any[] = [];
  let page = 1;
  let pageCount = 1;

  do {
    const separator = url.includes('?') ? '&' : '?';
    // Using a large pageSize to minimize requests, though pagination logic handles any count
    const pagedUrl = `${url}${separator}pagination[page]=${page}&pagination[pageSize]=100`;

    console.log(`📡 Fetching URL: ${pagedUrl}`);
    const res = await fetch(pagedUrl);
    const json = await res.json();
    console.log(`📦 Data from ${url.split('?')[0].split('/').pop()} (Page ${page}):`, json.data);

    if (json.data) {
      allData = [...allData, ...json.data];
    }

    pageCount = json.meta?.pagination?.pageCount ?? 1;
    page++;
  } while (page <= pageCount);

  // Find the most recently updated item in the merged response
  const latestUpdatedAt = allData.reduce((latest, item) => {
    const itemDate = item.updatedAt ?? item.publishedAt ?? '';
    return itemDate > latest ? itemDate : latest;
  }, '');

  return { data: allData, latestUpdatedAt };
}

// ─── Component ────────────────────────────────────────────────────────────────

const BootstrapProcess = ({ navigation }: any) => {
  const [loadingStatus, setLoadingStatus] = useState('Initializing...');
  const { setBootstrapData } = useStrapiContext();
  const { tenantCode, versionNumber, baseUrl } = pkg.strapiConfig;

  useEffect(() => {
    const runBootstrap = async () => {
      try {
        console.log('🚀 BOOTSTRAP START');

        // ── 1. Load cache ────────────────────────────────────────────────────
        const [cachedDataRaw, storedFetchedAt] =
          await Promise.all([
            AsyncStorage.getItem(BOOTSTRAP_STORAGE_KEY),
            AsyncStorage.getItem(BOOTSTRAP_FETCHED_KEY),
          ]);

        const cachedData: BootstrapData | null = cachedDataRaw
          ? JSON.parse(cachedDataRaw)
          : null;

        const now = Date.now();
        const lastFetchedAt = storedFetchedAt ? Number(storedFetchedAt) : 0;
        const isWithinTTL = cachedData && now - lastFetchedAt < TTL_MS;

        // ── 2. TTL hit — skip everything ─────────────────────────────────────
        if (isWithinTTL) {
          const minsAgo = Math.round((now - lastFetchedAt) / 60000);
          console.log(
            `⚡ TTL hit — cache is ${minsAgo}m old, skipping all network calls`,
          );
          setBootstrapData(cachedData!);
          setLoadingStatus('Complete!');
          setTimeout(() => navigation.replace('Home'), 500);
          return;
        }

        // ── 3. TTL expired — fetch layout to get layoutId + menu config ──────
        setLoadingStatus('Checking for updates...');

        const layoutUrl = `${baseUrl}roku-apps?populate=all&filters[tenant][code][$eq]=${tenantCode}&filters[version][$eq]=${versionNumber}`;
        console.log('📡 Fetching Layout URL:', layoutUrl);
        
        const layoutRes = await fetch(layoutUrl);
        const layoutJson = await layoutRes.json();
        console.log('📦 Layout Data:', layoutJson.data);
console.log("layoutJson: ", layoutJson);
        const layoutId = layoutJson.data?.[0]?.layout?.documentId;
        const rawMenuConfig = layoutJson.data?.[0]?.layout?.roku_menu;
        const layoutUpdatedAt = layoutJson.data?.[0]?.layout?.updatedAt ?? '';

        if (!layoutId) throw new Error('Layout ID not found in API response');

        // ── 4. Fetch full data from all endpoints in parallel ────────────────
        setLoadingStatus('Loading updated resources...');

        const fullParams = `populate=all&filters[layout][documentId][$eq]=${layoutId}`;

        const [screensRes, presetsRes, routesRes, stylesRes] =
          await Promise.all([
            fetchEndpoint(`${baseUrl}roku-screens?${fullParams}`),
            fetchEndpoint(`${baseUrl}roku-presets?${fullParams}`),
            fetchEndpoint(`${baseUrl}roku-content-type-routers?${fullParams}`),
            fetchEndpoint(`${baseUrl}roku-card-styles?${fullParams}`)
          ]);

        // ── 5. Parse and merge data ──────────────────────────────────────────
        const bootstrapData: BootstrapData = {
          layoutId,
          cardStyles: parseCardStyles(stylesRes.data),
          screenConfigs: parseScreenConfigs(screensRes.data),
          screenPresets: parseScreenPresets(presetsRes.data),
          contentTypeRoutes: parseContentTypeRoutes(routesRes.data),
          topMenuConfig: parseMenuConfig(rawMenuConfig),
          lastUpdated: new Date().toISOString(),
        };

        // ── 6. Persist updated data + timestamp ──────────────────────────────
        await Promise.all([
          AsyncStorage.setItem(BOOTSTRAP_STORAGE_KEY, JSON.stringify(bootstrapData)),
          AsyncStorage.setItem(BOOTSTRAP_FETCHED_KEY, String(now)),
        ]);

        // ── 10. Push into context and navigate ───────────────────────────────
        setBootstrapData(bootstrapData);
        setLoadingStatus('Complete!');
        setTimeout(() => navigation.replace('Home'), 500);
      } catch (error) {
        console.error('❌ Bootstrap Error:', error);

        // Fallback: serve stale cache on network error
        try {
          const cachedDataRaw = await AsyncStorage.getItem(
            BOOTSTRAP_STORAGE_KEY,
          );    
          console.log("cached Data : ", cachedDataRaw);
          if (cachedDataRaw) {
            const parsedData = JSON.parse(cachedDataRaw);
            console.log("cached Data cardStyles : ", parsedData.cardStyles);
            console.warn('⚠️ Network error — falling back to cached data');
            setBootstrapData(parsedData);
            setLoadingStatus('Loaded from cache.');
            setTimeout(() => navigation.replace('Home'), 500);
            return;
          }
        } catch (cacheError) {
          console.error('❌ Cache fallback failed:', cacheError);
        }

        setLoadingStatus('Failed to load configuration. Please restart.');
      }
    };
    runBootstrap();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#fff" />
      <Text style={styles.statusText}>{loadingStatus}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  statusText: {
    color: '#fff',
    marginTop: 20,
    fontSize: 16,
  },
});

export default BootstrapProcess;
