/**
 * Best-effort region + currency defaults from the device locale.
 *
 * Phase 3.1 onboarding seeds these so the user only has to confirm. We use the
 * built-in Intl APIs available in Hermes — no native module dependency.
 */
import { NativeModules, Platform } from 'react-native';

const REGION_TO_CURRENCY: Record<string, string> = {
  US: 'USD',
  CA: 'CAD',
  GB: 'GBP',
  IN: 'INR',
  AU: 'AUD',
  NZ: 'NZD',
  SG: 'SGD',
  JP: 'JPY',
  CN: 'CNY',
  KR: 'KRW',
  ZA: 'ZAR',
  AE: 'AED',
  CH: 'CHF',
  SE: 'SEK',
  NO: 'NOK',
  DK: 'DKK',
  PL: 'PLN',
  BR: 'BRL',
  MX: 'MXN',
  TR: 'TRY',
  RU: 'RUB',
};

const EURO_REGIONS = new Set([
  'AT', 'BE', 'CY', 'DE', 'EE', 'ES', 'FI', 'FR', 'GR', 'HR', 'IE',
  'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 'PT', 'SI', 'SK',
]);

function deviceLocale(): string | null {
  if (Platform.OS === 'ios') {
    const settings = NativeModules.SettingsManager?.settings;
    const locale =
      settings?.AppleLocale ??
      (Array.isArray(settings?.AppleLanguages) ? settings.AppleLanguages[0] : null);
    if (typeof locale === 'string') return locale;
  }
  if (Platform.OS === 'android') {
    const locale = NativeModules.I18nManager?.localeIdentifier;
    if (typeof locale === 'string') return locale;
  }
  // Fallback to Intl (Hermes ships Intl in SDK 50+).
  try {
    const parts = new Intl.DateTimeFormat().resolvedOptions().locale;
    if (parts) return parts;
  } catch {
    /* ignore */
  }
  return null;
}

/** Returns ISO country code (e.g. "IN") or null. */
export function detectRegion(): string | null {
  const locale = deviceLocale();
  if (!locale) return null;
  // Locales look like "en_IN" / "en-IN" / "en-US@calendar=…"
  const match = locale.replace('_', '-').match(/-([A-Z]{2})/i);
  if (!match) return null;
  return match[1]!.toUpperCase();
}

/** Returns ISO currency code for the region, or "USD" as a safe default. */
export function currencyForRegion(region: string | null): string {
  if (!region) return 'USD';
  if (EURO_REGIONS.has(region)) return 'EUR';
  return REGION_TO_CURRENCY[region] ?? 'USD';
}

/**
 * Format an amount in the given currency for display. Falls back to plain
 * "X.XX CCC" if Intl can't render the chosen currency.
 */
export function formatMoney(amount: number, currency: string | null): string {
  const c = currency ?? 'USD';
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: c,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${c}`;
  }
}
