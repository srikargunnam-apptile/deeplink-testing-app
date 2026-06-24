// I18n provider - manages translations and locale with persistence
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { translations, Locale, TranslationKey } from "../i18n";
import { STORAGE_KEYS, DEFAULT_LOCALE } from "@/config";

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  formatNumber: (num: number) => string;
  formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => string;
  formatCurrency: (amount: number, currency?: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
  defaultLocale?: Locale;
}

export function I18nProvider({
  children,
  defaultLocale = DEFAULT_LOCALE as Locale,
}: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [isReady, setIsReady] = useState(false);

  // Load saved locale from storage on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE).then((saved) => {
      if (saved && saved in translations) {
        console.log("[I18nProvider] Loaded locale:", saved);
        setLocaleState(saved as Locale);
      }
      setIsReady(true);
    });
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    console.log("[I18nProvider] Setting locale:", newLocale);
    setLocaleState(newLocale);
    AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, newLocale);
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>): string => {
      const translation =
        translations[locale]?.[key] ||
        translations[defaultLocale]?.[key] ||
        key;

      if (!params) return translation;

      return Object.entries(params).reduce(
        (str, [param, value]) =>
          str.replace(new RegExp(`{{${param}}}`, "g"), String(value)),
        translation
      );
    },
    [locale, defaultLocale]
  );

  const formatNumber = useCallback(
    (num: number): string => new Intl.NumberFormat(locale).format(num),
    [locale]
  );

  const formatDate = useCallback(
    (date: Date, options?: Intl.DateTimeFormatOptions): string =>
      new Intl.DateTimeFormat(locale, options).format(date),
    [locale]
  );

  const formatCurrency = useCallback(
    (amount: number, currency = "USD"): string =>
      new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount),
    [locale]
  );

  if (!isReady) return null;

  return (
    <I18nContext.Provider
      value={{ locale, setLocale, t, formatNumber, formatDate, formatCurrency }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}
