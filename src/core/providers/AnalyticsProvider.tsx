// Analytics provider - provides tracking methods throughout the app
import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { AnalyticsService, analytics as defaultAnalytics } from "../services/analytics";
import { FEATURES } from "@/config";


interface AnalyticsContextType {
  track: (event: string, properties?: Record<string, unknown>) => void;
  screen: (name: string, properties?: Record<string, unknown>) => void;
  identify: (userId: string, traits?: Record<string, unknown>) => void;
  reset: () => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

interface AnalyticsProviderProps {
  children: ReactNode;
  service?: AnalyticsService;
}

export function AnalyticsProvider({
  children,
  service = defaultAnalytics,
}: AnalyticsProviderProps) {
  // Initialize analytics on mount
  useEffect(() => {
    if (FEATURES.ENABLE_ANALYTICS) {
      service.initialize();
    }
  }, [service]);

  const track = useCallback(
    (event: string, properties?: Record<string, unknown>) => {
      if (!FEATURES.ENABLE_ANALYTICS) return;
      service.track(event, properties);
    },
    [service]
  );

  const screen = useCallback(
    (name: string, properties?: Record<string, unknown>) => {
      if (!FEATURES.ENABLE_ANALYTICS) return;
      service.screen(name, properties);
    },
    [service]
  );

  const identify = useCallback(
    (userId: string, traits?: Record<string, unknown>) => {
      if (!FEATURES.ENABLE_ANALYTICS) return;
      service.identify(userId, traits);
    },
    [service]
  );

  const reset = useCallback(() => {
    service.reset();
  }, [service]);

  return (
    <AnalyticsContext.Provider value={{ track, screen, identify, reset }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics(): AnalyticsContextType {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error("useAnalytics must be used within AnalyticsProvider");
  }
  return context;
}
