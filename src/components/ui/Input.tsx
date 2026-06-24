import { forwardRef } from "react";
import { TextInput, TextInputProps, View, Text, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "@/core/providers";

/**
 * Input Component
 *
 * Text field with optional label + error message. All colors come from
 * THEME via getThemeValue, so the field restyles when the user toggles
 * light/dark.
 */

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, containerStyle, style, ...props }, ref) => {
    const { getThemeValue } = useTheme();

    const inputColors = {
      label: getThemeValue("colors.text"),
      text: getThemeValue("colors.text"),
      placeholder: getThemeValue("colors.muted"),
      background: getThemeValue("colors.background"),
      border: getThemeValue("colors.border"),
      errorBorder: getThemeValue("colors.destructive"),
      error: getThemeValue("colors.destructive"),
    };

    return (
      <View style={[staticStyles.container, containerStyle]}>
        {label && (
          <Text style={[staticStyles.label, { color: inputColors.label }]}>
            {label}
          </Text>
        )}
        <TextInput
          ref={ref}
          style={[
            staticStyles.input,
            {
              backgroundColor: inputColors.background,
              borderColor: error ? inputColors.errorBorder : inputColors.border,
              color: inputColors.text,
            },
            style,
          ]}
          placeholderTextColor={inputColors.placeholder}
          {...props}
        />
        {error && (
          <Text style={[staticStyles.error, { color: inputColors.error }]}>
            {error}
          </Text>
        )}
      </View>
    );
  }
);

Input.displayName = "Input";

/** Layout-only — no colors here; all colors come from theme above. */
const staticStyles = StyleSheet.create({
  container: {
    width: "100%",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  error: {
    fontSize: 14,
    marginTop: 4,
  },
});
