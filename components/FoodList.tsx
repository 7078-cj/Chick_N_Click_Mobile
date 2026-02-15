import { useFood } from "@/hooks/useFood";
import React from "react";
import { FlatList, Text, View } from "react-native";
import FoodCard from "./FoodCard";

const FoodList: React.FC = () => {
  const foodCtx = useFood();

  if (!foodCtx) return null;

  const { filteredFoods } = foodCtx;

  return (
    <View className="flex-1 px-4 pt-2">
      {
        foodCtx.isLoading ? <Text>loadingg</Text> : 
        <FlatList
          data={filteredFoods}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <FoodCard food={item} />}
          contentContainerStyle={{ paddingBottom: 20 }}
      />
      }
      
    </View>
  );
};

export default FoodList;
