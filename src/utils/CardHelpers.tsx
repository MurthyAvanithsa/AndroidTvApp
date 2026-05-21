import { Dimensions } from 'react-native';
import { CardAspectRatio } from '../types/commontypes';
import { getValueByPath } from './ObjectUtils';

/**
 * Scales a layout dimension (designed for a 1920x1080 canvas) 
 * into the device's native logical pixels.
 */
export function scaleToLogical(value: number | null | undefined): number {
  if (value == null) return 0;
  const { width } = Dimensions.get('window');
  return Math.round(value * (width / 1920));
}

export interface CardStyleBase {
  aspect_ratio?: CardAspectRatio | null;
  background_rectangle_width?: number | null;
  background_rectangle_height?: number | null;
  image_1_width?: number | null;
  image_1_height?: number | null;
}

/**
 * Parses a BrightScript-style aspect ratio string (e.g., "aspect_16:9")
 * into a numerical ratio (e.g., 1.77).
 */
export function parseAspectRatio(ratioStr: string | null | undefined): number {
  if (!ratioStr) return 16 / 9; // Default to 16:9
  
  // Clean up prefixes like "aspect_" or "aspectRatio_"
  const cleanStr = ratioStr.replace('aspectRatio_', '').replace('aspect_', '');
  const parts = cleanStr.split(':');
  
  if (parts.length === 2) {
    const w = parseFloat(parts[0]);
    const h = parseFloat(parts[1]);
    if (w > 0 && h > 0) return w / h;
  }
  
  return 16 / 9;
}

/**
 * Calculates the final width and height for a card based on 
 * style properties and aspect ratio.
 */
export function calculateCardDimensions(style: CardStyleBase, targetWidth?: number) {
  const ratio = parseAspectRatio(style.aspect_ratio);
  
  // Precedence: Target width (from Grid/List) > Background width > Image width > Fallback (400)
  const width = targetWidth || style.background_rectangle_width || style.image_1_width || 400;
  
  // Height is always driven by the aspect ratio unless background_rectangle_height is explicitly forced
  const height = style.background_rectangle_height || (width / ratio);
  
  return { width, height, ratio };
} 

export function parseBorderRadius(
  borderRadius: number | string | null | undefined
): number {
  if (typeof borderRadius === 'number') {
    return borderRadius;
  }
  if (!borderRadius) {
    return 0;
  }

  // Handle BrightScript-style sizes like "size_15" or "size_25"
  const sizeMatch = String(borderRadius).match(/size_(\d+)/);
  if (sizeMatch && sizeMatch[1]) {
    return parseInt(sizeMatch[1], 10);
  }

  // Fallback: try to parse any number in the string
  const numberMatch = String(borderRadius).match(/\d+/);
  if (numberMatch) {
    return parseInt(numberMatch[0], 10);
  }

  return 0;
}

/**
 * Extracts an image src from the DSP media_group structure.
 * Robust version that supports a requested key and a fallback default key.
 */
export const getImageForDisplay = (
  mediaGroup: any[] | null | undefined,
  imageKey?: string,
  defaultImageKey?: string
): string => {
  if (!mediaGroup || !Array.isArray(mediaGroup)) return '';

  const imageMediaGroup = mediaGroup.find((group) => group?.type === 'image');
  if (!imageMediaGroup?.media_item) return '';

  // Try to find the requested image key first
  if (imageKey) {
    const selectedImage = imageMediaGroup.media_item.find(
      (item: any) => item?.key === imageKey && item?.src
    );
    if (selectedImage?.src) return selectedImage.src;
  }

  // If requested key doesn't exist, try the default key
  if (defaultImageKey) {
    const defaultImage = imageMediaGroup.media_item.find(
      (item: any) => item?.key === defaultImageKey && item?.src
    );
    if (defaultImage?.src) return defaultImage.src;
  }

  return '';
};

/**
 * Legacy helper for extracting image src.
 */
export function getImageFromMediaGroup(
  mediaGroup: any[] | null | undefined,
  key: string,
  defaultValue: string = '',
): string {
  return getImageForDisplay(mediaGroup, key) || defaultValue;
}

/**
 * Determines if content is locked based on a metadata field.
 */
export const isContentLocked = (entry: any, dataKey: string): boolean => {
  if (!entry || !dataKey) return false;
  
  const rawValue = getValueByPath(entry, dataKey);
  const value = String(rawValue ?? '').toLowerCase();

  if (value === 'true' || value === 'free') return false;
  if (value === 'false' || value === 'locked') return true;

  return true; // Default to locked if status is ambiguous
};

/**
 * Returns a React Native style friendly aspect ratio string.
 */
export const getAspectRatioValue = (aspectRatio: CardAspectRatio | string | null | undefined): string => {
  if (!aspectRatio) {
    return '16 / 9';
  }
  const parts = aspectRatio.split('_');
  const ratio = parts[parts.length - 1]; // Handles both "aspect_16:9" and "aspectRatio_16:9"
  if (!ratio) {
    return '16 / 9';
  }
  return ratio.replace(':', ' / ');
};

/**
 * Parses a radius string like "size_15" and returns the number 15.
 */
export function getBorderRadius(
  enabled: boolean | null | undefined,
  radiusStr: string | null | undefined,
  defaultValue: number = 0
): number {
  if (!enabled || !radiusStr) return defaultValue;
  if (typeof radiusStr === 'number') return radiusStr;

  const match = String(radiusStr).match(/size_(\d+)/);
  if (match && match[1]) {
    console.log("match", match[1]);
    return parseInt(match[1], 10);
  }

  const fallbackMatch = String(radiusStr).match(/(\d+)/);
  return fallbackMatch ? parseInt(fallbackMatch[0], 10) : defaultValue;
}