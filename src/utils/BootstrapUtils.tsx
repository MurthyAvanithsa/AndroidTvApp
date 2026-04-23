// src/utils/bootstrapUtils.ts

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CardStyle {
  name: string;
  card_type: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  [key: string]: any; // allows card_type_1, card_type_2, etc.
}

export interface PageBlock {
  component: string;
  config: Record<string, any>;
}

export interface ScreenConfig {
  screenId: string;
  screenName: string;
  isHome: boolean;
  page_blocks: PageBlock[];
  showHeader: boolean;
}

export interface ScreenPreset {
  presetName: string;
  preset_blocks: PageBlock[];
}

export interface ContentTypeRoute {
  screen: string;
  params: Record<string, any>;
  pageId: string;
}

export interface MenuItem {
  title: string;
  enabled: boolean;
  showLabel: boolean;
  showImage: boolean;
  imagePath: string;
  label: string;
}

export interface TopMenuConfig {
  backgroundImage: string;
  height: number;
  width: number;
  menuItems: MenuItem[];
}

export interface BootstrapData {
  layoutId: string;
  cardStyles: Record<string, CardStyle>;
  screenConfigs: Record<string, ScreenConfig>;
  screenPresets: Record<string, ScreenPreset>;
  contentTypeRoutes: Record<string, ContentTypeRoute>;
  topMenuConfig: TopMenuConfig;
  lastUpdated: string;
}

// ─── Transformers ─────────────────────────────────────────────────────────────

/**
 * Transforms raw card styles API response into a keyed map by documentId.
 * Mirrors: m.global.cardStyles = { "<documentId>": { name, card_type, card_type_1, ... } }
 *
 * Strips internal fields: id, documentId, layout, tenant.
 * Preserves everything else as-is (card_type, card_type_1, card_type_2, etc.)
 */
export function parseCardStyles(data: any[]): Record<string, CardStyle> {
  const result: Record<string, CardStyle> = {};
  const STRIP_KEYS = new Set(['id', 'documentId', 'layout', 'tenant']);

  for (const item of data ?? []) {
    const id = item.documentId ?? item.id?.toString();
    if (!id) continue;

    const cardStyle: CardStyle = {
      name: '',
      card_type: '',
      createdAt: '',
      updatedAt: '',
      publishedAt: '',
    };

    for (const [key, value] of Object.entries(item)) {
      if (STRIP_KEYS.has(key)) continue;
      cardStyle[key] = value;
    }

    result[id] = cardStyle;
  }

  return result;
}

/**
 * Transforms raw screen configs API response into a keyed map by documentId.
 * Mirrors: m.global.screenConfigs = { "<documentId>": { screenId, screenName, isHome, pageBlocks, showHeader } }
 *
 * API fields (snake_case): name, is_home, show_menu, page_blocks
 */
export function parseScreenConfigs(data: any[]): Record<string, ScreenConfig> {
  const result: Record<string, ScreenConfig> = {};

  for (const item of data ?? []) {
    const id = item.documentId ?? item.id?.toString();
    if (!id) continue;

    result[id] = {
      screenId: id,
      screenName: item.name ?? item.screenName ?? item.screen_name ?? '',
      isHome: item.is_home ?? item.isHome ?? false,
      showHeader:
        item.show_menu ?? item.showHeader ?? item.show_header ?? false,
      page_blocks: parsePageBlocks(item.page_blocks ?? item.pageBlocks ?? []),
    };
  }

  return result;
}

/**
 * Transforms raw screen presets API response into a keyed map by preset_name.
 * Mirrors: m.global.screenPresets = { "<presetName>": { presetName, preset_blocks } }
 *
 * API fields (snake_case): preset_name, preset_blocks
 *
 * Key is camelCased preset_name (e.g. "16x9-NoTitle" → "16x9NoTitle")
 */
export function parseScreenPresets(data: any[]): Record<string, ScreenPreset> {
  const result: Record<string, ScreenPreset> = {};

  for (const item of data ?? []) {
    const rawName = item.preset_name ?? item.presetName ?? item.name;
    if (!rawName) continue;

    // Normalize key: strip hyphens and camelCase
    // e.g. "16x9-NoTitle" → "16x9NoTitle"
    const key = rawName.replace(/-([a-zA-Z0-9])/g, (_: string, c: string) =>
      c.toUpperCase(),
    );

    result[key] = {
      presetName: rawName,
      preset_blocks: parsePageBlocks(
        item.preset_blocks ?? item.pageBlocks ?? item.page_blocks ?? [],
      ),
    };
  }

  return result;
}

/**
 * Transforms raw content type routes API response into a keyed map by contentType.
 * Mirrors: m.global.contentTypeRoutes = { "article": { screen, params, pageId } }
 */
export function parseContentTypeRoutes(
  data: any[],
): Record<string, ContentTypeRoute> {
  const result: Record<string, ContentTypeRoute> = {};

  for (const item of data ?? []) {
    const type = item.contentType ?? item.content_type ?? item.type;
    if (!type) continue;
    result[type] = {
      screen: item.screen ?? '',
      params: item.params ?? {},
      pageId: item.pageId ?? item.page_id ?? item.documentId ?? '',
    };
  }

  return result;
}

/**
 * Transforms raw menu config from layout API response.
 * Mirrors: m.global.topMenuConfig = { backgroundImage, height, width, menuItems }
 */
export function parseMenuConfig(menuConfig: any): TopMenuConfig {
  return {
    backgroundImage:
      menuConfig?.backgroundImage ?? menuConfig?.background_image ?? '',
    height: menuConfig?.height ?? 100,
    width: menuConfig?.width ?? 1280,
    menuItems: (menuConfig?.menuItems ?? menuConfig?.menu_items ?? []).map(
      (item: any): MenuItem => ({
        title: item.title ?? '',
        enabled: item.enabled ?? true,
        showLabel: item.showLabel ?? item.show_label ?? true,
        showImage: item.showImage ?? item.show_image ?? false,
        imagePath: item.imagePath ?? item.image_path ?? '',
        label: item.label ?? '',
      }),
    ),
  };
}

// ─── Internal Helpers ─────────────────────────────────────────────────────────

/**
 * Parses page_blocks / preset_blocks from the API.
 *
 * API shape (fields are FLAT on the block, not nested under "config"):
 * {
 *   __component: 'roku.horizontal-list',
 *   id: 894,
 *   name: 'ShowLanding',
 *   identifier: 'ShowLanding',
 *   feed_url: '...',
 *   card_style: { documentId: '...' },
 *   ...
 * }
 *
 * __component  → PascalCase component name (e.g. "HorizontalList", "ResponsiveGrid")
 * everything else (except id) → config object
 */
function parsePageBlocks(blocks: any[]): PageBlock[] {
  return (blocks ?? []).map(block => {
    const { __component, id, ...rest } = block;

    // 'roku.horizontal-list' → 'HorizontalList'
    // 'web.responsive-grid'  → 'ResponsiveGrid'
    const rawType = __component ?? block.component ?? '';
    const component =
      rawType
        .split('.')
        .pop()
        ?.replace(/-([a-z])/g, (_: string, c: string) => c.toUpperCase())
        ?.replace(/^./, (c: string) => c.toUpperCase()) ?? rawType;

    // Use existing config key if present, otherwise all remaining fields are the config
    const config = block.config ?? block.configuration ?? rest;

    return { component, config };
  });
}
