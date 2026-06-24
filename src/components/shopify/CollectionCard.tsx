import { Image, Pressable, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { Collection } from "@apptile/tile-modules";
import { Text } from "@/components/ui";
import { useTheme } from "@/core/providers";

export function CollectionCard({ collection }: { collection: Collection }) {
  const navigation = useNavigation<any>();
  const { getThemeValue } = useTheme();
  const cardBg = getThemeValue("colors.surface");
  const border = getThemeValue("colors.border");
  const muted = getThemeValue("colors.muted");

  const image = collection.image?.url;
  return (
    <Pressable
      onPress={() => navigation.navigate("Collection", { handle: collection.handle })}
      style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}
    >
      {image ? (
        <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={[styles.image, { backgroundColor: border }]} />
      )}
      <View style={styles.body}>
        <Text variant="label" numberOfLines={1}>{collection.title}</Text>
        {collection.description ? (
          <Text variant="caption" style={{ color: muted }} numberOfLines={2}>
            {collection.description}
          </Text>
        ) : null}
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
  image: {
    width: "100%",
    aspectRatio: 16 / 9,
  },
  body: {
    padding: 12,
    gap: 4,
  },
});
