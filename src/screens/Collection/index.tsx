import { useEffect, useState } from "react";
import { FlatList, StyleSheet, View, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import type {
  Collection,
  Product,
} from "@apptile/tile-modules";
import { shopify } from "@apptile/tile-modules";
import { useTheme, useAnalytics, useShopify } from "@/core/providers";
import { Spinner, Text } from "@/components/ui";
import { ProductCard } from "@/components/shopify";

type CollectionRoute = RouteProp<{ Collection: { handle: string } }, "Collection">;

export default function CollectionScreen() {
  const route = useRoute<CollectionRoute>();
  const navigation = useNavigation<any>();
  const handle = route.params?.handle;
  const { getThemeValue } = useTheme();
  const { screen } = useAnalytics();
  const { ready } = useShopify();

  const [collection, setCollection] = useState<Collection | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const colors = {
    bg: getThemeValue("colors.background"),
    muted: getThemeValue("colors.muted"),
  };

  useEffect(() => {
    if (!handle || !ready) return;
    let mounted = true;
    setLoading(true);
    (async () => {
      try {
        const [c, productsRes] = await Promise.all([
          shopify.collections.byHandle(handle),
          shopify.collections.products(handle, { first: 50 }),
        ]);
        if (!mounted) return;
        setCollection(c);
        setProducts(productsRes.nodes);
        if (c) {
          screen("Collection", { handle: c.handle });
          navigation.setOptions?.({ title: c.title });
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [handle, ready]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
        <Spinner />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={["bottom"]}>
      <FlatList
        data={products}
        keyExtractor={(p) => p.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListHeaderComponent={
          <View>
            {collection?.image?.url ? (
              <Image source={{ uri: collection.image.url }} style={styles.banner} resizeMode="cover" />
            ) : null}
            <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
              <Text variant="h2">{collection?.title ?? "Collection"}</Text>
              {collection?.description ? (
                <Text variant="body" style={{ color: colors.muted, marginTop: 6 }}>
                  {collection.description}
                </Text>
              ) : null}
              <Text variant="caption" style={{ color: colors.muted, marginTop: 8 }}>
                {products.length} product{products.length === 1 ? "" : "s"}
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={<Text variant="body" style={{ padding: 20 }}>No products in this collection.</Text>}
        contentContainerStyle={{ paddingBottom: 24 }}
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
  banner: { width: "100%", aspectRatio: 16 / 9 },
});
