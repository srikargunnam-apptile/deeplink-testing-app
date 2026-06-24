// App configuration constants

// App info
export const APP_NAME = "Minimal Base";
export const APP_VERSION = "1.0.0";

// API configuration
export const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

// LiveLayer (remote per-env config) — endpoint hosts manifest + config
// bodies under `<endpoint>/<codePushId>/manifest.json` etc. Both fall
// back to localhost so a default-blueprint app boots without env wiring;
// production builds set them via EXPO_PUBLIC_* at build time.
export const LIVE_LAYER_ENDPOINT =
  process.env.EXPO_PUBLIC_LIVE_LAYER_ENDPOINT || "http://localhost:3000/live";
export const LIVE_LAYER_CODE_PUSH_ID =
  process.env.EXPO_PUBLIC_LIVE_LAYER_CODE_PUSH_ID || "dev";

// AsyncStorage keys
export const STORAGE_KEYS = {
  THEME: "user_theme",
  LANGUAGE: "user_language",
  ONBOARDING_COMPLETE: "onboarding_complete",
} as const;

// Feature flags
export const FEATURES = {
  ENABLE_ANALYTICS: true,
  ENABLE_DARK_MODE: true,
} as const;

// Supported languages
export const SUPPORTED_LOCALES = {
  en: "English",
  es: "Español",
} as const;

export type Locale = keyof typeof SUPPORTED_LOCALES;
export const DEFAULT_LOCALE: Locale = "en";

// Timeouts
export const API_TIMEOUT = 30000; // 30 seconds
export const DEBOUNCE_DELAY = 300; // 300ms

// Error messages
export const ERROR_MESSAGES = {
  NETWORK: "Network error. Please check your connection.",
  UNAUTHORIZED: "You are not authorized.",
  NOT_FOUND: "Resource not found.",
  SERVER: "Server error. Please try again.",
  VALIDATION: "Please check your input.",
} as const;
