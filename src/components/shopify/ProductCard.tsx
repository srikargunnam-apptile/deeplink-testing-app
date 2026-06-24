import { Image, Pressable, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { Product } from "@apptile/tile-modules";
import { Text } from "@/components/ui";
import { useTheme } from "@/core/providers";
import { formatMoney } from "@/core/utils";

interface ProductCardProps {
  product: Product;
  width?: number | string;
}

export function ProductCard({ product, width }: ProductCardProps) {
  const navigation = useNavigation<any>();
  const { getThemeValue } = useTheme();
  const cardBg = getThemeValue("colors.surface");
  const border = getThemeValue("colors.border");
  const muted = getThemeValue("colors.muted");

  const image = product.featuredImage?.url ?? product.images[0]?.url;
  const onSale =
    product.compareAtPriceRange &&
    Number(product.compareAtPriceRange.min.amount) > Number(product.priceRange.min.amount);

  return (
    <Pressable
      onPress={() => navigation.navigate("Product", { handle: product.handle })}
      style={[styles.card, { backgroundColor: cardBg, borderColor: border, width: width as any }]}
    >
      <View style={styles.imageWrap}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, { backgroundColor: border }]} />
        )}
        {!product.availableForSale && (
          <View style={styles.soldOutTag}>
            <Text variant="caption" style={styles.tagText}>SOLD OUT</Text>
          </View>
        )}
        {onSale && product.availableForSale && (
          <View style={styles.saleTag}>
            <Text variant="caption" style={styles.tagText}>SALE</Text>
          </View>
        )}
      </View>
      <View style={styles.body}>
        <Text variant="label" numberOfLines={2}>{product.title}</Text>
        {product.vendor ? (
          <Text variant="caption" style={{ color: muted }}>{product.vendor}</Text>
        ) : null}
        <View style={styles.priceRow}>
          <Text variant="body">{formatMoney(product.priceRange.min)}</Text>
          {onSale && (
            <Text
              variant="caption"
              style={{
                color: muted,
                textDecorationLine: "line-through",
                marginLeft: 8,
              }}
            >
              {formatMoney(product.compareAtPriceRange!.min)}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
  },
  imageWrap: {
    aspectRatio: 1,
    width: "100%",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  body: {
    padding: 10,
    gap: 4,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  soldOutTag: {
    position: "absolute",
    left: 8,
    top: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  saleTag: {
    position: "absolute",
    left: 8,
    top: 8,
    backgroundColor: "#DC2626",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    color: "#fff",
    fontWeight: "700",
  },
});
