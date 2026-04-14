import { useFood } from "@/hooks/useFood";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

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
      <ScrollView className="px-4 py-4">
        {foods.length === 0 ? (
          <Text className="mt-10 text-center text-gray-500">
            No foods found in this category
          </Text>
        ) : (
          foods.map((food: any) => (
            <View key={food.id} className="p-4 mb-3 bg-gray-100 rounded-xl">
              <Text className="text-lg font-bold text-gray-800">
                {food.food_name}
              </Text>

              {food.description && (
                <Text className="mt-1 text-sm text-gray-600">
                  {food.description}
                </Text>
              )}

              {food.price && (
                <Text className="mt-2 font-semibold text-amber-600">
                  ₱ {food.price}
                </Text>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
