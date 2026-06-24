import { useEffect } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, useAuth, useAnalytics } from "@/core/providers";
import { Button, Text } from "@/components/ui";

export default function AccountScreen() {
  const { getThemeValue } = useTheme();
  const { customer, logout } = useAuth();
  const navigation = useNavigation<any>();
  const { screen } = useAnalytics();

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
    screen("Account");
  }, []);

  if (!customer) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={["bottom"]}>
        <View style={[styles.content, { alignItems: "center", justifyContent: "center", flex: 1 }]}>
          <Ionicons name="person-circle-outline" size={64} color={colors.muted} />
          <Text variant="h3" style={{ marginTop: 12 }}>You’re not signed in</Text>
          <Text variant="body" style={{ color: colors.muted, marginTop: 4 }}>
            Sign in to see your orders and profile.
          </Text>
          <View style={{ marginTop: 16, width: "100%" }}>
            <Button onPress={() => navigation.navigate("AccountLogin")}>Sign in</Button>
            <View style={{ height: 8 }} />
            <Button variant="outline" onPress={() => navigation.navigate("AccountRegister")}>
              Create account
            </Button>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const onLogout = async () => {
    Alert.alert("Sign out?", "You can sign back in any time.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          await logout();
          navigation.popToTop?.();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.profileHeader, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: colors.primary },
            ]}
          >
            <Text variant="h2" style={{ color: getThemeValue("colors.onPrimary") }}>
              {(customer.firstName?.[0] ?? customer.email[0] ?? "?").toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="h3">
              {customer.firstName || customer.lastName
                ? `${customer.firstName ?? ""} ${customer.lastName ?? ""}`.trim()
                : "Welcome"}
            </Text>
            <Text variant="caption" style={{ color: colors.muted }}>{customer.email}</Text>
          </View>
        </View>

        <Section title="Shopping">
          <Row
            icon="receipt-outline"
            label="Orders"
            onPress={() => navigation.navigate("Orders")}
          />
          <Row
            icon="bag-handle-outline"
            label="Cart"
            onPress={() => navigation.navigate("Tabs", { screen: "Cart" })}
          />
        </Section>

        <Section title="Account">
          <Row
            icon="person-outline"
            label="Edit profile"
            onPress={() => navigation.navigate("UpdateProfile")}
          />
          <Row
            icon="key-outline"
            label="Reset password"
            onPress={() => navigation.navigate("ResetPassword")}
          />
        </Section>

        <Section title="Content">
          <Row
            icon="document-text-outline"
            label="Blogs"
            onPress={() => navigation.navigate("Blogs")}
          />
          <Row
            icon="settings-outline"
            label="Settings"
            onPress={() => navigation.navigate("Settings")}
          />
        </Section>

        <View style={{ marginTop: 24 }}>
          <Button variant="outline" onPress={onLogout}>
            <Text variant="label" style={{ color: colors.destructive }}>Sign out</Text>
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { getThemeValue } = useTheme();
  return (
    <View style={{ marginTop: 20 }}>
      <Text variant="caption" style={{ color: getThemeValue("colors.muted"), marginBottom: 6, marginLeft: 4 }}>
        {title.toUpperCase()}
      </Text>
      <View
        style={{
          backgroundColor: getThemeValue("colors.surface"),
          borderRadius: 12,
          overflow: "hidden",
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: getThemeValue("colors.border"),
        }}
      >
        {children}
      </View>
    </View>
  );
}

function Row({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  const { getThemeValue } = useTheme();
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <Ionicons name={icon} size={20} color={getThemeValue("colors.text")} />
      <Text variant="label" style={{ flex: 1 }}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={getThemeValue("colors.muted")} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
  },
});
