import { Food } from "@/types/Food";
import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import AddToCartModal from "./AddToCartModal";

type FoodCardProps = {
  food: Food;
};

const FoodCard: React.FC<FoodCardProps> = ({ food }) => {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setAddOpen(true)}
        className="mb-4 bg-white rounded-2xl shadow"
      >
        {/* IMAGE */}
        <View className="relative">
          <Image
            source={{
              uri:
                food.thumbnail ||
                "https://via.placeholder.com/300x200?text=No+Image",
            }}
            className="w-full h-40 rounded-t-2xl"
          />

          {/* PRICE TAG */}
          <View className="absolute bottom-2 right-2 bg-amber-500 px-3 py-1 rounded-full">
            <Text className="text-white font-bold">₱{food.price}</Text>
          </View>
        </View>

        {/* CONTENT */}
        <View className="p-3">
          <Text className="text-lg font-bold mb-1">
            {food.food_name}
          </Text>

          {food.description && (
            <Text
              numberOfLines={2}
              className="text-sm text-gray-500 mb-2"
            >
              {food.description}
            </Text>
          )}

          {/* CATEGORY CHIPS */}
          {food.categories && food.categories.length > 0 && (
            <View className="flex-row flex-wrap gap-1 mb-2">
              {food.categories.map((cat) => (
                <View
                  key={cat.id}
                  className="bg-amber-100 px-2 py-1 rounded-md"
                >
                  <Text className="text-xs text-amber-700">
                    {cat.name}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* CTA BUTTON */}
          <TouchableOpacity
            onPress={() => setAddOpen(true)}
            className="mt-2 bg-amber-500 py-2 rounded-xl items-center"
          >
            <Text className="text-white font-semibold">
              Add to Cart
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* MODAL */}
      <AddToCartModal
        food={food}
        opened={addOpen}
        setOpened={setAddOpen}
      />
    </>
  );
};

export default FoodCard;