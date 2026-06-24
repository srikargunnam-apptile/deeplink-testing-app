import { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as WebBrowser from "expo-web-browser";
import {
  useTheme,
  useCart,
  useAuth,
  useAnalytics,
} from "@/core/providers";
import { Text, Button, Input, Spinner } from "@/components/ui";
import { formatMoney } from "@/core/utils";

export default function CartScreen() {
  const navigation = useNavigation<any>();
  const { getThemeValue } = useTheme();
  const { cart, loading, updateLine, removeLine, applyDiscountCodes, refresh } = useCart();
  const { customer } = useAuth();
  const { screen, track } = useAnalytics();
  const [discountInput, setDiscountInput] = useState("");
  const [checkingOut, setCheckingOut] = useState(false);

  const colors = {
    bg: getThemeValue("colors.background"),
    text: getThemeValue("colors.text"),
    muted: getThemeValue("colors.muted"),
    surface: getThemeValue("colors.surface"),
    border: getThemeValue("colors.border"),
    primary: getThemeValue("colors.primary"),
    destructive: getThemeValue("colors.destructive"),
  };

  useEffect(() => {
    screen("Cart");
  }, []);

  const onCheckout = async () => {
    if (!cart?.checkoutUrl) return;
    setCheckingOut(true);
    track("begin_checkout", { cartId: cart.id, total: cart.cost.totalAmount.amount });
    try {
      await WebBrowser.openBrowserAsync(cart.checkoutUrl);
    } catch (e) {
      Alert.alert("Could not open checkout", e instanceof Error ? e.message : String(e));
    } finally {
      setCheckingOut(false);
      refresh();
    }
  };

  const onApplyDiscount = async () => {
    const code = discountInput.trim();
    if (!code) return;
    try {
      await applyDiscountCodes([code]);
      setDiscountInput("");
    } catch (e) {
      Alert.alert("Discount failed", e instanceof Error ? e.message : String(e));
    }
  };

  if (loading && !cart) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
        <Spinner />
      </SafeAreaView>
    );
  }

  const lines = cart?.lines ?? [];

  if (lines.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={["top"]}>
        <View style={styles.headerRow}>
          <Text variant="h1">Cart</Text>
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="bag-outline" size={64} color={colors.muted} />
          <Text variant="h3" style={{ marginTop: 12 }}>Your cart is empty</Text>
          <Text variant="body" style={{ color: colors.muted, marginTop: 4, textAlign: "center" }}>
            Add a few favorites to get started.
          </Text>
          <View style={{ marginTop: 16 }}>
            <Button onPress={() => navigation.navigate("Collections")}>Continue shopping</Button>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={["top"]}>
      <View style={styles.headerRow}>
        <Text variant="h1">Cart</Text>
        <Text variant="caption" style={{ color: colors.muted }}>
          {cart?.totalQuantity ?? 0} item{(cart?.totalQuantity ?? 0) === 1 ? "" : "s"}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {lines.map((line) => {
          const v = line.merchandise;
          const image = v.image?.url;
          return (
            <View
              key={line.id}
              style={[styles.lineRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={styles.thumb}>
                {image ? (
                  <Image source={{ uri: image }} style={styles.thumbImg} />
                ) : (
                  <View style={[styles.thumbImg, { backgroundColor: colors.border }]} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="label" numberOfLines={2}>{v.title}</Text>
                {v.selectedOptions.length > 0 && (
                  <Text variant="caption" style={{ color: colors.muted }}>
                    {v.selectedOptions.map((o) => `${o.name}: ${o.value}`).join(" • ")}
                  </Text>
                )}
                <Text variant="body" style={{ marginTop: 4 }}>
                  {formatMoney(line.cost.totalAmount)}
                </Text>
                <View style={[styles.qtyRow]}>
                  <View style={[styles.stepper, { borderColor: colors.border }]}>
                    <Pressable
                      onPress={() => updateLine(line.id, Math.max(0, line.quantity - 1))}
                      style={styles.stepBtn}
                      accessibilityLabel="Decrease quantity"
                    >
                      <Ionicons name="remove" size={16} color={colors.text} />
                    </Pressable>
                    <Text variant="label" style={{ minWidth: 24, textAlign: "center" }}>
                      {line.quantity}
                    </Text>
                    <Pressable
                      onPress={() => updateLine(line.id, line.quantity + 1)}
                      style={styles.stepBtn}
                      accessibilityLabel="Increase quantity"
                    >
                      <Ionicons name="add" size={16} color={colors.text} />
                    </Pressable>
                  </View>
                  <Pressable
                    onPress={() => removeLine(line.id)}
                    accessibilityLabel="Remove item"
                    style={{ marginLeft: 12 }}
                  >
                    <Ionicons name="trash-outline" size={20} color={colors.destructive} />
                  </Pressable>
                </View>
              </View>
            </View>
          );
        })}

        <View style={[styles.section, { borderColor: colors.border }]}>
          <Text variant="label" style={{ marginBottom: 8 }}>Discount code</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Input
                placeholder="Enter code"
                value={discountInput}
                onChangeText={setDiscountInput}
                autoCapitalize="characters"
              />
            </View>
            <Button variant="outline" onPress={onApplyDiscount}>Apply</Button>
          </View>
          {(cart?.discountCodes ?? []).map((d) => (
            <Text
              key={d.code}
              variant="caption"
              style={{ color: d.applicable ? colors.primary : colors.destructive, marginTop: 6 }}
            >
              {d.code} {d.applicable ? "applied" : "not applicable"}
            </Text>
          ))}
        </View>

        <View style={[styles.section, { borderColor: colors.border }]}>
          <Row label="Subtotal" value={formatMoney(cart?.cost.subtotalAmount ?? null)} />
          {cart?.cost.totalTaxAmount ? (
            <Row label="Tax" value={formatMoney(cart.cost.totalTaxAmount)} />
          ) : null}
          <Row label="Total" value={formatMoney(cart?.cost.totalAmount ?? null)} bold />
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {!customer && (
          <Pressable onPress={() => navigation.navigate("AccountLogin")} style={{ marginBottom: 8 }}>
            <Text variant="caption" style={{ color: colors.primary }}>
              Sign in for a faster checkout
            </Text>
          </Pressable>
        )}
        <Button onPress={onCheckout} isLoading={checkingOut}>
          Checkout • {formatMoney(cart?.cost.totalAmount ?? null)}
        </Button>
      </View>
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
  headerRow: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  content: { padding: 16, gap: 12, paddingBottom: 32 },
  lineRow: {
    flexDirection: "row",
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  thumb: { width: 88, height: 88, borderRadius: 8, overflow: "hidden" },
  thumbImg: { width: "100%", height: "100%" },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    padding: 4,
  },
  stepBtn: { padding: 4 },
  section: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    padding: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  footer: {
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
