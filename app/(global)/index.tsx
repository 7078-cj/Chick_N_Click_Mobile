import { CategoryCard } from "@/components/CategoryCard";
import CategoryFoodModal from "@/components/CategoryFoodModal";
import { useFood } from "@/hooks/useFood";
import React, { useState } from "react";
import { Modal, ScrollView, Text, View } from "react-native";

export default function Index() {
  const foodCtx = useFood();
  const categories = foodCtx?.categories || [];

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategoryName, setSelectedCategoryName] = useState("");

  return (
    <>
      <ScrollView className="flex-1 bg-gray-100">
        {/* Header */}
        <View className="px-4 py-2 bg-amber-200">
          <Text className="text-2xl font-extrabold text-gray-800">Menu</Text>
        </View>

        {/* Category Cards */}
        <View className="gap-4 px-4 pb-8 mt-5">
          {categories.length === 0
            ? [0, 1].map((i) => (
                <CategoryCard
                  key={i}
                  label="LOADING"
                  title="Loading..."
                  bgColor={i % 2 === 0 ? "#F5C842" : "#F5A97F"}
                />
              ))
            : categories.map((cat: any, i: number) => (
                <CategoryCard
                  key={cat.id ?? i}
                  label={cat.label ?? cat.name?.toUpperCase()}
                  title={cat.name}
                  description={cat.description}
                  bgColor={i % 2 === 0 ? "#F5C842" : "#F5A97F"}
                  onPress={() => {
                    foodCtx?.setSelectedCategory?.(cat.value);
                    setSelectedCategoryName(cat.name);
                    setModalVisible(true);
                  }}
                />
              ))}
        </View>
      </ScrollView>

      {/* ✅ Modal */}
      <Modal visible={modalVisible} animationType="slide">
        <CategoryFoodModal
          categoryName={selectedCategoryName}
          onClose={() => {
            setModalVisible(false);
            foodCtx?.resetFilters();
          }}
        />
      </Modal>
    </>
  );
}
