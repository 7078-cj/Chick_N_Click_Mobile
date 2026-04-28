import { FONT_FAMILIES, TEXT_PRESETS, type FontFace } from "@/constants/typography";
import React from "react";
import { Text, type TextProps } from "react-native";

export type AppTextProps = TextProps & {
  /** Which font family token from `constants/typography.ts` to use */
  face?: FontFace;
  /**
   * Optional typographic preset (fontSize/lineHeight/weight). Prefer NativeWind `className`
   * when possible; use `preset` only when you want shared numbers from TEXT_PRESETS.
   */
  preset?: keyof typeof TEXT_PRESETS;
};

/**
 * App-wide `Text` wrapper — import this instead of `Text` from `react-native` so
 * `FONT_FAMILIES` in `constants/typography.ts` controls font families in one place.
 */
export function AppText({ style, face = "sans", preset = "none", ...rest }: AppTextProps) {
  const family = FONT_FAMILIES[face];
  const presetStyle = TEXT_PRESETS[preset];

  return (
    <Text
      style={[
        family != null ? { fontFamily: family } : undefined,
        presetStyle,
        style,
      ]}
      {...rest}
    />
  );
}
