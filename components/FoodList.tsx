import { TAB_BAR_SCROLL_INSET } from "@/constants/theme";
import { useFood } from "@/hooks/useFood";
import React from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import FoodCard from "./FoodCard";

const FoodList: React.FC = () => {
  const foodCtx = useFood();

  if (!foodCtx) return null;

  const { filteredFoods, isLoading } = foodCtx;

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#FD5602" />
        <Text className="mt-2 text-gray-500">Loading foods...</Text>
      </View>
    );
  }

  if (!filteredFoods || filteredFoods.length === 0) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-500">No food available</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={filteredFoods}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => <FoodCard food={item} />}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: TAB_BAR_SCROLL_INSET,
      }}
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
    />
  );
};

export default FoodList;