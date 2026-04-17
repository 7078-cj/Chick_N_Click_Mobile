import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import AuthContext from "./AuthContext";

/* ---------- TYPES ---------- */

type CartItem = {
  food_id: number;
  quantity: number;
  price: number;
  subtotal: number;
}

type LocationData = {
  full: string;
  lat: number;
  lng: number;
}

type UploadProof = {
  uri: string;
  name: string;
  type: string;
};

type PlaceOrderParams = {
  orderType: "delivery" | "pickup";
  location: LocationData;
  proof?: UploadProof | null;
}

type CartContextType = {
  fetchCart: () => Promise<void>;
  cart: CartItem[];
  total: number;
  loading: boolean;
  placingOrder: boolean;
  placeOrder: (params: PlaceOrderParams) => Promise<{
    ok: boolean;
    message: string;
  }>;
  handleUpdate: (foodId: number, newQty: number) => void;
  handleRemove: (foodId: number) => void;
}

type ProviderProps = {
  children: ReactNode;
}

/* ---------- CONTEXT ---------- */

export const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: ProviderProps) => {
  const { token } = useContext(AuthContext) as { token?: string };

  const [cart, setCart] = useState<CartItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [placingOrder, setPlacingOrder] = useState<boolean>(false);

  const url = process.env.EXPO_PUBLIC_API_URL;

  /* ---------- FETCH CART ---------- */

  const fetchCart = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${url}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to fetch cart");

      const data = await res.json();
      setCart(data.cart || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCart();
    } else {
      setCart([]);
      setTotal(0);
    }
  }, [token]);

  /* ---------- UPDATE ITEM ---------- */

  const updateCartItem = async (foodId: number, newQty: number) => {
    try {
      const res = await fetch(`${url}/api/cart/add/${foodId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: newQty }),
      });

      if (!res.ok) throw new Error("Failed to update cart item");
      const data = await res.json();
      if (data?.cart && data?.total !== undefined) {
        setCart(data.cart || []);
        setTotal(data.total || 0);
      } else {
        await fetchCart();
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Update Failed", "Unable to update cart item quantity.");
      await fetchCart();
    }
  };

  /* ---------- REMOVE ITEM ---------- */

  const removeCartItem = async (foodId: number) => {
    try {
      const res = await fetch(`${url}/api/cart/remove/${foodId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to remove cart item");
      await fetchCart();
    } catch (err) {
      console.error(err);
      Alert.alert("Remove Failed", "Unable to remove item from cart.");
      await fetchCart();
    }
  };

  /* ---------- LOCAL UPDATE ---------- */

  const handleUpdate = (foodId: number, newQty: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.food_id === foodId
          ? { ...item, quantity: newQty, subtotal: newQty * item.price }
          : item
      )
    );

    setTotal(
      cart.reduce(
        (sum, i) =>
          sum + (i.food_id === foodId ? newQty * i.price : i.subtotal),
        0
      )
    );

    updateCartItem(foodId, newQty);
  };

  const handleRemove = (foodId: number) => {
    setCart((prev) => prev.filter((item) => item.food_id !== foodId));

    setTotal(
      cart
        .filter((i) => i.food_id !== foodId)
        .reduce((sum, i) => sum + i.subtotal, 0)
    );

    removeCartItem(foodId);
  };

  /* ---------- PLACE ORDER ---------- */

  const placeOrder = async ({
    orderType,
    location,
    proof,
  }: PlaceOrderParams) => {
    if (cart.length === 0) {
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

      const res = await fetch(`${url}/api/order/place`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

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
