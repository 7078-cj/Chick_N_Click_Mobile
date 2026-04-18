import { COLORS } from "@/constants/theme";
import AuthContext from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useContext } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function Header() {
  const auth = useContext(AuthContext);
  const firstName = auth?.user?.first_name?.trim();
  const greetName = firstName ? firstName.split(/\s+/)[0] : null;

  return (
    <View
      className="flex-row items-center justify-between px-4 py-3 border-b bg-white"
      style={{
        borderBottomColor: "rgba(0, 0, 0, 0.06)",
      }}
    >
      <View className="flex-1 pr-2">
        <Text className="text-xs tracking-wide text-gray-600">
          {greetName ? (
            <>
              Hi,{" "}
              <Text className="font-semibold text-gray-900">{greetName}</Text>
            </>
          ) : (
            "Welcome"
          )}
        </Text>
        <Text className="mt-0.5 text-xl font-extrabold text-gray-900">
          Chick N{" "}
          <Text style={{ color: COLORS.primary }}>Click</Text>
        </Text>
        <Text
          className="mt-0.5 text-xs font-medium"
          style={{ color: COLORS.primary }}
          numberOfLines={1}
        >
          Don&apos;t wait — order your food!
        </Text>
      </View>
      <View className="flex-row items-center gap-2">
        <TouchableOpacity
          onPress={() => router.push("/(protected)/notification")}
          className="items-center justify-center w-10 h-10 rounded-full bg-brand-surface border border-gray-100"
        >
          <Ionicons name="notifications-outline" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
