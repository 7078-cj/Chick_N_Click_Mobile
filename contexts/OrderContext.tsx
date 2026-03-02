import { Order, OrderContextType, OrderProviderProps } from "@/types/Order";
import React, { createContext, useContext, useEffect, useState } from "react";
import AuthContext from "./AuthContext";


export const OrderContext = createContext<OrderContextType | undefined>(undefined);


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

  const handleOrderEvent = (msg:any) => {
        const { event, order } = msg;
        setOrders((prev) => {
            switch (event) {
                case "create":
                return [order, ...prev];
                

                case "update":
                return prev.map((o) => (o.id === order.id ? order : o));

                case "cancelled":
                return prev.map((o) =>
                    o.id === order.id ? { ...o, status: "cancelled" } : o
                );

                case "delete":
                return prev.filter((o) => o.id !== order.id);

                default:
                return prev;
            }
            });
    };

  // ----------------------
  // WebSocket for real-time order updates
  // ----------------------
   useEffect(() => {
        if (!token || !user) return;
        const ws = new WebSocket(`${wsUrl}/ws/order/${user?.id}`);


        ws.onopen = () => console.log("WS Connected");
        ws.onmessage = (e) => {
        try {
            const msg = JSON.parse(e.data);
            if (msg.type === "order") handleOrderEvent(msg);
        } catch (err) {
            console.error(err);
        }
        };

        ws.onerror = (err) => {
            console.error("WebSocket error:", err);
        };

        ws.onclose = () => {
            console.log("WebSocket closed");
        };

        return () => {
            ws.close();
        };
        
    }, [user]);

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
