import FoodList from "@/components/FoodList";
import React from "react";
import { Text, View } from "react-native";

export default function index() {
  return (
    <View className="flex-col justify-start flex-1 bg-gray-100">
      
      <View className="px-4 py-2 bg-amber-200">
        <Text className="text-2xl font-extrabold text-gray-800">Menu</Text>
      </View>

      <FoodList />
      
    </View>
  );
}
