import { useTab } from "@/hooks/useTab";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import React from "react";
import { Pressable, View } from "react-native";

export type TabButtonsProps = {
  label: string;
  destination: Href;
};

const ICONS: Record<string, any> = {
  Menu: (props: any) => <Ionicons name="home-outline" {...props} />,
  Cart: (props: any) => <Feather name="shopping-cart" {...props} />,
  Orders: (props: any) => <Feather name="list" {...props} />,
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

  return (
    <Pressable onPress={handlePress} className="items-center flex-1">
      <View
        className={`w-14 h-14 rounded-full items-center justify-center ${
          isActive ? "border-2 border-white rounded-2xl" : ""
        }`}
      >
        <Icon size={24} color="white" />
      </View>
    </Pressable>
  );
}
