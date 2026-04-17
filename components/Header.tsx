import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function Header() {
  return (
    <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
      <View>
        <Text className="text-xs tracking-wider text-gray-500 uppercase">Welcome</Text>
        <Text className="text-xl font-extrabold text-gray-900">Chick N Click</Text>
      </View>
      <View className="flex-row items-center gap-2">
        <TouchableOpacity
          onPress={() => router.push("/(protected)/notification")}
          className="items-center justify-center w-10 h-10 bg-orange-50 border border-orange-100 rounded-full"
        >
          <Ionicons name="notifications-outline" size={20} color="#ea580c" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
