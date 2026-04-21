import { ScreenIntro } from "@/components/layout/ScreenIntro";
import { TAB_BAR_SCROLL_INSET } from "@/constants/theme";
import { useNotification } from "@/hooks/useNotification";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Notification() {
  const {
    loading,
    notifications,
    markAsRead,
    removeNotification,
  } = useNotification();

  useEffect(() => {}, []);

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
            contentContainerStyle={{ paddingBottom: TAB_BAR_SCROLL_INSET }}
          >
            {notifications.map((item) => {
              const isUnread = !item.is_read;

              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => {
                    if (!item.is_read) {
                      markAsRead(item.id);
                    }
                  }}
                  activeOpacity={0.8}
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
                  <Text className="mb-1 text-base font-semibold text-gray-900">
                    {isUnread ? "🔔 " : "✔️ "} {item.title}
                  </Text>

                  <Text className="text-sm text-gray-600">
                    {item.body}
                  </Text>

                  <View className="flex-row items-center justify-between mt-2">
                    <Text className="text-xs text-gray-400">
                      {new Date(item.created_at).toLocaleString()}
                    </Text>

                    <Text
                      onPress={(e) => {
                        e.stopPropagation();
                        removeNotification(item.id);
                      }}
                      className="text-xs text-red-400"
                    >
                      Delete
                    </Text>
                  </View>
                </TouchableOpacity>
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