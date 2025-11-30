
/**
 * Splits a locale ID (e.g., "en-US", "en_US", "pl", "zh-Hant-TW") into language and region codes.
 *
 * Rules:
 * - Accepts hyphen or underscore as separator.
 * - Region (or script/region) part is optional.
 * - Returns only language and region (ignores a script if present).
 */
export function splitLocale(locale: string): LocaleInfo {
  const normalized = locale.replace(/_/g, "-").trim();
  const parts = normalized.split("-").filter(Boolean);
  const language = parts[0].toLowerCase();

  let region: string | undefined;
  if (parts.length > 1) {
    const last = parts[parts.length - 1];
    if (/^[A-Za-z]{2}$/.test(last) || /^[0-9]{3}$/.test(last)) {
      region = last.toUpperCase();
    }
  }

  return { language, region };
}

export interface LocaleInfo {
  language: string;
  region?: string;
}
