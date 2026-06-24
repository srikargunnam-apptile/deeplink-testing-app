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
import type { Cart, CartLineInput } from "@apptile/tile-modules";
import { STORAGE_KEYS } from "@/config";
import { shopify } from "@apptile/tile-modules";
import { useShopify } from "./ShopifyProvider";

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  itemCount: number;
  addLine: (input: CartLineInput) => Promise<void>;
  updateLine: (lineId: string, quantity: number) => Promise<void>;
  removeLine: (lineId: string) => Promise<void>;
  applyDiscountCodes: (codes: string[]) => Promise<void>;
  refresh: () => Promise<void>;
  reset: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { ready } = useShopify();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const persist = useCallback(async (next: Cart | null) => {
    setCart(next);
    if (next) {
      await AsyncStorage.setItem(STORAGE_KEYS.CART_ID, next.id);
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.CART_ID);
    }
  }, []);

  // Restore or create a cart once shopify SDK is ready.
  useEffect(() => {
    if (!ready) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const savedId = await AsyncStorage.getItem(STORAGE_KEYS.CART_ID);
        if (savedId) {
          const existing = await shopify.cart.get(savedId);
          if (existing) {
            if (mounted) {
              setCart(existing);
              setLoading(false);
            }
            return;
          }
        }
        const created = await shopify.cart.create();
        if (mounted) {
          await persist(created);
        }
      } catch (e) {
        console.error("[CartProvider] init failed", e);
        if (mounted) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [ready, persist]);

  const ensureCartId = useCallback(async (): Promise<string> => {
    if (cart?.id) return cart.id;
    const created = await shopify.cart.create();
    await persist(created);
    return created.id;
  }, [cart, persist]);

  const addLine = useCallback(
    async (input: CartLineInput) => {
      setLoading(true);
      setError(null);
      try {
        const id = await ensureCartId();
        const next = await shopify.cart.addLines(id, [input]);
        await persist(next);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [ensureCartId, persist]
  );

  const updateLine = useCallback(
    async (lineId: string, quantity: number) => {
      if (!cart?.id) return;
      setLoading(true);
      try {
        const next = await shopify.cart.updateLines(cart.id, [
          { id: lineId, quantity },
        ]);
        await persist(next);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    },
    [cart, persist]
  );

  const removeLine = useCallback(
    async (lineId: string) => {
      if (!cart?.id) return;
      setLoading(true);
      try {
        const next = await shopify.cart.removeLines(cart.id, [lineId]);
        await persist(next);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    },
    [cart, persist]
  );

  const applyDiscountCodes = useCallback(
    async (codes: string[]) => {
      if (!cart?.id) return;
      setLoading(true);
      try {
        const next = await shopify.cart.applyDiscountCodes(cart.id, codes);
        await persist(next);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    },
    [cart, persist]
  );

  const refresh = useCallback(async () => {
    if (!cart?.id) return;
    const next = await shopify.cart.get(cart.id);
    if (next) await persist(next);
  }, [cart, persist]);

  const reset = useCallback(async () => {
    const created = await shopify.cart.create();
    await persist(created);
  }, [persist]);

  const value = useMemo<CartContextType>(
    () => ({
      cart,
      loading,
      error,
      itemCount: cart?.totalQuantity ?? 0,
      addLine,
      updateLine,
      removeLine,
      applyDiscountCodes,
      refresh,
      reset,
    }),
    [cart, loading, error, addLine, updateLine, removeLine, applyDiscountCodes, refresh, reset]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
