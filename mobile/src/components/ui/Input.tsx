import React from "react";
import { TextInput, StyleSheet, type TextInputProps } from "react-native";
import { COLORS, DARK_COLORS } from "../../config/constants";
import { useSettingsStore } from "../../stores/settingsStore";

interface InputProps extends TextInputProps {
  label?: string;
}

export function Input({ label, style, ...props }: InputProps) {
  const theme = useSettingsStore((s) => s.theme);
  const isDark = theme === "dark";
  const colors = isDark ? DARK_COLORS : COLORS;

  return (
    <TextInput
      placeholderTextColor={colors.mutedForeground}
      style={[
        {
          height: 40,
          paddingHorizontal: 12,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: isDark ? colors.surface1 : colors.background,
          color: colors.foreground,
          fontSize: 14,
        },
        style,
      ]}
      {...props}
    />
  );
}
