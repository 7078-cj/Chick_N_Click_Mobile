import { fetchNotifications as apiFetchNotifications } from "@/api/notifications";
import { ScreenIntro } from "@/components/layout/ScreenIntro";
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

  const wsUrl = process.env.EXPO_PUBLIC_WS_URL;

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
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
          {notifications.map((item) => (
            <View
              key={item.id}
              className="p-4 mb-3 bg-white border border-gray-100 rounded-2xl"
              style={{
                shadowColor: "#000",
                shadowOpacity: 0.06,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 4 },
                elevation: 2,
              }}
            >
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
    </View>
  );
}
