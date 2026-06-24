import { useEffect, useState } from "react";
import { Image, Linking, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import type { Order } from "@apptile/tile-modules";
import { shopify } from "@apptile/tile-modules";
import { useTheme, useAuth, useAnalytics, useShopify } from "@/core/providers";
import { Spinner, Text, Button } from "@/components/ui";
import { formatMoney } from "@/core/utils";

type OrderDetailRoute = RouteProp<{ OrderDetail: { orderId: string } }, "OrderDetail">;

export default function OrderDetailScreen() {
  const route = useRoute<OrderDetailRoute>();
  const navigation = useNavigation<any>();
  const { orderId } = route.params;
  const { getThemeValue } = useTheme();
  const { accessToken } = useAuth();
  const { screen } = useAnalytics();
  const { ready } = useShopify();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const colors = {
    bg: getThemeValue("colors.background"),
    muted: getThemeValue("colors.muted"),
    surface: getThemeValue("colors.surface"),
    border: getThemeValue("colors.border"),
    primary: getThemeValue("colors.primary"),
  };

  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    if (!ready) return;
    let mounted = true;
    setLoading(true);
    (async () => {
      try {
        const o = await shopify.customer.orderById(accessToken, orderId);
        if (!mounted) return;
        setOrder(o);
        if (o) {
          screen("OrderDetail", { orderName: o.name });
          navigation.setOptions?.({ title: o.name });
        }
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [orderId, accessToken, ready]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
        <Spinner />
      </SafeAreaView>
    );
  }
  if (!order) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
        <View style={styles.center}>
          <Text>{error ?? "Order not found."}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={["bottom"]}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
        <View>
          <Text variant="h2">{order.name}</Text>
          <Text variant="caption" style={{ color: colors.muted }}>
            Placed {new Date(order.processedAt).toLocaleString()}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Row label="Status" value={order.fulfillmentStatus ?? "Pending"} />
          <Row label="Payment" value={order.financialStatus ?? "—"} />
          <Row label="Email" value={order.email ?? "—"} />
        </View>

        <View>
          <Text variant="label" style={{ marginBottom: 8 }}>Items</Text>
          {order.lineItems.map((line, idx) => (
            <View
              key={`${line.title}-${idx}`}
              style={[
                styles.lineRow,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View style={styles.thumb}>
                {line.variant?.image?.url ? (
                  <Image source={{ uri: line.variant.image.url }} style={styles.thumbImg} />
                ) : (
                  <View style={[styles.thumbImg, { backgroundColor: colors.border }]} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="label" numberOfLines={2}>{line.title}</Text>
                {line.variant?.selectedOptions?.length ? (
                  <Text variant="caption" style={{ color: colors.muted }}>
                    {line.variant.selectedOptions.map((o) => `${o.name}: ${o.value}`).join(" • ")}
                  </Text>
                ) : null}
                <Text variant="caption" style={{ color: colors.muted }}>
                  Qty {line.quantity}
                </Text>
              </View>
              <Text variant="label">{formatMoney(line.discountedTotalPrice)}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {order.subtotalPrice && <Row label="Subtotal" value={formatMoney(order.subtotalPrice)} />}
          <Row label="Shipping" value={formatMoney(order.totalShippingPrice)} />
          {order.totalTax && <Row label="Tax" value={formatMoney(order.totalTax)} />}
          <Row label="Total" value={formatMoney(order.totalPrice)} bold />
        </View>

        {order.shippingAddress && (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text variant="label" style={{ marginBottom: 6 }}>Shipping address</Text>
            <Text variant="body">
              {[order.shippingAddress.firstName, order.shippingAddress.lastName].filter(Boolean).join(" ")}
            </Text>
            <Text variant="body">{order.shippingAddress.address1}</Text>
            {order.shippingAddress.address2 ? (
              <Text variant="body">{order.shippingAddress.address2}</Text>
            ) : null}
            <Text variant="body">
              {order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.zip}
            </Text>
            <Text variant="body">{order.shippingAddress.country}</Text>
          </View>
        )}

        {order.statusUrl ? (
          <Button onPress={() => Linking.openURL(order.statusUrl)} variant="outline">
            View order status online
          </Button>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.row}>
      <Text variant={bold ? "label" : "body"}>{label}</Text>
      <Text variant={bold ? "label" : "body"}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  card: {
    padding: 14,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  lineRow: {
    flexDirection: "row",
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
    alignItems: "center",
  },
  thumb: { width: 56, height: 56, borderRadius: 8, overflow: "hidden" },
  thumbImg: { width: "100%", height: "100%" },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
});
