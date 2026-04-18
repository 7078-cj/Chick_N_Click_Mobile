import { COLORS } from "@/constants/theme";
import React from "react";
import { Text, View } from "react-native";

type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  /** When true, title uses primary brand orange (matches Menu screen). */
  accentTitle?: boolean;
};

/**
 * Shared top-of-screen intro block aligned with the Menu tab styling.
 */
export function ScreenIntro({
  eyebrow,
  title,
  subtitle,
  accentTitle = false,
}: Props) {
  return (
    <View
      className="px-4 pt-3 pb-4 mb-1 bg-white border-b rounded-b-3xl"
      style={{ borderBottomColor: "rgba(0, 0, 0, 0.06)" }}
    >
      {eyebrow ? (
        <Text className="text-xs tracking-wider text-gray-600 uppercase">
          {eyebrow}
        </Text>
      ) : null}
      <Text
        className={accentTitle ? "text-3xl font-extrabold" : "text-2xl font-extrabold"}
        style={
          accentTitle ? { color: COLORS.primary } : { color: "#111827" }
        }
      >
        {title}
      </Text>
      {subtitle ? (
        <Text className="mt-1 text-sm text-gray-600">{subtitle}</Text>
      ) : null}
    </View>
  );
}
