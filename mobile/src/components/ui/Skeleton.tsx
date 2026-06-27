import React, { useEffect, useRef } from "react";
import { View, Animated, type ViewStyle } from "react-native";
import { COLORS, DARK_COLORS } from "../../config/constants";
import { useSettingsStore } from "../../stores/settingsStore";

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = "100%", height = 16, borderRadius = 6, style }: SkeletonProps) {
  const theme = useSettingsStore((s) => s.theme);
  const isDark = theme === "dark";
  const colors = isDark ? DARK_COLORS : COLORS;
  const opacity = useRef(new Animated.Value(0.3));

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity.current, {
          toValue: 0.6,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity.current, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: colors.muted,
          opacity: opacity.current,
        },
        style,
      ]}
    />
  );
}
