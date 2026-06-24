import { useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Collection } from "@apptile/tile-modules";
import { shopify } from "@apptile/tile-modules";
import { useTheme, useAnalytics, useShopify } from "@/core/providers";
import { Spinner, Text } from "@/components/ui";
import { CollectionCard } from "@/components/shopify";

export default function CollectionsScreen() {
  const { getThemeValue } = useTheme();
  const { screen } = useAnalytics();
  const { ready } = useShopify();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bg = getThemeValue("colors.background");

  const load = async () => {
    setError(null);
    try {
      const res = await shopify.collections.list({ first: 50 });
      setCollections(res.nodes);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    screen("Collections");
  }, []);

  useEffect(() => {
    if (ready) load();
  }, [ready]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
        <Spinner />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={["top"]}>
      <View style={styles.headerRow}>
        <Text variant="h1">Shop</Text>
      </View>
      <FlatList
        data={collections}
        keyExtractor={(c) => c.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
        ListEmptyComponent={
          error ? (
            <Text variant="body" style={{ padding: 20 }}>{error}</Text>
          ) : (
            <Text variant="body" style={{ padding: 20 }}>No collections found.</Text>
          )
        }
        renderItem={({ item }) => <CollectionCard collection={item} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: { paddingHorizontal: 20, paddingVertical: 12 },
  list: { padding: 16 },
});
