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
const BOOTSTRAP_VERSIONS_KEY = 'bootstrap_versions'; // per-endpoint updatedAt map
const BOOTSTRAP_FETCHED_KEY = 'bootstrap_fetched_at';

const TTL_MS = 30 * 60 * 1000; // 30 minutes

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
  const res = await fetch(url);
  const json = await res.json();
  const items: any[] = json.data ?? [];

  // Find the most recently updated item in the response
  const latestUpdatedAt = items.reduce((latest, item) => {
    const itemDate = item.updatedAt ?? item.publishedAt ?? '';
    return itemDate > latest ? itemDate : latest;
  }, '');

  return { data: items, latestUpdatedAt };
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
        const [cachedDataRaw, cachedVersionsRaw, storedFetchedAt] =
          await Promise.all([
            AsyncStorage.getItem(BOOTSTRAP_STORAGE_KEY),
            AsyncStorage.getItem(BOOTSTRAP_VERSIONS_KEY),
            AsyncStorage.getItem(BOOTSTRAP_FETCHED_KEY),
          ]);

        const cachedData: BootstrapData | null = cachedDataRaw
          ? JSON.parse(cachedDataRaw)
          : null;

        const cachedVersions: EndpointVersions = cachedVersionsRaw
          ? JSON.parse(cachedVersionsRaw)
          : {
              layout: '',
              screenConfigs: '',
              presets: '',
              contentRoutes: '',
              cardStyles: '',
            };

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
        const layoutRes = await fetch(layoutUrl);
        const layoutJson = await layoutRes.json();

        const layoutId = layoutJson.data?.[0]?.layout?.documentId;
        const rawMenuConfig = layoutJson.data?.[0]?.layout?.roku_menu;
        const layoutUpdatedAt = layoutJson.data?.[0]?.layout?.updatedAt ?? '';

        if (!layoutId) throw new Error('Layout ID not found in API response');

        // ── 4. Fetch updatedAt metadata from all endpoints in parallel ────────
        //       Uses pagination=0&fields[0]=updatedAt to get a lightweight
        //       response — only timestamps, no full data yet
        setLoadingStatus('Checking endpoint versions...');

        const metaParams = `pagination[limit]=100&fields[0]=updatedAt&fields[1]=publishedAt`;
        const [screensMeta, presetsMeta, routesMeta, stylesMeta] =
          await Promise.all([
            fetch(
              `${baseUrl}roku-screens?${metaParams}&filters[layout][documentId][$eq]=${layoutId}`,
            ).then(r => r.json()),
            fetch(
              `${baseUrl}roku-presets?${metaParams}&filters[layout][documentId][$eq]=${layoutId}`,
            ).then(r => r.json()),
            fetch(
              `${baseUrl}roku-content-type-routers?${metaParams}&filters[layout][documentId][$eq]=${layoutId}`,
            ).then(r => r.json()),
            fetch(
              `${baseUrl}roku-card-styles?${metaParams}&filters[layout][documentId][$eq]=${layoutId}`,
            ).then(r => r.json()),
          ]);

        // Find the latest updatedAt per endpoint
        const getLatest = (json: any): string =>
          (json.data ?? []).reduce((latest: string, item: any) => {
            const d = item.updatedAt ?? item.publishedAt ?? '';
            return d > latest ? d : latest;
          }, '');

        const freshVersions: EndpointVersions = {
          layout: layoutUpdatedAt,
          screenConfigs: getLatest(screensMeta),
          presets: getLatest(presetsMeta),
          contentRoutes: getLatest(routesMeta),
          cardStyles: getLatest(stylesMeta),
        };

        console.log('📋 Cached versions:', cachedVersions);
        console.log('📋 Fresh  versions:', freshVersions);

        // ── 5. Determine which endpoints actually changed ─────────────────────
        const changed = {
          layout: freshVersions.layout !== cachedVersions.layout,
          screenConfigs:
            freshVersions.screenConfigs !== cachedVersions.screenConfigs,
          presets: freshVersions.presets !== cachedVersions.presets,
          contentRoutes:
            freshVersions.contentRoutes !== cachedVersions.contentRoutes,
          cardStyles: freshVersions.cardStyles !== cachedVersions.cardStyles,
        };

        const anyChanged = Object.values(changed).some(Boolean);

        // ── 6. Nothing changed — use cache, bump TTL ─────────────────────────
        if (!anyChanged && cachedData) {
          console.log('✅ All endpoints up-to-date — loading from cache');
          await AsyncStorage.setItem(BOOTSTRAP_FETCHED_KEY, String(now));
          setBootstrapData(cachedData);
          setLoadingStatus('Complete!');
          setTimeout(() => navigation.replace('Home'), 500);
          return;
        }

        // ── 7. Fetch only changed endpoints with full data ────────────────────
        setLoadingStatus('Loading updated resources...');

        const fullParams = `populate=all&filters[layout][documentId][$eq]=${layoutId}`;

        const [screensRes, presetsRes, routesRes, stylesRes] =
          await Promise.all([
            changed.screenConfigs
              ? fetchEndpoint(`${baseUrl}roku-screens?${fullParams}`)
              : Promise.resolve({
                  data: null,
                  latestUpdatedAt: cachedVersions.screenConfigs,
                }),
            changed.presets
              ? fetchEndpoint(`${baseUrl}roku-presets?${fullParams}`)
              : Promise.resolve({
                  data: null,
                  latestUpdatedAt: cachedVersions.presets,
                }),
            changed.contentRoutes
              ? fetchEndpoint(
                  `${baseUrl}roku-content-type-routers?${fullParams}`,
                )
              : Promise.resolve({
                  data: null,
                  latestUpdatedAt: cachedVersions.contentRoutes,
                }),
            changed.cardStyles
              ? fetchEndpoint(`${baseUrl}roku-card-styles?${fullParams}`)
              : Promise.resolve({
                  data: null,
                  latestUpdatedAt: cachedVersions.cardStyles,
                }),
          ]);

        console.log(
          '🔄 Changed endpoints:',
          Object.entries(changed)
            .filter(([, v]) => v)
            .map(([k]) => k),
        );

        // ── 8. Merge: fresh data where changed, cached data where unchanged ───
        const bootstrapData: BootstrapData = {
          layoutId,
          cardStyles: stylesRes.data
            ? parseCardStyles(stylesRes.data)
            : cachedData?.cardStyles ?? {},
          screenConfigs: screensRes.data
            ? parseScreenConfigs(screensRes.data)
            : cachedData?.screenConfigs ?? {},
          screenPresets: presetsRes.data
            ? parseScreenPresets(presetsRes.data)
            : cachedData?.screenPresets ?? {},
          contentTypeRoutes: routesRes.data
            ? parseContentTypeRoutes(routesRes.data)
            : cachedData?.contentTypeRoutes ?? {},
          topMenuConfig: changed.layout
            ? parseMenuConfig(rawMenuConfig)
            : cachedData?.topMenuConfig ?? parseMenuConfig(rawMenuConfig),
          lastUpdated: new Date().toISOString(),
        };

        // ── 9. Persist updated data + versions + timestamp ───────────────────
        await Promise.all([
          AsyncStorage.setItem(
            BOOTSTRAP_STORAGE_KEY,
            JSON.stringify(bootstrapData),
          ),
          AsyncStorage.setItem(
            BOOTSTRAP_VERSIONS_KEY,
            JSON.stringify(freshVersions),
          ),
          AsyncStorage.setItem(BOOTSTRAP_FETCHED_KEY, String(now)),
        ]);

        console.log('💾 Saved to AsyncStorage');
        console.log('🏷️  Versions stored:', freshVersions);

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
          if (cachedDataRaw) {
            console.warn('⚠️ Network error — falling back to cached data');
            setBootstrapData(JSON.parse(cachedDataRaw));
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
