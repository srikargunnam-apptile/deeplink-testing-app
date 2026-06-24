// Settings screen - theme and language preferences
import { useEffect } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { useTheme, useI18n, useAnalytics, type Theme } from "@/core/providers";
import { type Locale } from "@/core/i18n";
import { SUPPORTED_LOCALES } from "@/config";

export default function SettingsScreen() {
  const { theme, setTheme, getThemeValue } = useTheme();
  const { t, locale, setLocale } = useI18n();
  const { screen, track } = useAnalytics();

  // Track screen view on mount
  useEffect(() => {
    screen("Settings");
  }, []);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    track("theme_changed", { theme: newTheme });
  };

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale);
    track("language_changed", { language: newLocale });
  };

  // Pulled from THEME via getThemeValue so the active mode (light/dark)
  // resolves automatically. Edit values in ThemeProvider/themeConstants.
  const colors = {
    bg: getThemeValue("colors.background"),
    text: getThemeValue("colors.text"),
    muted: getThemeValue("colors.muted"),
    card: getThemeValue("colors.surface"),
    selected: getThemeValue("colors.elevated"),
    accent: getThemeValue("colors.primary"),
  };

  const themeOptions: { value: Theme; label: string; icon: string }[] = [
    { value: "light", label: "Light", icon: "☀️" },
    { value: "dark", label: "Dark", icon: "🌙" },
    { value: "system", label: "System", icon: "⚙️" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView style={styles.content}>
        <Text style={[styles.sectionTitle, { color: colors.muted }]}>
          {t("settings.theme")}
        </Text>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          {themeOptions.map((option) => (
            <Pressable
              key={option.value}
              style={[
                styles.option,
                theme === option.value && { backgroundColor: colors.selected },
              ]}
              onPress={() => handleThemeChange(option.value)}
            >
              <Text style={[styles.optionIcon]}>{option.icon}</Text>
              <Text style={[styles.optionText, { color: colors.text }]}>
                {option.label}
              </Text>
              {theme === option.value && (
                <Text style={[styles.checkmark, { color: colors.accent }]}>✓</Text>
              )}
            </Pressable>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.muted }]}>
          {t("settings.language")}
        </Text>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          {(Object.entries(SUPPORTED_LOCALES) as [Locale, string][]).map(
            ([code, name]) => (
              <Pressable
                key={code}
                style={[
                  styles.option,
                  locale === code && { backgroundColor: colors.selected },
                ]}
                onPress={() => handleLocaleChange(code)}
              >
                <Text style={[styles.optionText, { color: colors.text }]}>
                  {name}
                </Text>
                {locale === code && (
                  <Text style={[styles.checkmark, { color: colors.accent }]}>✓</Text>
                )}
              </Pressable>
            )
          )}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.muted }]}>
          {t("settings.about")}
        </Text>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.aboutText, { color: colors.muted }]}>
            Minimal Base Template{"\n"}
            Built with Expo + React Native{"\n"}
            Featuring: Theme, I18n, Analytics
          </Text>
        </View>
      </ScrollView>
    </View>
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
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    borderRadius: 12,
    marginBottom: 24,
    overflow: "hidden",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  optionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    flex: 1,
  },
  checkmark: {
    fontSize: 16,
    fontWeight: "bold",
  },
  aboutText: {
    padding: 16,
    fontSize: 14,
    lineHeight: 22,
  },
});
