import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import type {
  Product,
  ProductVariant,
} from "@apptile/tile-modules";
import { shopify } from "@apptile/tile-modules";
import { useTheme, useCart, useAnalytics, useShopify } from "@/core/providers";
import { Button, Spinner, Text } from "@/components/ui";
import { formatMoney } from "@/core/utils";

type VariantRoute = RouteProp<
  { VariantSelector: { productHandle: string; selectedVariantId?: string } },
  "VariantSelector"
>;

export default function VariantSelectorScreen() {
  const route = useRoute<VariantRoute>();
  const navigation = useNavigation<any>();
  const { productHandle, selectedVariantId } = route.params;
  const { getThemeValue } = useTheme();
  const { addLine, loading: cartLoading } = useCart();
  const { screen, track } = useAnalytics();
  const { ready } = useShopify();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [adding, setAdding] = useState(false);

  const colors = {
    bg: getThemeValue("colors.background"),
    text: getThemeValue("colors.text"),
    muted: getThemeValue("colors.muted"),
    surface: getThemeValue("colors.surface"),
    border: getThemeValue("colors.border"),
    primary: getThemeValue("colors.primary"),
    onPrimary: getThemeValue("colors.onPrimary"),
  };

  useEffect(() => {
    if (!ready) return;
    let mounted = true;
    setLoading(true);
    (async () => {
      try {
        const p = await shopify.products.byHandle(productHandle);
        if (!mounted) return;
        setProduct(p);
        if (p) {
          screen("VariantSelector", { handle: p.handle });
          // seed selection from passed-in variant or first available
          const seed = selectedVariantId
            ? p.variants.find((v) => v.id === selectedVariantId)
            : p.variants[0];
          if (seed) {
            const initial: Record<string, string> = {};
            for (const opt of seed.selectedOptions) initial[opt.name] = opt.value;
            setSelected(initial);
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [productHandle, ready]);

  const matchedVariant: ProductVariant | null = useMemo(() => {
    if (!product) return null;
    return (
      product.variants.find((v) =>
        v.selectedOptions.every((opt) => selected[opt.name] === opt.value)
      ) ?? null
    );
  }, [product, selected]);

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
          <Text>Product not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const onAdd = async () => {
    if (!matchedVariant) return;
    setAdding(true);
    try {
      await addLine({ merchandiseId: matchedVariant.id, quantity: 1 });
      track("add_to_cart", { variantId: matchedVariant.id, productId: product.id });
      navigation.goBack();
    } catch (e) {
      Alert.alert("Could not add to cart", e instanceof Error ? e.message : String(e));
    } finally {
      setAdding(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="caption" style={{ color: colors.muted }}>
          {product.vendor}
        </Text>
        <Text variant="h2">{product.title}</Text>
        <Text variant="h3" style={{ marginTop: 4 }}>
          {formatMoney(matchedVariant?.price ?? product.priceRange.min)}
        </Text>

        {product.options.map((opt) => (
          <View key={opt.id} style={{ marginTop: 18 }}>
            <Text variant="label" style={{ marginBottom: 8 }}>{opt.name}</Text>
            <View style={styles.choices}>
              {opt.values.map((value) => {
                const isSelected = selected[opt.name] === value;
                // disable if no variant is in stock for this combination
                const candidate = product.variants.find(
                  (v) =>
                    v.selectedOptions.some((o) => o.name === opt.name && o.value === value) &&
                    v.selectedOptions.every((o) =>
                      o.name === opt.name ? true : selected[o.name] === undefined || selected[o.name] === o.value
                    )
                );
                const disabled = candidate ? !candidate.availableForSale : false;
                return (
                  <Pressable
                    key={value}
                    onPress={() => setSelected((prev) => ({ ...prev, [opt.name]: value }))}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.surface,
                        borderColor: isSelected ? colors.primary : colors.border,
                        opacity: disabled ? 0.4 : 1,
                      },
                    ]}
                  >
                    <Text
                      variant="label"
                      style={{ color: isSelected ? colors.onPrimary : colors.text }}
                    >
                      {value}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}

        {matchedVariant && (
          <View style={{ marginTop: 24 }}>
            <Text variant="caption" style={{ color: colors.muted }}>
              SKU: {matchedVariant.sku ?? "—"}
            </Text>
            <Text variant="caption" style={{ color: colors.muted }}>
              {matchedVariant.availableForSale ? "In stock" : "Sold out"}
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Button onPress={onAdd} isLoading={adding || cartLoading} disabled={!matchedVariant?.availableForSale}>
          {matchedVariant?.availableForSale ? "Add to cart" : "Sold out"}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: 20 },
  choices: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  footer: { padding: 16, borderTopWidth: StyleSheet.hairlineWidth },
});
