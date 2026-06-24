import { useEffect, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import type { Order } from "@apptile/tile-modules";
import { shopify } from "@apptile/tile-modules";
import { useTheme, useAuth, useAnalytics, useShopify } from "@/core/providers";
import { Spinner, Text, Button } from "@/components/ui";
import { formatMoney } from "@/core/utils";

export default function OrdersScreen() {
  const navigation = useNavigation<any>();
  const { getThemeValue } = useTheme();
  const { accessToken, customer } = useAuth();
  const { screen } = useAnalytics();
  const { ready } = useShopify();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const colors = {
    bg: getThemeValue("colors.background"),
    muted: getThemeValue("colors.muted"),
    surface: getThemeValue("colors.surface"),
    border: getThemeValue("colors.border"),
    primary: getThemeValue("colors.primary"),
    success: getThemeValue("colors.success"),
    warning: getThemeValue("colors.warning"),
  };

  const load = async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const res = await shopify.customer.orders(accessToken, { first: 50 });
      setOrders(res.nodes);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    screen("Orders");
  }, []);

  useEffect(() => {
    if (ready) load();
  }, [accessToken, ready]);

  if (!accessToken || !customer) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={["bottom"]}>
        <View style={styles.center}>
          <Ionicons name="lock-closed-outline" size={48} color={colors.muted} />
          <Text variant="h3" style={{ marginTop: 12 }}>Sign in to see your orders</Text>
          <View style={{ marginTop: 16 }}>
            <Button onPress={() => navigation.navigate("AccountLogin")}>Sign In</Button>
          </View>
        </View>
      </SafeAreaView>
    );
  }

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
        data={orders}
        keyExtractor={(o) => o.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={
          error ? (
            <Text variant="body" style={{ padding: 20 }}>{error}</Text>
          ) : (
            <View style={styles.center}>
              <Ionicons name="receipt-outline" size={48} color={colors.muted} />
              <Text variant="h3" style={{ marginTop: 12 }}>No orders yet</Text>
              <Text variant="body" style={{ color: colors.muted, marginTop: 4 }}>
                When you place an order it’ll show up here.
              </Text>
            </View>
          )
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate("OrderDetail", { orderId: item.id })}
            style={[
              styles.card,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text variant="label">{item.name}</Text>
              <Text variant="label">{formatMoney(item.totalPrice)}</Text>
            </View>
            <Text variant="caption" style={{ color: colors.muted, marginTop: 4 }}>
              {new Date(item.processedAt).toLocaleDateString()}
            </Text>
            <View style={styles.statusRow}>
              <StatusPill
                label={item.fulfillmentStatus ?? "Pending"}
                color={
                  item.fulfillmentStatus === "FULFILLED" ? colors.success : colors.warning
                }
              />
              <StatusPill label={item.financialStatus ?? "—"} color={colors.primary} />
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

function StatusPill({ label, color }: { label: string; color: string }) {
  return (
    <View style={[styles.pill, { borderColor: color }]}>
      <Text variant="caption" style={{ color }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  card: {
    padding: 14,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  statusRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  pill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
});
