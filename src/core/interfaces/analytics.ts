/**
 * Analytics Interface
 *
 * This file defines the contract for analytics tracking.
 * Implement these interfaces to integrate with any analytics provider:
 * - Mixpanel
 * - Amplitude
 * - Segment
 * - PostHog
 * - Firebase Analytics
 * - Custom solution
 */

// Event properties (any key-value pairs)
export type EventProperties = Record<string, string | number | boolean>;

// User properties for identification
export interface UserProperties {
  id: string;
  email?: string;
  name?: string;
  [key: string]: string | number | boolean | undefined;
}

// Analytics service interface
export interface Analytics {
  // Track a custom event
  track: (eventName: string, properties?: EventProperties) => void;

  // Identify a user
  identify: (userId: string, properties?: UserProperties) => void;

  // Track screen/page views
  screen: (screenName: string, properties?: EventProperties) => void;

  // Reset analytics (on logout)
  reset: () => void;
}

// Common event names (optional, for consistency)
export const CommonEvents = {
  SIGN_UP: "sign_up",
  SIGN_IN: "sign_in",
  SIGN_OUT: "sign_out",
  SCREEN_VIEW: "screen_view",
  BUTTON_CLICK: "button_click",
  ERROR: "error",
} as const;
