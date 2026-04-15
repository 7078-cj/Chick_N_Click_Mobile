import { Food } from "@/types/Food";
import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import AddToCartModal from "./AddToCartModal";

type FoodCardProps = {
  food: Food;
};

const FoodCard: React.FC<FoodCardProps> = ({ food }) => {
  const [addOpen, setAddOpen] = useState(false)
  return (
    <View className="flex-row p-4 mb-3 bg-white shadow rounded-xl">
      {food.thumbnail && (
        <Image
          source={{ uri: food.thumbnail }}
          className="w-20 h-20 mr-4 rounded-lg"
        />
      )}
      <View className="justify-center flex-1">
        <Text className="mb-1 text-lg font-bold">{food.food_name}</Text>
        {food.description && (
          <Text className="mb-1 text-sm text-gray-500">{food.description}</Text>
        )}
        {food.price !== undefined && (
          <Text className="mb-1 font-semibold text-gray-800">₱{food.price}</Text>
        )}
        {food.categories && food.categories.length > 0 && (
          <Text className="text-xs text-gray-400">
            {food.categories.map((cat) => cat.name).join(", ")}
          </Text>
        )}
      </View>
      <TouchableOpacity
        onPress={()=>setAddOpen(true)}
      >
        <Text>
          Add to Cart
        </Text>
      </TouchableOpacity>
      <AddToCartModal food={food} opened={addOpen} setOpened={setAddOpen}/>
    </View>
  );
};

export default FoodCard;
