// src/context/StrapiContext.tsx

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type {
  BootstrapData,
  CardStyle,
  ScreenConfig,
  ScreenPreset,
  ContentTypeRoute,
  TopMenuConfig,
} from '../utils/BootstrapUtils';
import type { Entry } from '../types/commontypes';

// ─── Context Shape ────────────────────────────────────────────────────────────

interface StrapiContextType {
  bootstrapData: BootstrapData | null;
  setBootstrapData: (data: BootstrapData) => void;

  // Convenience accessors (mirrors m.global.*)
  cardStyles: Record<string, CardStyle>;
  screenConfigs: Record<string, ScreenConfig>;
  screenPresets: Record<string, ScreenPreset>;
  contentTypeRoutes: Record<string, ContentTypeRoute>;
  topMenuConfig: TopMenuConfig | null;

  currentActiveItem: Entry | null;
  setCurrentActiveItem: (item: Entry | null) => void;
}

// ─── Context & Hook ───────────────────────────────────────────────────────────

const StrapiContext = createContext<StrapiContextType | undefined>(undefined);

export const useStrapiContext = (): StrapiContextType => {
  const ctx = useContext(StrapiContext);
  if (!ctx)
    throw new Error('useStrapiContext must be used within StrapiProvider');
  return ctx;
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export const StrapiProvider = ({ children }: { children: ReactNode }) => {
  const [bootstrapData, setBootstrapDataState] = useState<BootstrapData | null>(
    null,
  );
  const [currentActiveItem, setCurrentActiveItem] = useState<Entry | null>(null);

  const setBootstrapData = (data: BootstrapData) => {
    setBootstrapDataState(data);
  };

  const value: StrapiContextType = {
    bootstrapData,
    setBootstrapData,
    cardStyles: bootstrapData?.cardStyles ?? {},
    screenConfigs: bootstrapData?.screenConfigs ?? {},
    screenPresets: bootstrapData?.screenPresets ?? {},
    contentTypeRoutes: bootstrapData?.contentTypeRoutes ?? {},
    topMenuConfig: bootstrapData?.topMenuConfig ?? null,
    currentActiveItem,
    setCurrentActiveItem,
  };

  return (
    <StrapiContext.Provider value={value}>{children}</StrapiContext.Provider>
  );
};
