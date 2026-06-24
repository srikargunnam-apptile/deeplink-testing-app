import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  ThemeProvider,
  I18nProvider,
  AnalyticsProvider,
  ErrorBoundaryProvider,
  LiveLayerProvider,
} from '@/core/providers';
import { LIVE_LAYER_ENDPOINT, LIVE_LAYER_CODE_PUSH_ID } from '@/config';
import Navigation from './src/navigation';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ErrorBoundaryProvider>
          <LiveLayerProvider
            endpoint={LIVE_LAYER_ENDPOINT}
            codePushId={LIVE_LAYER_CODE_PUSH_ID}
          >
            <ThemeProvider>
              <I18nProvider>
                <AnalyticsProvider>
                  <Navigation />
                </AnalyticsProvider>
              </I18nProvider>
            </ThemeProvider>
          </LiveLayerProvider>
        </ErrorBoundaryProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
