// src/utils/objectUtils.ts
//
// Converted from BrightScript ObjectUtils.brs
// Mirrors: getValueByPath, getStringByPath, getIntegerByPath,
//          getBooleanByPath, getArrayByPath, getAssociativeArrayByPath,
//          findInArrayByField

// ─── getValueByPath ───────────────────────────────────────────────────────────
// Mirrors BrightScript getValueByPath(obj, fieldPath, default)
// Traverses dot-notation paths e.g. "images.thumbnail.url"

export function getValueByPath<T = unknown>(
  obj: Record<string, any> | null | undefined,
  fieldPath: string,
  defaultValue: T | null = null,
): T | null {
  if (obj == null || !fieldPath) return defaultValue ?? null;

  const tokens = fieldPath.split('.');
  let current: any = obj;

  for (const token of tokens) {
    if (!token) return defaultValue ?? null;

    // mirrors: if isAssociativeArray(currentObj) = false then return default
    if (
      typeof current !== 'object' ||
      Array.isArray(current) ||
      current == null
    ) {
      return defaultValue ?? null;
    }

    // mirrors: currentObj = currentObj.lookup(propName)
    current = current[token];
  }

  return current ?? defaultValue ?? null;
}

// ─── getStringByPath ──────────────────────────────────────────────────────────
// Mirrors BrightScript getStringByPath(obj, fieldPath, default = "")

export function getStringByPath(
  obj: Record<string, any> | null | undefined,
  fieldPath: string,
  defaultValue: string = '',
): string {
  const result = getValueByPath(obj, fieldPath);
  return typeof result === 'string' ? result : defaultValue;
}

// ─── getIntegerByPath ─────────────────────────────────────────────────────────
// Mirrors BrightScript getIntegerByPath(obj, fieldPath, default = 0)

export function getIntegerByPath(
  obj: Record<string, any> | null | undefined,
  fieldPath: string,
  defaultValue: number = 0,
): number {
  const result = getValueByPath(obj, fieldPath);
  return Number.isInteger(result) ? (result as number) : defaultValue;
}

// ─── getBooleanByPath ─────────────────────────────────────────────────────────
// Mirrors BrightScript getBooleanByPath(obj, fieldPath, default = false)

export function getBooleanByPath(
  obj: Record<string, any> | null | undefined,
  fieldPath: string,
  defaultValue: boolean = false,
): boolean {
  const result = getValueByPath(obj, fieldPath);
  return typeof result === 'boolean' ? result : defaultValue;
}

// ─── getArrayByPath ───────────────────────────────────────────────────────────
// Mirrors BrightScript getArrayByPath(obj, fieldPath, default = [])

export function getArrayByPath<T = unknown>(
  obj: Record<string, any> | null | undefined,
  fieldPath: string,
  defaultValue: T[] = [],
): T[] {
  const result = getValueByPath(obj, fieldPath);
  return Array.isArray(result) ? (result as T[]) : defaultValue;
}

// ─── getAssociativeArrayByPath ────────────────────────────────────────────────
// Mirrors BrightScript getAssociativeArrayByPath(obj, fieldPath, default = {})

export function getAssociativeArrayByPath<
  T extends Record<string, any> = Record<string, any>,
>(
  obj: Record<string, any> | null | undefined,
  fieldPath: string,
  defaultValue: T = {} as T,
): T {
  const result = getValueByPath(obj, fieldPath);
  if (result !== null && typeof result === 'object' && !Array.isArray(result)) {
    return result as T;
  }
  return defaultValue;
}

// ─── getImageFromMediaGroup ───────────────────────────────────────────────────
// Extracts an image src from the DSP media_group structure:
// media_group: [{ type: "image", media_item: [{ key: "720", src: "..." }] }]
//
// Usage: getImageFromMediaGroup(entryData.media_group, "720")

export function getImageFromMediaGroup(
  mediaGroup: any[] | null | undefined,
  key: string,
  defaultValue: string = '',
): string {
  if (!Array.isArray(mediaGroup)) return defaultValue;
  const imageGroup = mediaGroup.find((g: any) => g?.type === 'image');
  if (!imageGroup) return defaultValue;
  const item = (imageGroup.media_item ?? []).find((m: any) => m?.key === key);
  return item?.src ?? defaultValue;
}

// ─── findInArrayByField ───────────────────────────────────────────────────────
// Mirrors BrightScript findInArrayByField(array, matchField, matchValue, default = {})
// Finds the first item in an array where item[matchField] === matchValue

export function findInArrayByField<
  T extends Record<string, any> = Record<string, any>,
>(
  array: T[] | null | undefined,
  matchField: string,
  matchValue: unknown,
  defaultValue: T | null = null,
): T | null {
  if (!Array.isArray(array)) return defaultValue;

  for (const item of array) {
    if (item != null && matchField in item && item[matchField] === matchValue) {
      return item;
    }
  }

  return defaultValue;
}
