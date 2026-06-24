import { Text as RNText, TextProps as RNTextProps, TextStyle } from "react-native";
import { useTheme } from "@/core/providers";

/**
 * Text Component
 *
 * Variant size + weight come from the THEME's typography presets;
 * color comes from the THEME's color tokens. Editing values in
 * ThemeProvider/themeConstants.tsx propagates everywhere automatically.
 *
 * Variant → typography preset:
 *   h1, h2     → typography.heading
 *   h3         → typography.subheading
 *   body, label → typography.body
 *   caption    → typography.caption
 */

type TextVariant = "h1" | "h2" | "h3" | "body" | "caption" | "label";

interface TextProps extends RNTextProps {
  variant?: TextVariant;
}

/** Map UI variant → THEME paths + per-variant overrides. */
function getVariantConfig(variant: TextVariant): {
  presetPath: string;
  colorPath: string;
  override?: Partial<TextStyle>;
} {
  switch (variant) {
    case "h1":
      return { presetPath: "typography.heading", colorPath: "colors.text", override: { fontSize: 30 } };
    case "h2":
      return { presetPath: "typography.heading", colorPath: "colors.text" };
    case "h3":
      return { presetPath: "typography.subheading", colorPath: "colors.text", override: { fontSize: 20 } };
    case "body":
      return { presetPath: "typography.body", colorPath: "colors.text", override: { fontSize: 16 } };
    case "caption":
      return { presetPath: "typography.caption", colorPath: "colors.muted" };
    case "label":
      return { presetPath: "typography.body", colorPath: "colors.text", override: { fontWeight: "500" } };
  }
}

export function Text({ variant = "body", style, children, ...props }: TextProps) {
  const { getThemeValue } = useTheme();
  const { presetPath, colorPath, override } = getVariantConfig(variant);
  const preset = getThemeValue(presetPath) as {
    fontFamily: string;
    fontSize: number;
    fontWeight: string;
    lineHeight: number;
  };

  const variantStyle: TextStyle = {
    fontFamily: preset.fontFamily,
    fontSize: preset.fontSize,
    fontWeight: preset.fontWeight as TextStyle["fontWeight"],
    // RN expects lineHeight in absolute px, not a multiplier.
    lineHeight: preset.fontSize * preset.lineHeight,
    color: getThemeValue(colorPath),
    ...override,
  };

  return (
    <RNText style={[variantStyle, style]} {...props}>
      {children}
    </RNText>
  );
}
