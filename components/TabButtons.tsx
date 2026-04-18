import { COLORS } from "@/constants/theme";
import { useTab } from "@/hooks/useTab";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";

export type TabButtonsProps = {
  label: string;
  destination: Href;
};

const ICONS: Record<string, any> = {
  Menu: (props: any) => <Ionicons name="restaurant-outline" {...props} />,
  Cart: (props: any) => <Feather name="shopping-cart" {...props} />,
  Orders: (props: any) => <Ionicons name="receipt-outline" {...props} />,
  Profile: (props: any) => <Feather name="user" {...props} />,
};

export default function TabButtons({ label, destination }: TabButtonsProps) {
  const tab = useTab();
  const isActive = tab.active === label;

  const handlePress = () => {
    tab.setActive(label);
    router.push(destination);
  };

  const Icon = ICONS[label];

  const inactive = "#9CA3AF";

  return (
    <Pressable onPress={handlePress} className="items-center flex-1">
      <View
        className={`w-[64px] h-14 rounded-2xl items-center justify-center ${
          isActive ? "bg-orange-50" : ""
        }`}
      >
        <Icon size={22} color={isActive ? COLORS.primary : inactive} />
        <Text
          className={`text-[10px] mt-1 ${
            isActive ? "font-semibold text-brand" : "text-gray-500"
          }`}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
