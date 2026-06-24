import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Customer } from "@apptile/tile-modules";
import { STORAGE_KEYS } from "@/config";
import { shopify } from "@apptile/tile-modules";
import { useShopify } from "./ShopifyProvider";

interface AuthContextType {
  accessToken: string | null;
  customer: Customer | null;
  loading: boolean;
  error: string | null;
  signup: (input: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    acceptsMarketing?: boolean;
  }) => Promise<void>;
  login: (input: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  recoverPassword: (email: string) => Promise<void>;
  updateProfile: (
    patch: Partial<Pick<Customer, "firstName" | "lastName" | "phone" | "acceptsMarketing">>
  ) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { ready } = useShopify();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const persistToken = useCallback(async (token: string | null, expiresAt?: string) => {
    setAccessToken(token);
    if (token) {
      await AsyncStorage.setItem(STORAGE_KEYS.CUSTOMER_ACCESS_TOKEN, token);
      if (expiresAt) {
        await AsyncStorage.setItem(STORAGE_KEYS.CUSTOMER_TOKEN_EXPIRES_AT, expiresAt);
      }
    } else {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.CUSTOMER_ACCESS_TOKEN,
        STORAGE_KEYS.CUSTOMER_TOKEN_EXPIRES_AT,
      ]);
    }
  }, []);

  // Restore session on mount.
  useEffect(() => {
    if (!ready) return;
    let mounted = true;
    (async () => {
      try {
        const [token, expiresAt] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.CUSTOMER_ACCESS_TOKEN),
          AsyncStorage.getItem(STORAGE_KEYS.CUSTOMER_TOKEN_EXPIRES_AT),
        ]);
        if (!token) {
          if (mounted) setLoading(false);
          return;
        }
        if (expiresAt && new Date(expiresAt).getTime() < Date.now()) {
          await persistToken(null);
          if (mounted) setLoading(false);
          return;
        }
        const profile = await shopify.customer.profile(token);
        if (mounted) {
          setAccessToken(token);
          setCustomer(profile);
        }
      } catch (e) {
        console.error("[AuthProvider] restore failed", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [ready, persistToken]);

  const signup = useCallback<AuthContextType["signup"]>(
    async (input) => {
      setError(null);
      setLoading(true);
      try {
        const { customer: c, accessToken: tok } = await shopify.customer.signup(input);
        await persistToken(tok.accessToken, tok.expiresAt);
        setCustomer(c);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [persistToken]
  );

  const login = useCallback<AuthContextType["login"]>(
    async (input) => {
      setError(null);
      setLoading(true);
      try {
        const tok = await shopify.customer.login(input);
        await persistToken(tok.accessToken, tok.expiresAt);
        const profile = await shopify.customer.profile(tok.accessToken);
        setCustomer(profile);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [persistToken]
  );

  const logout = useCallback(async () => {
    if (accessToken) {
      try {
        await shopify.customer.logout(accessToken);
      } catch (e) {
        console.warn("[AuthProvider] logout failed", e);
      }
    }
    await persistToken(null);
    setCustomer(null);
  }, [accessToken, persistToken]);

  const recoverPassword = useCallback(async (email: string) => {
    setError(null);
    setLoading(true);
    try {
      await shopify.customer.recoverPassword(email);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback<AuthContextType["updateProfile"]>(
    async (patch) => {
      if (!accessToken) throw new Error("Not signed in");
      setLoading(true);
      try {
        const c = await shopify.customer.updateProfile(accessToken, patch);
        setCustomer(c);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [accessToken]
  );

  const refreshProfile = useCallback(async () => {
    if (!accessToken) return;
    const c = await shopify.customer.profile(accessToken);
    setCustomer(c);
  }, [accessToken]);

  const value = useMemo<AuthContextType>(
    () => ({
      accessToken,
      customer,
      loading,
      error,
      signup,
      login,
      logout,
      recoverPassword,
      updateProfile,
      refreshProfile,
    }),
    [
      accessToken,
      customer,
      loading,
      error,
      signup,
      login,
      logout,
      recoverPassword,
      updateProfile,
      refreshProfile,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
