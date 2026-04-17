import { Ionicons } from "@expo/vector-icons";
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
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-amber-200 border-b border-amber-300">
        <View>
          <Text className="text-xl font-extrabold text-gray-800">{categoryName}</Text>
          <Text className="text-xs text-gray-600">
            {foods.length} item{foods.length !== 1 ? "s" : ""} found
          </Text>
        </View>

        <TouchableOpacity
          onPress={onClose}
          className="items-center justify-center w-9 h-9 rounded-full bg-white/70"
        >
          <Ionicons name="close" size={18} color="#1f2937" />
        </TouchableOpacity>
      </View>

      {/* Food List */}

      {foods.length === 0 ? (
        <View className="items-center justify-center flex-1 px-6">
          <Ionicons name="restaurant-outline" size={36} color="#9ca3af" />
          <Text className="mt-3 text-center text-gray-500">
            No foods found in this category
          </Text>
        </View>
      ) : (
        <FoodList />
      )}
    </View>
  );
}
