import { CategoryCard } from "@/components/CategoryCard";
import CategoryFoodModal from "@/components/CategoryFoodModal";
import { TabContext } from "@/contexts/TabContext";
import { useFood } from "@/hooks/useFood";
import React, { useContext, useEffect, useState } from "react";
import { Modal, ScrollView, Text, View } from "react-native";

export default function Index() {
  const foodCtx = useFood();
  const categories = foodCtx?.categories || [];
  const tab = useContext(TabContext);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategoryName, setSelectedCategoryName] = useState("");

  const pickCategoryIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("drink")) return "local-drink";
    if (n.includes("side")) return "restaurant-menu";
    if (n.includes("add")) return "add-circle-outline";
    if (n.includes("chicken")) return "lunch-dining";
    return "category";
  };

  useEffect(() => {
    tab?.setActive("Menu");
  }, []);

  return (
    <>
      <ScrollView className="flex-1 bg-gray-100">
        {/* Header */}
        <View className="px-4 pt-3 pb-4 bg-amber-200 border-b border-amber-300">
          <Text className="text-xs tracking-wider text-gray-600 uppercase">
            Delicious Picks
          </Text>
          <Text className="text-3xl font-extrabold text-gray-800">Menu</Text>
          <Text className="mt-1 text-sm text-gray-700">
            Choose your favorites and order in seconds.
          </Text>
        </View>

        {/* Category Cards */}
        <View className="gap-4 px-4 pb-10 mt-5">
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
                  iconName={pickCategoryIcon(cat.name || "")}
                  itemCount={
                    (foodCtx?.foods || []).filter((f: any) =>
                      f.categories?.some(
                        (c: any) =>
                          c?.name?.toLowerCase() === (cat.name || "").toLowerCase(),
                      ),
                    ).length
                  }
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
