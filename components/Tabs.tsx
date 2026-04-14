import { Href } from "expo-router";
import React from "react";
import { View } from "react-native";
import TabButtons from "./TabButtons";

export default function Tabs() {
  const paths: { label: string; destination: Href }[] = [
    { label: "Menu", destination: "/" },
    { label: "Cart", destination: "/(protected)/cart" },
    { label: "Orders", destination: "/(protected)/orders" },
    { label: "Profile", destination: "/(protected)/profile" },
  ];

  return (
    <View className="absolute items-center w-full bottom-[6%]">
      <View className="flex-row bg-orange-500 rounded-full px-4 py-2 w-[90%] justify-between items-center shadow-lg">
        {paths.map((path, index) => (
          <TabButtons
            key={index}
            label={path.label}
            destination={path.destination}
          />
        ))}
      </View>
    </View>
  );
}
