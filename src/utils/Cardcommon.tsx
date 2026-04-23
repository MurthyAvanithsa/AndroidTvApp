// src/utils/CardCommon.ts
//
// Converted from CardCommon.brs
// applyDataMap: resolves each dataMap entry against entryData and returns
// a map of control → resolved value, ready for Card1 to render.

import { getValueByPath, findInArrayByField } from './ObjectUtils';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DataMapEntry {
  control: string; // "image1" | "image2" | "label1" | "label2" | "label3" | "progressBar"
  field: string; // "uri" | "text" | "progress"
  path?: string; // dot-path into entryData e.g. "extensions.TBN_Host", or image key e.g. "720"
  value?: string; // static override value (skips path lookup if set)
}

export interface ResolvedCardData {
  image1Uri?: string;
  image2Uri?: string;
  label1Text?: string;
  label2Text?: string;
  label3Text?: string;
  progressValue?: number;
  previewVideoUri?: string;
  previewStartTime?: string;
  previewEndTime?: string;
  [key: string]: any;
}

export interface EntryContent {
  entryData: Record<string, any>;
}

// ─── applyDataMap ─────────────────────────────────────────────────────────────
// Mirrors BrightScript applyDataMap(dataMap, content)
//
// dataMap entry resolution rules (from CardCommon.brs):
//   1. If map.value is set → use it directly (static override)
//   2. If control is image1/image2 AND path does NOT start with "extensions."
//      AND field is "uri" → look up image from media_group by key
//   3. Otherwise → getValueByPath(content, "entryData." + map.path)

export function applyDataMap(
  dataMap: DataMapEntry[] | null | undefined,
  content: EntryContent,
): ResolvedCardData {
  const result: ResolvedCardData = {};
  if (!dataMap || !content) return result;

  const PREFIX_EXTENSIONS = 'extensions.';

  for (const map of dataMap) {
    if (!map || !map.field) continue;

    let value: any = map.value ?? undefined;

    if (value === undefined && map.path) {
      const isImageControl =
        map.control === 'image1' || map.control === 'image2';
      const isUriField = map.field === 'uri';
      const hasNonExtPath = !map.path.startsWith(PREFIX_EXTENSIONS);

      // ── Special image handling (mirrors BrightScript media_group lookup) ──
      if (isImageControl && hasNonExtPath && isUriField) {
        const mediaGroups = getValueByPath(content, `entryData.media_group`);
        if (Array.isArray(mediaGroups)) {
          const imageGroup = findInArrayByField(mediaGroups, 'type', 'image');
          if (imageGroup?.media_item) {
            const imageItem = findInArrayByField(
              imageGroup.media_item,
              'key',
              map.path,
            );
            if (imageItem?.src) value = imageItem.src;
          }
        }
      } else {
        // ── Standard dot-path lookup ─────────────────────────────────────────
        value = getValueByPath(content, `entryData.${map.path}`);
      }
    }

    if (value === undefined || value === null) continue;

    // Map control+field → ResolvedCardData key
    const key = `${map.control}_${map.field}`;
    switch (key) {
      case 'image1_uri':
        result.image1Uri = String(value);
        break;
      case 'image2_uri':
        result.image2Uri = String(value);
        break;
      case 'label1_text':
        result.label1Text = String(value);
        break;
      case 'label2_text':
        result.label2Text = String(value);
        break;
      case 'label3_text':
        result.label3Text = String(value);
        break;
      case 'progressBar_value':
        result.progressValue = Number(value);
        break;
      default:
        result[key] = value;
        break;
    }
  }

  return result;
}
