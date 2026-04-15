import { useFood } from "@/hooks/useFood";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import FoodList from "./FoodList";

interface Props {
  categoryName: string;
  onClose: () => void;
}

export default function CategoryFoodModal({ categoryName, onClose }: Props) {
  const foodCtx = useFood();

  const foods = foodCtx?.filteredFoods || [];

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-amber-200">
        <Text className="text-xl font-extrabold text-gray-800">
          {categoryName}
        </Text>

        <TouchableOpacity onPress={onClose}>
          <Text className="text-lg font-bold">✕</Text>
        </TouchableOpacity>
      </View>

      {/* Food List */}

      {foods.length === 0 ? (
        <Text className="mt-10 text-center text-gray-500">
          No foods found in this category
        </Text>
      ) : (
        <FoodList />
      )}
    </View>
  );
}
