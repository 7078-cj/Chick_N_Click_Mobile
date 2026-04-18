import {
  deleteCartItem as apiDeleteCartItem,
  fetchCart as apiFetchCart,
  placeOrder as apiPlaceOrder,
  postCartAdd as apiPostCartAdd,
} from "@/api/cart";
import {
  canDecreaseMainQuantity,
  linkedAddonsForMain,
} from "@/utils/cartLineage";
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
  quantity: number;
  price: number;
  subtotal: number;
  is_addon?: boolean;
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
  /** Main line `food_id` while quantity + add-on sync is in flight */
  updatingMainFoodId: number | null;
  placingOrder: boolean;
  placeOrder: (params: PlaceOrderParams) => Promise<{
    ok: boolean;
    message: string;
  }>;
  /** `false` when the decrease is blocked (e.g. too many add-on types for the new qty). */
  handleUpdate: (foodId: number, newQty: number) => Promise<boolean>;
  handleRemove: (foodId: number) => void;
};

type ProviderProps = {
  children: ReactNode;
};

/* ---------- CONTEXT ---------- */

export const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: ProviderProps) => {
  const { token } = useContext(AuthContext) as { token?: string };

  const [cart, setCart] = useState<CartItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingMainFoodId, setUpdatingMainFoodId] = useState<number | null>(
    null,
  );
  const [placingOrder, setPlacingOrder] = useState<boolean>(false);

  const cartRef = useRef(cart);
  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

  /* ---------- FETCH CART ---------- */

  const fetchCart = useCallback(
    async (opts?: FetchCartOpts) => {
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
    },
    [token],
  );

  useEffect(() => {
    if (token) {
      void fetchCart();
    } else {
      setCart([]);
      setTotal(0);
      setLoading(false);
    }
  }, [token, fetchCart]);

  const postLineQuantity = async (foodId: number, newQty: number) => {
    const res = await apiPostCartAdd(token as string, foodId, {
      quantity: newQty,
    });
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

  /* ---------- UPDATE MAIN + ADD-ONS ---------- */

  const handleUpdate = useCallback(
    async (foodId: number, newQty: number): Promise<boolean> => {
      if (!token) return false;
      const current = cartRef.current;
      const mainItem = current.find(
        (i) => i.food_id === foodId && !i.is_addon,
      );
      if (!mainItem) return false;

      const oldQty = Number(mainItem.quantity) || 1;
      const nextMain = Math.max(1, Math.floor(newQty));
      if (nextMain === oldQty) return true;

      const linked = linkedAddonsForMain(current, foodId);

      if (nextMain < oldQty) {
        if (!canDecreaseMainQuantity(linked, nextMain)) {
          Alert.alert(
            "Can't reduce quantity",
            "This meal has more sides or drinks (different items) than the new quantity allows. Remove an add-on first, then lower the quantity.",
          );
          return false;
        }
      }

      setUpdatingMainFoodId(foodId);
      try {
        await postLineQuantity(foodId, nextMain);

        /* Sides/drinks only follow main downward — never auto-increase. */
        if (nextMain < oldQty) {
          for (const addon of linked) {
            const aQty = Number(addon.quantity) || 1;
            const nextAddon = Math.max(1, Math.min(aQty, nextMain));
            if (nextAddon !== aQty) {
              await postLineQuantity(addon.food_id, nextAddon);
            }
          }
        }

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
    },
    [token, fetchCart],
  );

  const handleRemove = (foodId: number) => {
    void removeCartItem(foodId);
  };

  /* ---------- PLACE ORDER ---------- */

  const placeOrder = async ({
    orderType,
    location,
    proof,
  }: PlaceOrderParams) => {
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

      if (proof) {
        formData.append("proof_of_payment", proof as any);
      }

      const res = await apiPlaceOrder(token as string, formData);

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to place order.");
      }

      setCart([]);
      setTotal(0);
      return { ok: true, message: data?.message || "Order placed successfully." };
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error ? err.message : "Error placing order.";
      return { ok: false, message };
    } finally {
      setPlacingOrder(false);
    }
  };

  /* ---------- CONTEXT VALUE ---------- */

  const context: CartContextType = {
    fetchCart,
    cart,
    total,
    loading,
    updatingMainFoodId,
    placingOrder,
    placeOrder,
    handleUpdate,
    handleRemove,
  };

  return (
    <CartContext.Provider value={context}>
      {children}
    </CartContext.Provider>
  );
};
