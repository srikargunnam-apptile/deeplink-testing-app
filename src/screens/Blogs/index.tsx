import { useEffect, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import type { Blog } from "@apptile/tile-modules";
import { shopify } from "@apptile/tile-modules";
import { useTheme, useAnalytics, useShopify } from "@/core/providers";
import { Spinner, Text } from "@/components/ui";

export default function BlogsScreen() {
  const navigation = useNavigation<any>();
  const { getThemeValue } = useTheme();
  const { screen } = useAnalytics();
  const { ready } = useShopify();

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const colors = {
    bg: getThemeValue("colors.background"),
    muted: getThemeValue("colors.muted"),
    surface: getThemeValue("colors.surface"),
    border: getThemeValue("colors.border"),
  };

  const load = async () => {
    setError(null);
    try {
      const res = await shopify.blogs.list({ first: 50 });
      setBlogs(res.nodes);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    screen("Blogs");
  }, []);

  useEffect(() => {
    if (ready) load();
  }, [ready]);

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
        data={blogs}
        keyExtractor={(b) => b.id}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={
          <Text variant="body" style={{ padding: 20 }}>
            {error ?? "No blogs available."}
          </Text>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
          />
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              navigation.navigate("Blog", { handle: item.handle, title: item.title })
            }
            style={[
              styles.card,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text variant="label">{item.title}</Text>
              <Text variant="caption" style={{ color: colors.muted }}>
                Read latest articles
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
