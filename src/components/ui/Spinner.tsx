import { ActivityIndicator, View, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "@/core/providers";

interface SpinnerProps {
  size?: "small" | "large";
  style?: ViewStyle;
}

export function Spinner({ size = "large", style }: SpinnerProps) {
  const { getThemeValue } = useTheme();
  return (
    <View style={[styles.center, style]}>
      <ActivityIndicator size={size} color={getThemeValue("colors.primary")} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
});
