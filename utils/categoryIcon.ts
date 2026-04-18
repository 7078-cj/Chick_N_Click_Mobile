import { MaterialIcons } from "@expo/vector-icons";

/**
 * Category row / card icons: only Drinks, Sides, and Addons get specific glyphs;
 * all other categories use a generic food icon.
 */
export type CategoryMaterialGlyph = keyof typeof MaterialIcons.glyphMap;

export function getCategoryMaterialIcon(
  categoryName: string,
): CategoryMaterialGlyph {
  const n = categoryName.trim().toLowerCase();
  if (n.includes("drink")) {
    return "local-drink";
  }
  if (n.includes("side")) {
    return "restaurant-menu";
  }
  if (n.includes("addon")) {
    return "add-circle-outline";
  }
  return "restaurant";
}
