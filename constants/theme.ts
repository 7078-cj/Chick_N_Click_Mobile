/** Happy Orange palette — food-ordering UI system */
export const COLORS = {
  /** Vibrant deep orange — primary CTAs, active states */
  primary: "#FD5602",
  /** Bright international orange — secondary emphasis */
  primaryLight: "#FE6B00",
  /** Golden orange — highlights, badges */
  accent: "#FF8D03",
  /** Soft muted orange — borders, inactive accents */
  soft: "#FFAF42",
  /** Pale apricot cream — screens, cards */
  cream: "#FEDEBE",
  /** Card / surface on cream */
  card: "#FFFFFF",
  /** Light gray surfaces — search fields, chips */
  surface: "#F5F5F5",
  text: "#111827",
  subtext: "#6B7280",
  /** Legacy alias: hero panels */
  hero: "#FEDEBE",
  /** Matches previous `secondary` usages in components */
  secondary: "#FE6B00",
};

export const SHADOW = {
  shadowColor: "#FD5602",
  shadowOpacity: 0.12,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 4,
};

/** Neutral card lift — glass-style lists */
export const SHADOW_SOFT = {
  shadowColor: "#000",
  shadowOpacity: 0.06,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
};

/**
 * Scroll content padding so lists clear the floating bottom tab bar
 * (`components/Tabs.tsx` ~ `bottom-[4.5%]`).
 */
export const TAB_BAR_SCROLL_INSET = 120;

/** Cart list: extra space for the checkout bar above the tab bar. */
export const CART_LIST_SCROLL_INSET = 200;
