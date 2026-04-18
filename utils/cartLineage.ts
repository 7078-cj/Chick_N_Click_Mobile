/**
 * Resolves which main-menu `food_id` an add-on row belongs to.
 * Backend should set one of these on cart rows where `is_addon` is true.
 */
export function getAddonParentFoodId(item: {
  is_addon?: boolean;
  parent_food_id?: unknown;
  parent?: { food_id?: unknown } | null;
  [key: string]: unknown;
}): number | null {
  if (!item?.is_addon) return null;
  const flat =
    item.parent_food_id ??
    item.main_food_id ??
    item.parentFoodId ??
    item.mainFoodId ??
    item.addon_for_food_id ??
    item.paired_food_id;
  if (flat != null && flat !== "") {
    const n = Number(flat);
    if (Number.isFinite(n)) return n;
  }
  if (item.parent && typeof item.parent === "object" && "food_id" in item.parent) {
    const fid = Number((item.parent as { food_id: unknown }).food_id);
    if (Number.isFinite(fid)) return fid;
  }
  return null;
}

export function linkedAddonsForMain(
  cart: { food_id: number; is_addon?: boolean; quantity?: number; [key: string]: unknown }[],
  mainFoodId: number,
) {
  const id = Number(mainFoodId);
  return cart.filter(
    (row) => row.is_addon && getAddonParentFoodId(row) === id,
  );
}

/** Add-on rows with quantity > 0 (each row is a distinct side/drink type). */
export function countActiveAddonLines(
  linked: { quantity?: number; [key: string]: unknown }[],
) {
  return linked.filter((a) => (Number(a.quantity) || 0) > 0).length;
}

/**
 * When lowering main quantity, each active add-on line needs a "slot" under the new cap:
 * you cannot go below a quantity that is less than the number of different sides/drinks.
 */
export function canDecreaseMainQuantity(
  linked: { quantity?: number; [key: string]: unknown }[],
  newMainQty: number,
) {
  return countActiveAddonLines(linked) <= newMainQty;
}
