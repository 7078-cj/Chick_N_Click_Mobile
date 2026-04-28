import type { TextStyle } from "react-native";

/**
 * Central font-family configuration for the whole app.
 * After loading fonts with expo-font, set the PostScript / internal names here
 * (e.g. "Inter-Regular", "Inter-Bold").
 */
export const FONT_FAMILIES = {
  /** Body, labels, most UI */
  sans: undefined as string | undefined,
  /** Hero titles and marketing headlines */
  display: undefined as string | undefined,
  /** Tab labels, chips, dense UI */
  condensed: undefined as string | undefined,
} as const;

export type FontFace = keyof typeof FONT_FAMILIES;

/** Optional defaults used by `AppText` when `preset` is set (sizes/line heights); swap in one place. */
export const TEXT_PRESETS: Record<
  "none" | "hero" | "title" | "subtitle" | "body" | "caption" | "label",
  TextStyle | undefined
> = {
  none: undefined,
  hero: { fontSize: 30, lineHeight: 36, fontWeight: "800" },
  title: { fontSize: 22, lineHeight: 28, fontWeight: "800" },
  subtitle: { fontSize: 18, lineHeight: 24, fontWeight: "700" },
  body: { fontSize: 16, lineHeight: 22, fontWeight: "400" },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: "400" },
  label: { fontSize: 12, lineHeight: 16, fontWeight: "600" },
};
