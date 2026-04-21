import {
  deleteNotification as apiDeleteNotification,
  fetchNotifications as apiFetchNotifications,
  markNotificationAsRead as apiMarkNotificationAsRead,
} from "@/api/notifications";
import AuthContext from "@/contexts/AuthContext";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type AppNotification = {
  id: number;
  title: string;
  body: string;
  created_at: string;
  is_read?: boolean;
  parent_food_id?: number | null;
};

type NotificationContextType = {
  notifications: AppNotification[];
  loading: boolean;
  unreadCount: number;
  notificationSocketReady: boolean;
  fetchNotifications: (opts?: { silent?: boolean }) => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  removeNotification: (id: number) => Promise<void>;
};

type ProviderProps = {
  children: React.ReactNode;
};

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<ProviderProps> = ({ children }) => {
  const auth = useContext(AuthContext);
  const token = auth?.token ?? null;
  const user = auth?.user ?? null;
  const wsUrl = process.env.EXPO_PUBLIC_WS_URL as string;

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [notificationSocketReady, setNotificationSocketReady] = useState(true);

  const fetchNotifications = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!token) return;
      const silent = opts?.silent === true;
      try {
        if (!silent) setLoading(true);
        const res = await apiFetchNotifications(token);
        if (!res.ok) throw new Error("Failed to fetch notifications");
        const data = await res.json();
        setNotifications(data?.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [token],
  );

  const markAsRead = useCallback(
    async (id: number) => {
      if (!token) return;
      try {
        await apiMarkNotificationAsRead(token, id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
        );
      } catch (err) {
        console.error(err);
      }
    },
    [token],
  );

  const removeNotification = useCallback(
    async (id: number) => {
      if (!token) return;
      try {
        await apiDeleteNotification(token, id);
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      } catch (err) {
        console.error(err);
      }
    },
    [token],
  );

  useEffect(() => {
    if (token) {
      void fetchNotifications();
    } else {
      setNotifications([]);
      setLoading(false);
    }
  }, [token, fetchNotifications]);

  useEffect(() => {
    if (!token || !user?.id || !wsUrl) {
      setNotificationSocketReady(true);
      return;
    }

    let cancelled = false;
    setNotificationSocketReady(false);
    const fallback = setTimeout(() => {
      if (!cancelled) setNotificationSocketReady(true);
    }, 5000);

    const ws = new WebSocket(`${wsUrl}/ws/notify/${user.id}`);

    ws.onopen = () => {
      clearTimeout(fallback);
      if (!cancelled) setNotificationSocketReady(true);
    };

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === "notification") {
          void fetchNotifications({ silent: true });
        }
      } catch (err) {
        console.error(err);
      }
    };

    ws.onerror = (err) => {
      console.error("Notification websocket error:", err);
      clearTimeout(fallback);
      if (!cancelled) setNotificationSocketReady(true);
    };

    return () => {
      cancelled = true;
      clearTimeout(fallback);
      ws.close();
    };
  }, [token, user?.id, wsUrl, fetchNotifications]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications],
  );

  const value: NotificationContextType = {
    notifications,
    loading,
    unreadCount,
    notificationSocketReady,
    fetchNotifications,
    markAsRead,
    removeNotification,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};
