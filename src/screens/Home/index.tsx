import { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  RefreshControl,
  Image,
  Pressable,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import type {
  Collection,
  Product,
} from "@apptile/tile-modules";
import { shopify } from "@apptile/tile-modules";
import { useTheme, useAnalytics, useAuth, useShopify } from "@/core/providers";
import { Text, Spinner } from "@/components/ui";
import { ProductCard, CollectionCard } from "@/components/shopify";
import { APP_NAME } from "@/config";

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { getThemeValue } = useTheme();
  const { screen } = useAnalytics();
  const { customer } = useAuth();
  const { ready } = useShopify();

  const [collections, setCollections] = useState<Collection[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const colors = {
    bg: getThemeValue("colors.background"),
    text: getThemeValue("colors.text"),
    muted: getThemeValue("colors.muted"),
    surface: getThemeValue("colors.surface"),
    primary: getThemeValue("colors.primary"),
    onPrimary: getThemeValue("colors.onPrimary"),
  };

  const load = async () => {
    setError(null);
    try {
      const [colRes, prodRes] = await Promise.all([
        shopify.collections.list({ first: 6 }),
        shopify.products.list({ first: 8, sortKey: "BEST_SELLING" }),
      ]);
      setCollections(colRes.nodes);
      setFeatured(prodRes.nodes);
    } catch (e) {
      console.error("[Home] load failed", e);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    screen("Home");
  }, []);

  useEffect(() => {
    if (ready) load();
  }, [ready]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
        <Spinner />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={["top"]}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text variant="caption" style={{ color: colors.muted }}>
              {customer ? `Welcome back, ${customer.firstName ?? ""}` : "Welcome"}
            </Text>
            <Text variant="h1">{APP_NAME}</Text>
          </View>
          <Pressable
            accessibilityLabel="Account"
            onPress={() => navigation.navigate(customer ? "Account" : "AccountLogin")}
            style={[styles.iconBtn, { backgroundColor: colors.surface }]}
          >
            <Ionicons name="person-outline" size={22} color={colors.text} />
          </Pressable>
        </View>

        {error ? (
          <View style={[styles.errorBanner, { backgroundColor: "#FEE2E2" }]}>
            <Text variant="caption" style={{ color: "#991B1B" }}>
              {error}
            </Text>
          </View>
        ) : null}

        <Pressable
          onPress={() => navigation.navigate("Collections")}
          style={[styles.hero, { backgroundColor: colors.primary }]}
        >
          <View style={styles.heroBody}>
            <Text variant="caption" style={{ color: colors.onPrimary, opacity: 0.85 }}>
              SHOP NOW
            </Text>
            <Text variant="h2" style={{ color: colors.onPrimary }}>
              Explore the new collection
            </Text>
            <View style={styles.heroCTA}>
              <Text variant="label" style={{ color: colors.onPrimary }}>
                Browse all
              </Text>
              <Ionicons name="arrow-forward" size={18} color={colors.onPrimary} />
            </View>
          </View>
        </Pressable>

        {collections.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text variant="h3">Shop by collection</Text>
              <Pressable onPress={() => navigation.navigate("Collections")}>
                <Text variant="caption" style={{ color: colors.primary }}>See all</Text>
              </Pressable>
            </View>
            <FlatList
              horizontal
              data={collections}
              keyExtractor={(c) => c.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
              renderItem={({ item }) => (
                <View style={{ width: 220 }}>
                  <CollectionCard collection={item} />
                </View>
              )}
            />
          </View>
        )}

        {featured.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text variant="h3">Featured</Text>
              <Pressable onPress={() => navigation.navigate("Search")}>
                <Text variant="caption" style={{ color: colors.primary }}>See all</Text>
              </Pressable>
            </View>
            <View style={styles.grid}>
              {featured.map((p) => (
                <View key={p.id} style={styles.gridItem}>
                  <ProductCard product={p} />
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.linkRow}>
            <Pressable
              style={[styles.linkCard, { backgroundColor: colors.surface }]}
              onPress={() => navigation.navigate("Blogs")}
            >
              <Ionicons name="document-text-outline" size={24} color={colors.primary} />
              <Text variant="label">Read the journal</Text>
            </Pressable>
            <Pressable
              style={[styles.linkCard, { backgroundColor: colors.surface }]}
              onPress={() => navigation.navigate(customer ? "Orders" : "AccountLogin")}
            >
              <Ionicons name="receipt-outline" size={24} color={colors.primary} />
              <Text variant="label">{customer ? "Your orders" : "Sign in"}</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 40 },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  errorBanner: {
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  hero: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: "hidden",
    minHeight: 160,
  },
  heroBody: {
    padding: 24,
    gap: 6,
  },
  heroCTA: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 14,
  },
  gridItem: {
    width: "50%",
    padding: 6,
  },
  linkRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
  },
  linkCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
});
