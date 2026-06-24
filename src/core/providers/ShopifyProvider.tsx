import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { shopify } from "@apptile/tile-modules";
import { shopifyConfig } from "@/config";

interface ShopifyContextType {
  ready: boolean;
}

const ShopifyContext = createContext<ShopifyContextType>({ ready: false });

export function ShopifyProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    shopify.init(shopifyConfig).then(() => {
      if (mounted) setReady(true);
    }).catch((err) => {
      console.error("[ShopifyProvider] init failed", err);
      if (mounted) setReady(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <ShopifyContext.Provider value={{ ready }}>
      {children}
    </ShopifyContext.Provider>
  );
}

export function useShopify(): ShopifyContextType {
  return useContext(ShopifyContext);
}
