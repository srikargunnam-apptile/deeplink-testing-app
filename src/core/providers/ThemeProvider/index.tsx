// Theme provider - manages light/dark/system theme with persistence
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS, FEATURES } from "@/config";
import { THEME, Mode } from "./themeConstants";

export type Theme = "light" | "dark" | "system";

/**
 * Walk a dot-separated path into THEME and:
 *   - if the leaf is `{ light, dark }` (a color) → return the right hex
 *     for the effective mode.
 *   - otherwise → return the value as-is (typography preset, etc.).
 *
 * Examples:
 *   getThemeValue("colors.primary")           → "#1060E0" / "#5A93F0"
 *   getThemeValue("typography.heading")       → { fontFamily, fontSize, … }
 *   getThemeValue("typography.body.fontSize") → 14
 */
type GetThemeValue = (path: string) => any;

interface ThemeContextType {
  theme: Theme;
  effectiveTheme: Mode;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  /** Dot-path lookup into THEME, mode-aware for color leaves. */
  getThemeValue: GetThemeValue;
  /** Raw THEME object (color leaves pre-resolved for the active mode). */
  resolvedTheme: typeof THEME;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
}: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [isReady, setIsReady] = useState(false);

  // Load saved theme from storage on mount
  useEffect(() => {
    if (!FEATURES.ENABLE_DARK_MODE) {
      setIsReady(true);
      return;
    }

    AsyncStorage.getItem(STORAGE_KEYS.THEME).then((saved) => {
      if (saved === "light" || saved === "dark" || saved === "system") {
        console.log("[ThemeProvider] Loaded theme:", saved);
        setThemeState(saved);
      }
      setIsReady(true);
    });
  }, []);

  // Resolve system theme to light/dark
  const effectiveTheme: "light" | "dark" =
    theme === "system" ? systemColorScheme || "light" : theme;

  const setTheme = useCallback(async (newTheme: Theme) => {
    console.log("[ThemeProvider] Setting theme:", newTheme);
    setThemeState(newTheme);
    await AsyncStorage.setItem(STORAGE_KEYS.THEME, newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = effectiveTheme === "light" ? "dark" : "light";
    setTheme(newTheme);
  }, [effectiveTheme, setTheme]);

  // Mode-aware dot-path getter. Memoised on effectiveTheme so consumers
  // re-render when light/dark flips without rebuilding THEME itself.
  const getThemeValue = useCallback<GetThemeValue>(
    (path: string) => {
      const value = path
        .split(".")
        .reduce<any>((node, key) => (node == null ? node : node[key]), THEME);
      return value &&
        typeof value === "object" &&
        "light" in value &&
        "dark" in value
        ? value[effectiveTheme]
        : value;
    },
    [effectiveTheme],
  );

  // THEME with every color leaf collapsed to the active mode's hex —
  // lets callers do `resolvedTheme.colors.primary` directly instead of
  // calling `getThemeValue("colors.primary")`.
  const resolvedTheme = useMemo(() => {
    const colors: Record<string, string> = {};
    for (const [name, slot] of Object.entries(THEME.colors)) {
      colors[name] = (slot as { light: string; dark: string })[effectiveTheme];
    }
    return { ...THEME, colors } as unknown as typeof THEME;
  }, [effectiveTheme]);

  if (!isReady) return null;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        effectiveTheme,
        setTheme,
        toggleTheme,
        getThemeValue,
        resolvedTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
