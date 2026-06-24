// Analytics service - extend this class to integrate real analytics providers
type EventProperties = Record<string, unknown>;

export class AnalyticsService {
  protected userId: string | null = null;
  protected isEnabled = true;

  async initialize(): Promise<void> {
    console.log("[Analytics] Initialized (console mode)");
  }

  identify(userId: string, traits?: EventProperties): void {
    this.userId = userId;
    if (this.isEnabled) {
      console.log("[Analytics] Identify:", userId, traits);
    }
  }

  track(event: string, properties?: EventProperties): void {
    if (this.isEnabled) {
      console.log("[Analytics] Track:", event, properties);
    }
  }

  screen(screenName: string, properties?: EventProperties): void {
    if (this.isEnabled) {
      console.log("[Analytics] Screen:", screenName, properties);
    }
  }

  reset(): void {
    this.userId = null;
    console.log("[Analytics] Reset");
  }

  logError(error: Error, context?: EventProperties): void {
    console.error("[Analytics] Error:", error.message, context);
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }
}

// Default instance uses console logging
export const analytics = new AnalyticsService();
