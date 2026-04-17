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
    <View className="absolute items-center w-full bottom-[4.5%]">
      <View className="flex-row bg-orange-500 rounded-3xl px-3 py-2.5 w-[92%] justify-between items-center shadow-lg border border-orange-400">
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
