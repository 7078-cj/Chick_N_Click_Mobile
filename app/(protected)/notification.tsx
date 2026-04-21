import { ScreenIntro } from "@/components/layout/ScreenIntro";
import { TAB_BAR_SCROLL_INSET } from "@/constants/theme";
import { useNotification } from "@/hooks/useNotification";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  View,
} from "react-native";

export default function Notification() {
  const {
    loading,
    notifications,
    markAsRead,
    removeNotification,
  } = useNotification();

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
                    onPress={() => markAsRead(item.id)}
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
                      onPress={() => removeNotification(item.id)}
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