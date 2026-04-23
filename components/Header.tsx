import { COLORS } from "@/constants/theme";
import AuthContext from "@/contexts/AuthContext";
import { useNotification } from "@/hooks/useNotification";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useContext } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

export default function Header() {
  const auth = useContext(AuthContext);

  const firstName = auth?.user?.first_name?.trim();
  const greetName = firstName ? firstName.split(/\s+/)[0] : null;
  const { unreadCount } = useNotification();

  return (
    <View
      className="flex-row items-center justify-between px-4 border-b bg-white"
      style={{
        borderBottomColor: "rgba(0, 0, 0, 0.06)",
      }}
    >
      <View className="flex-1">
        <Image
          source={require("@/assets/images/Logo_banner.png")}
          style={{
            width: "40%",
            resizeMode: "contain",
          }}
        />
      </View>

      <View className="flex-row items-center gap-2">
        <TouchableOpacity
          onPress={() => router.push("/(protected)/notification")}
          className="items-center justify-center w-15 h-15 rounded-full bg-brand-surface border border-gray-100 p-2"
          style={{ position: "relative" }} 
        >
          <Ionicons
            name="notifications-outline"
            size={25}
            color={COLORS.primary}
          />

          {/* ✅ BADGE */}
          {unreadCount > 0 && (
            <View
              style={{
                position: "absolute",
                top: 4,
                right: 4,
                minWidth: 16,
                height: 16,
                borderRadius: 8,
                backgroundColor: "#EF4444",
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 3,
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 10,
                  fontWeight: "bold",
                }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}