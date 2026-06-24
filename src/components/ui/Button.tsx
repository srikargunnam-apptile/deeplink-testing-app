import React from "react";
import {
  Pressable,
  Text,
  ActivityIndicator,
  PressableProps,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import { useTheme } from "@/core/providers";

/**
 * Button Component
 *
 * Native StyleSheet button with variants. Colors come from the active
 * theme via `getThemeValue` so light/dark switches in ThemeProvider
 * automatically restyle every Button.
 */

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends PressableProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  children: React.ReactNode;
}

const sizeStyles: Record<ButtonSize, { container: ViewStyle; text: TextStyle }> = {
  sm: { container: { paddingHorizontal: 12, paddingVertical: 8 }, text: { fontSize: 14 } },
  md: { container: { paddingHorizontal: 16, paddingVertical: 12 }, text: { fontSize: 16 } },
  lg: { container: { paddingHorizontal: 24, paddingVertical: 16 }, text: { fontSize: 18 } },
};

/** Map a variant to `{ container, text }` style fragments using the
 *  current theme's resolved color values. */
function getVariantStyles(
  variant: ButtonVariant,
  getThemeValue: (path: string) => any,
): { container: ViewStyle; text: TextStyle } {
  switch (variant) {
    case "primary":
      return {
        container: { backgroundColor: getThemeValue("colors.primary") },
        text: { color: getThemeValue("colors.onPrimary") },
      };
    case "secondary":
      return {
        container: { backgroundColor: getThemeValue("colors.secondary") },
        text: { color: getThemeValue("colors.onPrimary") },
      };
    case "outline":
      return {
        container: {
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: getThemeValue("colors.border"),
        },
        text: { color: getThemeValue("colors.text") },
      };
    case "ghost":
      return {
        container: { backgroundColor: "transparent" },
        text: { color: getThemeValue("colors.text") },
      };
  }
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  children,
  style,
  ...props
}: ButtonProps) {
  const { getThemeValue } = useTheme();
  const variantStyle = getVariantStyles(variant, getThemeValue);
  const sizeStyle = sizeStyles[size];

  const buttonStyle = [
    styles.base,
    variantStyle.container,
    sizeStyle.container,
    (disabled || isLoading) && styles.disabled,
  ];

  return (
    <Pressable
      style={(state) => [
        ...buttonStyle,
        typeof style === "function" ? style(state) : style,
      ]}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={variantStyle.text.color as string} />
      ) : typeof children === "string" ? (
        <Text style={[styles.text, variantStyle.text, sizeStyle.text]}>
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  text: {
    fontWeight: "500",
  },
  disabled: {
    opacity: 0.5,
  },
});
