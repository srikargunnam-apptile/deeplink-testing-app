import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import type { Article } from "@apptile/tile-modules";
import { shopify } from "@apptile/tile-modules";
import { useTheme, useAnalytics, useShopify } from "@/core/providers";
import { Spinner, Text, Button } from "@/components/ui";
import { stripHtml } from "@/core/utils";

type BlogRoute = RouteProp<{ Blog: { handle: string; title?: string } }, "Blog">;

export default function BlogScreen() {
  const route = useRoute<BlogRoute>();
  const navigation = useNavigation<any>();
  const { handle, title } = route.params ?? {};
  const { getThemeValue } = useTheme();
  const { screen } = useAnalytics();
  const { ready } = useShopify();

  const [articles, setArticles] = useState<Article[]>([]);
  const [active, setActive] = useState<Article | null>(null);
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
    if (!handle) return;
    setError(null);
    try {
      const res = await shopify.blogs.articles(handle, { first: 50 });
      setArticles(res.nodes);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    screen("Blog", { handle });
    if (title) navigation.setOptions?.({ title });
  }, [handle]);

  useEffect(() => {
    if (ready) load();
  }, [handle, ready]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
        <Spinner />
      </SafeAreaView>
    );
  }

  if (active) {
    const body = stripHtml(active.contentHtml || active.content);
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={["bottom"]}>
        <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
          {active.image?.url ? (
            <Image source={{ uri: active.image.url }} style={styles.heroImage} resizeMode="cover" />
          ) : null}
          <Text variant="h2">{active.title}</Text>
          <Text variant="caption" style={{ color: colors.muted }}>
            {new Date(active.publishedAt).toLocaleDateString()}
            {active.author ? ` • ${active.author.name}` : ""}
          </Text>
          <Text variant="body" style={{ marginTop: 8 }}>{body}</Text>
          <View style={{ marginTop: 16 }}>
            <Button variant="outline" onPress={() => setActive(null)}>Back to articles</Button>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={["bottom"]}>
      <FlatList
        data={articles}
        keyExtractor={(a) => a.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
          />
        }
        ListEmptyComponent={
          <Text variant="body" style={{ padding: 20 }}>
            {error ?? "No articles in this blog yet."}
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setActive(item)}
            style={[
              styles.card,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            {item.image?.url ? (
              <Image source={{ uri: item.image.url }} style={styles.cardImage} resizeMode="cover" />
            ) : null}
            <View style={{ padding: 14, gap: 4 }}>
              <Text variant="label" numberOfLines={2}>{item.title}</Text>
              <Text variant="caption" style={{ color: colors.muted }}>
                {new Date(item.publishedAt).toLocaleDateString()}
                {item.author ? ` • ${item.author.name}` : ""}
              </Text>
              {item.excerpt ? (
                <Text variant="body" style={{ color: colors.muted }} numberOfLines={3}>
                  {stripHtml(item.excerpt)}
                </Text>
              ) : null}
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
  },
  cardImage: { width: "100%", aspectRatio: 16 / 9 },
  heroImage: { width: "100%", aspectRatio: 16 / 9, borderRadius: 12 },
});
