// Home screen - demonstrates theme, i18n, and analytics usage
import { useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, useI18n, useAnalytics } from "@/core/providers";
import { APP_NAME, APP_VERSION } from "@/config";

export default function HomeScreen() {
  const navigation = useNavigation();
  const { effectiveTheme, toggleTheme, getThemeValue } = useTheme();
  const { t, locale, formatDate, formatCurrency } = useI18n();
  const { track, screen } = useAnalytics();

  // Track screen view on mount
  useEffect(() => {
    screen("Home");
  }, []);

  const handleTrackEvent = () => {
    track("button_pressed", { button: "demo_button", screen: "home" });
  };

  // Pulled from THEME via getThemeValue so the active mode (light/dark)
  // resolves automatically. Edit values in ThemeProvider/themeConstants.
  const colors = {
    bg: getThemeValue("colors.background"),
    text: getThemeValue("colors.text"),
    muted: getThemeValue("colors.muted"),
    card: getThemeValue("colors.surface"),
    accent: getThemeValue("colors.primary"),
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>{APP_NAME}</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              {t("settings.version", { version: APP_VERSION })}
            </Text>
          </View>
          <Pressable
            style={[styles.settingsButton, { backgroundColor: colors.card }]}
            onPress={() => navigation.navigate("Settings" as never)}
          >
            <Ionicons name="settings-outline" size={24} color={colors.text} />
          </Pressable>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            🌍 {t("settings.language")}: {locale.toUpperCase()}
          </Text>
          <Text style={[styles.cardText, { color: colors.muted }]}>
            {t("greeting", { name: "Developer" })}
          </Text>
          <Text style={[styles.cardText, { color: colors.muted }]}>
            {formatDate(new Date())} • {formatCurrency(99.99)}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            🎨 Theme: {effectiveTheme}
          </Text>
          <Pressable
            style={[styles.button, { backgroundColor: colors.accent }]}
            onPress={toggleTheme}
          >
            <Text style={styles.buttonText}>Toggle Theme</Text>
          </Pressable>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            📊 Analytics
          </Text>
          <Pressable
            style={[styles.button, { backgroundColor: colors.accent }]}
            onPress={handleTrackEvent}
          >
            <Text style={styles.buttonText}>Track Event</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  settingsButton: {
    padding: 10,
    borderRadius: 10,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    marginBottom: 4,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
