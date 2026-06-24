import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Product } from "@apptile/tile-modules";
import { shopify } from "@apptile/tile-modules";
import { useTheme, useAnalytics, useShopify } from "@/core/providers";
import { Input, Text } from "@/components/ui";
import { ProductCard } from "@/components/shopify";
import { DEBOUNCE_DELAY } from "@/config";

export default function SearchScreen() {
  const { getThemeValue } = useTheme();
  const { screen, track } = useAnalytics();
  const { ready } = useShopify();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bg = getThemeValue("colors.background");
  const muted = getThemeValue("colors.muted");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    screen("Search");
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      runSearch(query);
    }, DEBOUNCE_DELAY);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, ready]);

  const runSearch = async (q: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = q
        ? await shopify.products.search(q, { first: 30 })
        : await shopify.products.list({ first: 30, sortKey: "BEST_SELLING" });
      setResults(res.nodes);
      if (q) track("search", { query: q, count: res.nodes.length });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={["top"]}>
      <View style={styles.header}>
        <Text variant="h1">Search</Text>
        <View style={{ marginTop: 12 }}>
          <Input
            placeholder="Search products"
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
          />
        </View>
      </View>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="small" color={getThemeValue("colors.primary")} />
        </View>
      ) : null}
      <FlatList
        data={results}
        keyExtractor={(p) => p.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={
          loading ? null : (
            <Text variant="body" style={{ padding: 20, color: muted }}>
              {error ? error : query ? `No results for “${query}”.` : "Start typing to search."}
            </Text>
          )
        }
        renderItem={({ item }) => (
          <View style={{ flex: 1 }}>
            <ProductCard product={item} />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20 },
  list: { paddingVertical: 12 },
  center: { padding: 8, alignItems: "center" },
});
