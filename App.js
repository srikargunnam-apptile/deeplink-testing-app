import { LiveLayerProvider } from 'tile-live-layer';
import tileBootstrap from './assets/tile-live-layer.json';
import { TilePush } from '@apptile/tile-push-react-native';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  ThemeProvider,
  I18nProvider,
  AnalyticsProvider,
  ErrorBoundaryProvider,
  ShopifyProvider,
  CartProvider,
  AuthProvider,
} from '@/core/providers';
import Navigation from './src/navigation';

function BaseApp() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ErrorBoundaryProvider>
          <ThemeProvider>
            <I18nProvider>
              <AnalyticsProvider>
                <ShopifyProvider>
                  <AuthProvider>
                    <CartProvider>
                      <Navigation />
                    </CartProvider>
                  </AuthProvider>
                </ShopifyProvider>
              </AnalyticsProvider>
            </I18nProvider>
          </ThemeProvider>
        </ErrorBoundaryProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}


// --- Auto-wired by `tile init`: Tile Live Layer (remote config). appId injected. ---
// Read remote config anywhere below with the useLiveLayer hook (path, fallback):
//   import { useLiveLayer } from 'tile-live-layer';
//   const mode = useLiveLayer(['home', 'mode'], 'upcoming');
// Change it remotely (no rebuild) with:  tile live-layer set home.mode=latest
const tileLiveLayerOptions = {
  appId: 'ccd774a028fac80d06fbca41',
  env: 'preview',
  baseUrl: 'https://storage.googleapis.com/tile-livelayer-configs',
  bootstrap: tileBootstrap,
  // context: [], // optional category, e.g. ['in','mumbai']; omit for the base layer
};

function TileApp(props) {
  return (
    <LiveLayerProvider options={tileLiveLayerOptions}>
      <BaseApp {...props} />
    </LiveLayerProvider>
  );
}

// --- Auto-wired by `tile init`: Tile Push (OTA / code-push). Same appId. ---
export default TilePush.wrap({
  appId: 'ccd774a028fac80d06fbca41',
  apiUrl: 'https://ota.tile.dev',
  updateStrategy: 'fingerprint',
})(TileApp);
