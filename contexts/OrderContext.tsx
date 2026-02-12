import { Order, OrderContextType, OrderEventPayload, OrderProviderProps } from "@/types/Order";
import React, { createContext, useContext, useEffect, useState } from "react";
import AuthContext from "./AuthContext";



// ----------------------
// Context
// ----------------------
export const OrderContext = createContext<OrderContextType | undefined>(undefined);

// ----------------------
// Provider
// ----------------------
export const OrderProvider: React.FC<OrderProviderProps> = ({ children }) => {
  const { token, user } = useContext(AuthContext) as { token: string | null; user: { id: number } | null };
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const url = process.env.EXPO_PUBLIC_API_URL as string;
  const wsUrl = process.env.EXPO_PUBLIC_WS_URL as string;

  // ----------------------
  // Fetch orders
  // ----------------------
  const fetchOrders = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${url}/api/orders`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch orders");
      const data: { orders: Order[] } = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------
  // Cancel order
  // ----------------------
  const cancelOrder = async (orderId: number) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;

    try {
      const res = await fetch(`${url}/api/order/${orderId}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to cancel order");

      fetchOrders();
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    }
  };

  // ----------------------
  // WebSocket for real-time order updates
  // ----------------------
  useEffect(() => {
    if (!token || !user) return;

    const ws = new WebSocket(`${wsUrl}/ws/order/${user.id}`);

    ws.onmessage = (event: MessageEvent) => {
      try {
        const payload: OrderEventPayload = JSON.parse(event.data);
        if (payload.type === "order" && payload.event === "update") {
          setOrders((prevOrders) =>
            prevOrders.map((o) =>
              o.id === payload.order.id ? { ...o, ...payload.order } : o
            )
          );
        }
      } catch (err) {
        console.error("WebSocket message error:", err);
      }
    };

    ws.onerror = (err) => console.error("WebSocket error:", err);
    ws.onclose = () => console.log("WebSocket closed");

    return () => ws.close();
  }, [user, token, wsUrl]);

  // ----------------------
  // Fetch orders on token change
  // ----------------------
  useEffect(() => {
    if (token) {
      fetchOrders();
    } else {
      setOrders([]);
    }
  }, [token]);

  const context: OrderContextType = {
    fetchOrders,
    cancelOrder,
    orders,
    loading,
    setLoading,
  };

  return <OrderContext.Provider value={context}>{children}</OrderContext.Provider>;
};
