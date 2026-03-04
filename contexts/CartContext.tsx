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

type PlaceOrderParams = {
  orderType: string;
  location: LocationData;
  proof?: File | null;
}

type CartContextType = {
  fetchCart: () => Promise<void>;
  cart: CartItem[];
  total: number;
  loading: boolean;
  placingOrder: boolean;
  placeOrder: (params: PlaceOrderParams) => Promise<void>;
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
      const res = await fetch(`${url}/api/cart/${foodId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: newQty }),
      });

      const data = await res.json();
      setCart(data.cart || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------- REMOVE ITEM ---------- */

  const removeCartItem = async (foodId: number) => {
    try {
      const res = await fetch(`${url}/api/cart/${foodId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setCart(data.cart || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
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
      alert("Your cart is empty!");
      return;
    }

    try {
      setPlacingOrder(true);

      const formData = new FormData();
      formData.append("type", orderType);
      formData.append("location", location.full);
      formData.append("latitude", location.lat.toString());
      formData.append("longitude", location.lng.toString());

      if (proof) {
        formData.append("proof_of_payment", proof);
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
      
    } catch (err) {
      console.error(err);
      alert("Error placing order.");
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
