import { FoodContext } from "@/contexts/FoodContext";
import React, { useContext } from "react";
import { FlatList, View } from "react-native";
import FoodCard from "./FoodCard";

const FoodList: React.FC = () => {
  const foodCtx = useContext(FoodContext);

  if (!foodCtx) return null;

  const { filteredFoods } = foodCtx;

  return (
    <View className="flex-1 px-4 pt-2">
      <FlatList
        data={filteredFoods}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <FoodCard food={item} />}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

export default FoodList;
