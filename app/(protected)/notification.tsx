import AuthContext from "@/contexts/AuthContext";
import { TabContext } from "@/contexts/TabContext";
import React, { useContext, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

type AppNotification = {
  id: number;
  title: string;
  body: string;
  created_at: string;
};

export default function Notification() {
  const auth = useContext(AuthContext);
  const tab = useContext(TabContext);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const url = process.env.EXPO_PUBLIC_API_URL;
  const wsUrl = process.env.EXPO_PUBLIC_WS_URL;

  const fetchNotifications = async () => {
    try {
      if (!auth?.token) return;
      setLoading(true);
      const res = await fetch(`${url}/api/notifications`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch notifications");
      const data = await res.json();
      setNotifications(data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    tab?.setActive("Notifications");
    fetchNotifications();
  }, [auth?.token]);

  useEffect(() => {
    if (!auth?.user?.id || !wsUrl) return;
    const ws = new WebSocket(`${wsUrl}/ws/notify/${auth.user.id}`);

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === "notification" && msg.order) {
          fetchNotifications();
        }
      } catch (err) {
        console.error(err);
      }
    };

    return () => ws.close();
  }, [auth?.user?.id, wsUrl]);

  return (
    <View className="flex-1 px-4 bg-gray-100">
      <Text className="mt-2 mb-3 text-2xl font-bold text-gray-900">Notifications</Text>
      {loading ? (
        <View className="items-center justify-center flex-1">
          <ActivityIndicator size="large" color="#f97316" />
        </View>
      ) : notifications.length ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
          {notifications.map((item) => (
            <View key={item.id} className="p-4 mb-3 bg-white shadow rounded-2xl">
              <Text className="mb-1 text-base font-semibold text-gray-900">{item.title}</Text>
              <Text className="text-sm text-gray-600">{item.body}</Text>
              <Text className="mt-2 text-xs text-gray-400">
                {new Date(item.created_at).toLocaleString()}
              </Text>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View className="items-center justify-center flex-1">
          <Text className="text-gray-500">No notifications yet.</Text>
        </View>
      )}
    </View>
  );
}
