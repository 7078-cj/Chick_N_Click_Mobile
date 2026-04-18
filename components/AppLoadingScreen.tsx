import { COLORS } from "@/constants/theme";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

/**
 * Initial boot: menu data + websockets. Uses Happy Orange cream + deep orange accent.
 */
export default function AppLoadingScreen() {
  return (
    <View className="items-center justify-center flex-1 px-8 bg-white">
      <Text className="mb-3 text-5xl">🍗</Text>
      <Text
        className="mb-1 text-2xl font-extrabold text-center"
        style={{ color: COLORS.text }}
      >
        Chick N Click
      </Text>
      <Text className="mb-12 text-sm text-center text-gray-500">
        Loading menu…
      </Text>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );
}
