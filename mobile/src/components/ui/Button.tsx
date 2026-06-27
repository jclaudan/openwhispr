import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  type ViewStyle,
  type TextStyle,
} from "react-native";
import { COLORS, DARK_COLORS } from "../../config/constants";
import { useSettingsStore } from "../../stores/settingsStore";

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function Button({
  children,
  onPress,
  variant = "default",
  size = "md",
  disabled = false,
  loading = false,
  style,
}: ButtonProps) {
  const theme = useSettingsStore((s) => s.theme);
  const isDark = theme === "dark";
  const colors = isDark ? DARK_COLORS : COLORS;

  const baseStyle: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 8,
    opacity: disabled ? 0.5 : 1,
  };

  const sizeStyles: Record<string, ViewStyle> = {
    sm: { paddingHorizontal: 12, paddingVertical: 6, minHeight: 32 },
    md: { paddingHorizontal: 16, paddingVertical: 10, minHeight: 40 },
    lg: { paddingHorizontal: 24, paddingVertical: 14, minHeight: 48 },
  };

  const variantStyles: Record<string, ViewStyle> = {
    default: { backgroundColor: colors.primary },
    outline: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: colors.border,
    },
    ghost: { backgroundColor: "transparent" },
    destructive: { backgroundColor: colors.destructive },
  };

  const textStyles: Record<string, TextStyle> = {
    default: { color: colors.primaryForeground },
    outline: { color: colors.foreground },
    ghost: { color: colors.foreground },
    destructive: { color: colors.primaryForeground },
  };

  const sizeText: Record<string, TextStyle> = {
    sm: { fontSize: 12 },
    md: { fontSize: 14 },
    lg: { fontSize: 16 },
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[baseStyle, sizeStyles[size], variantStyles[variant], style]}
    >
      {loading && (
        <ActivityIndicator size="small" color={textStyles[variant].color} />
      )}
      <Text style={[textStyles[variant], sizeText[size], { fontWeight: "500" }]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}
