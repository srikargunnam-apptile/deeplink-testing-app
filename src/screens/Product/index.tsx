import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import type {
  Product,
  ProductVariant,
} from "@apptile/tile-modules";
import { shopify } from "@apptile/tile-modules";
import { useTheme, useCart, useAnalytics, useShopify } from "@/core/providers";
import { Button, Spinner, Text } from "@/components/ui";
import { ProductCard } from "@/components/shopify";
import { formatMoney, stripHtml } from "@/core/utils";

type ProductRoute = RouteProp<{ Product: { handle: string } }, "Product">;

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function ProductScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<ProductRoute>();
  const handle = route.params?.handle;
  const { getThemeValue } = useTheme();
  const { addLine, loading: cartLoading } = useCart();
  const { screen, track } = useAnalytics();
  const { ready } = useShopify();

  const [product, setProduct] = useState<Product | null>(null);
  const [recommended, setRecommended] = useState<Product[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const colors = {
    bg: getThemeValue("colors.background"),
    text: getThemeValue("colors.text"),
    muted: getThemeValue("colors.muted"),
    surface: getThemeValue("colors.surface"),
    border: getThemeValue("colors.border"),
    primary: getThemeValue("colors.primary"),
  };

  useEffect(() => {
    if (!handle || !ready) return;
    let mounted = true;
    setLoading(true);
    (async () => {
      try {
        const p = await shopify.products.byHandle(handle);
        if (!mounted) return;
        setProduct(p);
        setSelectedVariant(p?.variants[0] ?? null);
        if (p) {
          screen("Product", { handle: p.handle });
          shopify.products.recommended(p.id).then((recs) => {
            if (mounted) setRecommended(recs.slice(0, 4));
          }).catch(() => {});
        }
      } catch (e) {
        Alert.alert("Could not load product", e instanceof Error ? e.message : String(e));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [handle, ready]);

  const description = useMemo(() => stripHtml(product?.descriptionHtml ?? product?.description ?? ""), [product]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
        <Spinner />
      </SafeAreaView>
    );
  }
  if (!product) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
        <View style={styles.center}>
          <Text variant="body">Product not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const onAdd = async () => {
    if (!selectedVariant) return;
    setAdding(true);
    try {
      await addLine({ merchandiseId: selectedVariant.id, quantity: 1 });
      track("add_to_cart", { variantId: selectedVariant.id, productId: product.id });
      Alert.alert("Added to cart", `${product.title} (${selectedVariant.title})`);
    } catch (e) {
      Alert.alert("Could not add to cart", e instanceof Error ? e.message : String(e));
    } finally {
      setAdding(false);
    }
  };

  const onSelectVariant = () => {
    navigation.navigate("VariantSelector", {
      productHandle: product.handle,
      selectedVariantId: selectedVariant?.id,
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={["bottom"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View>
          <FlatList
            data={product.images}
            keyExtractor={(img, idx) => `${img.url}-${idx}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) =>
              setActiveImageIndex(Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH))
            }
            renderItem={({ item }) => (
              <Image source={{ uri: item.url }} style={styles.heroImage} resizeMode="cover" />
            )}
          />
          {product.images.length > 1 && (
            <View style={styles.dotsRow}>
              {product.images.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    {
                      backgroundColor: i === activeImageIndex ? colors.primary : colors.border,
                    },
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        <View style={styles.body}>
          {product.vendor ? (
            <Text variant="caption" style={{ color: colors.muted }}>{product.vendor}</Text>
          ) : null}
          <Text variant="h2">{product.title}</Text>
          <View style={styles.priceRow}>
            <Text variant="h3">{formatMoney(selectedVariant?.price ?? product.priceRange.min)}</Text>
            {selectedVariant?.compareAtPrice ? (
              <Text
                variant="body"
                style={{
                  color: colors.muted,
                  textDecorationLine: "line-through",
                  marginLeft: 8,
                }}
              >
                {formatMoney(selectedVariant.compareAtPrice)}
              </Text>
            ) : null}
          </View>

          {product.options.length > 0 && (
            <Pressable
              onPress={onSelectVariant}
              style={[styles.optionsBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
            >
              <View style={{ flex: 1 }}>
                <Text variant="caption" style={{ color: colors.muted }}>Selected</Text>
                <Text variant="label">
                  {selectedVariant?.selectedOptions.map((o) => `${o.name}: ${o.value}`).join(" • ")
                    || selectedVariant?.title
                    || "Choose options"}
                </Text>
              </View>
              <Text variant="caption" style={{ color: colors.primary }}>Change</Text>
            </Pressable>
          )}

          {description ? (
            <View style={{ marginTop: 16 }}>
              <Text variant="label" style={{ marginBottom: 4 }}>Description</Text>
              <Text variant="body" style={{ color: colors.text }}>{description}</Text>
            </View>
          ) : null}

          {product.tags.length > 0 && (
            <View style={styles.tags}>
              {product.tags.map((t) => (
                <View key={t} style={[styles.tag, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text variant="caption">{t}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {recommended.length > 0 && (
          <View style={{ marginTop: 16 }}>
            <Text variant="h3" style={{ paddingHorizontal: 20, marginBottom: 8 }}>
              You might also like
            </Text>
            <FlatList
              horizontal
              data={recommended}
              keyExtractor={(p) => p.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
              renderItem={({ item }) => (
                <View style={{ width: 160 }}>
                  <ProductCard product={item} />
                </View>
              )}
            />
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Button
          onPress={onAdd}
          isLoading={adding || cartLoading}
          disabled={!selectedVariant?.availableForSale}
        >
          {selectedVariant?.availableForSale ? "Add to cart" : "Sold out"}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  heroImage: { width: SCREEN_WIDTH, height: SCREEN_WIDTH },
  dotsRow: {
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  body: { padding: 20, gap: 8 },
  priceRow: { flexDirection: "row", alignItems: "baseline", marginTop: 4 },
  optionsBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 8,
  },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 12 },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  footer: {
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
