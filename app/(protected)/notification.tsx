import {
  fetchNotifications as apiFetchNotifications,
  deleteNotification,
  markNotificationAsRead
} from "@/api/notifications";
import { ScreenIntro } from "@/components/layout/ScreenIntro";
import AuthContext from "@/contexts/AuthContext";
import { TabContext } from "@/contexts/TabContext";
import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  View,
} from "react-native";

type AppNotification = {
  id: number;
  title: string;
  body: string;
  created_at: string;
  is_read?: boolean;
};

export default function Notification() {
  const auth = useContext(AuthContext);
  const tab = useContext(TabContext);

  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const wsUrl = process.env.EXPO_PUBLIC_WS_URL;

  /**
   * Fetch notifications
   */
  const fetchNotifications = async () => {
    try {
      if (!auth?.token) return;
      setLoading(true);

      const res = await apiFetchNotifications(auth.token);
      if (!res.ok) throw new Error("Failed to fetch notifications");

      const data = await res.json();
      setNotifications(data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Mark as read
   */
  const handleMarkAsRead = async (id: number) => {
    if (!auth?.token) return;

    try {
      await markNotificationAsRead(auth.token, id);

      // update UI instantly
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * Delete notification
   */
  const handleDelete = async (id: number) => {
    if (!auth?.token) return;

    try {
      await deleteNotification(auth.token, id);

      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * Unread count
   */
  const unreadCount = notifications.filter(n => !n.is_read).length;

  /**
   * Initial load
   */
  useEffect(() => {
    tab?.setActive("Notifications");
    fetchNotifications();
  }, [auth?.token]);

  /**
   * Update badge count (if supported)
   */
  useEffect(() => {
    tab?.setBadge?.("Notifications", unreadCount);
  }, [unreadCount]);

  /**
   * WebSocket real-time updates
   */
  useEffect(() => {
    if (!auth?.user?.id || !wsUrl) return;

    const ws = new WebSocket(`${wsUrl}/ws/notify/${auth.user.id}`);

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);

        if (msg.type === "notification") {
          fetchNotifications();
        }
      } catch (err) {
        console.error(err);
      }
    };

    return () => ws.close();
  }, [auth?.user?.id, wsUrl]);

  return (
    <View className="flex-1 bg-white">
      <ScreenIntro
        eyebrow="Updates"
        title="Notifications"
        subtitle="Order updates and messages."
        accentTitle
      />

      <View className="flex-1 px-4">
        {loading ? (
          <View className="items-center justify-center flex-1">
            <ActivityIndicator size="large" color="#FD5602" />
          </View>
        ) : notifications.length ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120 }}
          >
            {notifications.map((item) => {
              const isUnread = !item.is_read;

              return (
                <View
                  key={item.id}
                  className={`p-4 mb-3 rounded-2xl border ${
                    isUnread
                      ? "bg-orange-50 border-orange-200"
                      : "bg-white border-gray-100"
                  }`}
                  style={{
                    shadowColor: "#000",
                    shadowOpacity: 0.06,
                    shadowRadius: 12,
                    shadowOffset: { width: 0, height: 4 },
                    elevation: 2,
                  }}
                >
                  {/* TITLE (tap to mark as read) */}
                  <Text
                    onPress={() => handleMarkAsRead(item.id)}
                    className="mb-1 text-base font-semibold text-gray-900"
                  >
                    {isUnread ? "🔔 " : "✔️ "} {item.title}
                  </Text>

                  {/* BODY */}
                  <Text className="text-sm text-gray-600">
                    {item.body}
                  </Text>

                  {/* FOOTER */}
                  <View className="flex-row items-center justify-between mt-2">
                    <Text className="text-xs text-gray-400">
                      {new Date(item.created_at).toLocaleString()}
                    </Text>

                    {/* DELETE */}
                    <Text
                      onPress={() => handleDelete(item.id)}
                      className="text-xs text-red-400"
                    >
                      Delete
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        ) : (
          <View className="items-center justify-center flex-1">
            <Text className="text-gray-500">
              No notifications yet.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}