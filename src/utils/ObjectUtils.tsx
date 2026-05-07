// src/utils/objectUtils.ts
//
// Converted from BrightScript ObjectUtils.brs

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

    if (
      typeof current !== 'object' ||
      Array.isArray(current) ||
      current == null
    ) {
      return defaultValue ?? null;
    }

    current = current[token];
  }

  return current ?? defaultValue ?? null;
}

export function getStringByPath(
  obj: Record<string, any> | null | undefined,
  fieldPath: string,
  defaultValue: string = '',
): string {
  const value = getValueByPath(obj, fieldPath);
  if (value === null || value === undefined) {
    return defaultValue;
  }
  return String(value);
}