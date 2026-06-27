import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, DARK_COLORS } from "../../config/constants";
import { useSettingsStore } from "../../stores/settingsStore";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "outline" | "success";
}

export function Badge({ children, variant = "default" }: BadgeProps) {
  const theme = useSettingsStore((s) => s.theme);
  const isDark = theme === "dark";
  const colors = isDark ? DARK_COLORS : COLORS;

  const bgColors = {
    default: colors.primary + "15",
    outline: "transparent",
    success: colors.success + "15",
  };

  const textColors = {
    default: colors.primary,
    outline: colors.mutedForeground,
    success: colors.success,
  };

  const borderColors = {
    default: "transparent",
    outline: colors.border,
    success: "transparent",
  };

  return (
    <View
      style={{
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 999,
        backgroundColor: bgColors[variant],
        borderWidth: variant === "outline" ? 1 : 0,
        borderColor: borderColors[variant],
      }}
    >
      <Text style={{ fontSize: 10, color: textColors[variant], fontWeight: "500" }}>
        {children}
      </Text>
    </View>
  );
}
