import {
  deleteCartItem as apiDeleteCartItem,
  fetchCart as apiFetchCart,
  placeOrder as apiPlaceOrder,
  postCartAdd as apiPostCartAdd,
} from "@/api/cart";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Alert } from "react-native";
import AuthContext from "./AuthContext";

/* ---------- TYPES ---------- */

type CartItem = {
  food_id: number;
  food_name?: string;
  quantity: number;
  price: number;
  subtotal: number;
  is_addon?: boolean;
  is_side?: boolean;
  is_drink?: boolean;
  addon_category?: string;
  parent_food_id?: number | null;
  [key: string]: unknown;
};

type LocationData = {
  full: string;
  lat: number;
  lng: number;
};

type UploadProof = {
  uri: string;
  name: string;
  type: string;
};

type PlaceOrderParams = {
  orderType: "delivery" | "pickup";
  location: LocationData;
  proof?: UploadProof | null;
};

type FetchCartOpts = { silent?: boolean };

type CartContextType = {
  fetchCart: (opts?: FetchCartOpts) => Promise<void>;
  cart: CartItem[];
  total: number;
  loading: boolean;
  updatingMainFoodId: number | null;
  placingOrder: boolean;
  placeOrder: (params: PlaceOrderParams) => Promise<{ ok: boolean; message: string }>;
  handleUpdate: (foodId: number, newQty: number) => Promise<boolean>;
  handleRemove: (foodId: number) => void;
};

type ProviderProps = { children: ReactNode };

/* ---------- HELPERS ---------- */

function getLinkedAddons(cart: CartItem[], mainFoodId: number): CartItem[] {
  return cart.filter((i) => i.is_addon && i.parent_food_id === mainFoodId);
}

/**
 * Mirrors backend's per-category cap logic from existingAddonCount + syncAddons:
 *   - Sides cap  = main quantity  (independent of drinks)
 *   - Drinks cap = main quantity  (independent of sides)
 *
 * addon_category is sent by the backend as 'Sides' | 'Drinks'.
 * Returns which categories are over-cap so we can surface a specific message.
 */
function getOverCapCategories(
  addons: CartItem[],
  nextQty: number,
): { sides: boolean; drinks: boolean } {
  const sidesTotal = addons
    .filter((a) => a.addon_category === "Sides")
    .reduce((sum, a) => sum + Number(a.quantity), 0);

  const drinksTotal = addons
    .filter((a) => a.addon_category === "Drinks")
    .reduce((sum, a) => sum + Number(a.quantity), 0);

  return {
    sides:  sidesTotal  > nextQty,
    drinks: drinksTotal > nextQty,
  };
}

function buildTrimMessage(over: { sides: boolean; drinks: boolean }): string {
  if (over.sides && over.drinks) {
    return "Your sides and drinks will be reduced to match the new quantity. Continue?";
  }
  if (over.sides) {
    return "Your sides will be reduced to match the new quantity. Continue?";
  }
  return "Your drinks will be reduced to match the new quantity. Continue?";
}

function confirmAddonTrim(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    Alert.alert(
      "Add-ons will be adjusted",
      message,
      [
        { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
        { text: "Continue", style: "destructive", onPress: () => resolve(true) },
      ],
    );
  });
}

/* ---------- CONTEXT ---------- */

export const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: ProviderProps) => {
  const { token } = useContext(AuthContext) as { token?: string };

  const [cart, setCart] = useState<CartItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingMainFoodId, setUpdatingMainFoodId] = useState<number | null>(null);
  const [placingOrder, setPlacingOrder] = useState<boolean>(false);

  const cartRef = useRef(cart);
  useEffect(() => { cartRef.current = cart; }, [cart]);

  /* ---------- FETCH CART ---------- */

  const fetchCart = useCallback(async (opts?: FetchCartOpts) => {
    if (!token) return;
    const silent = opts?.silent === true;
    try {
      if (!silent) setLoading(true);
      const res = await apiFetchCart(token);
      if (!res.ok) throw new Error("Failed to fetch cart");
      const data = await res.json();
      setCart(data.cart || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      void fetchCart();
    } else {
      setCart([]);
      setTotal(0);
      setLoading(false);
    }
  }, [token, fetchCart]);

  /* ---------- INTERNAL HELPERS ---------- */

  const postLineQuantity = async (foodId: number, newQty: number) => {
    const res = await apiPostCartAdd(token as string, foodId, { quantity: newQty });
    if (!res.ok) throw new Error("Failed to update cart item");
    return res.json();
  };

  /* ---------- REMOVE ITEM ---------- */

  const removeCartItem = async (foodId: number) => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await apiDeleteCartItem(token, foodId);
      if (!res.ok) throw new Error("Failed to remove cart item");
      await fetchCart({ silent: true });
    } catch (err) {
      console.error(err);
      Alert.alert("Remove Failed", "Unable to remove item from cart.");
      await fetchCart({ silent: true });
    } finally {
      setLoading(false);
    }
  };

  /* ---------- UPDATE MAIN QUANTITY ---------- */

  const handleUpdate = useCallback(async (foodId: number, newQty: number): Promise<boolean> => {
    if (!token) return false;

    const current = cartRef.current;
    const mainItem = current.find((i) => i.food_id === foodId && !i.is_addon);
    if (!mainItem) return false;

    const oldQty = Number(mainItem.quantity) || 1;
    const nextMain = Math.max(1, Math.floor(newQty));
    if (nextMain === oldQty) return true;

    if (nextMain < oldQty) {
      const linked = getLinkedAddons(current, foodId);
      const over = getOverCapCategories(linked, nextMain);

      if (over.sides || over.drinks) {
        const confirmed = await confirmAddonTrim(buildTrimMessage(over));
        if (!confirmed) return false;
      }
    }

    setUpdatingMainFoodId(foodId);
    try {
      // Send only the new main quantity — backend capAddonQuantitiesToMain
      // trims sides and drinks per-category automatically.
      await postLineQuantity(foodId, nextMain);
      await fetchCart({ silent: true });
      return true;
    } catch (err) {
      console.error(err);
      Alert.alert("Update Failed", "Unable to update cart item quantity.");
      await fetchCart({ silent: true });
      return false;
    } finally {
      setUpdatingMainFoodId(null);
    }
  }, [token, fetchCart]);

  const handleRemove = (foodId: number) => void removeCartItem(foodId);

  /* ---------- PLACE ORDER ---------- */

  const placeOrder = async ({ orderType, location, proof }: PlaceOrderParams) => {
    if (cartRef.current.length === 0) {
      return { ok: false, message: "Your cart is empty." };
    }
    try {
      setPlacingOrder(true);
      const formData = new FormData();
      formData.append("type", orderType);
      if (orderType === "delivery") {
        formData.append("location", location.full);
        formData.append("latitude", location.lat.toString());
        formData.append("longitude", location.lng.toString());
      }
      if (proof) formData.append("proof_of_payment", proof as any);

      const res = await apiPlaceOrder(token as string, formData);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to place order.");

      setCart([]);
      setTotal(0);
      return { ok: true, message: data?.message || "Order placed successfully." };
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Error placing order.";
      return { ok: false, message };
    } finally {
      setPlacingOrder(false);
    }
  };

  /* ---------- CONTEXT VALUE ---------- */

  return (
    <CartContext.Provider value={{
      fetchCart,
      cart,
      total,
      loading,
      updatingMainFoodId,
      placingOrder,
      placeOrder,
      handleUpdate,
      handleRemove,
    }}>
      {children}
    </CartContext.Provider>
  );
};