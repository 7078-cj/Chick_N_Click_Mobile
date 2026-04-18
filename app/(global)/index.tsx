import { CategoryCard } from "@/components/CategoryCard";
import CategoryFoodModal from "@/components/CategoryFoodModal";
import FoodCard from "@/components/FoodCard";
import { TabContext } from "@/contexts/TabContext";
import { useFood } from "@/hooks/useFood";
import { Ionicons } from "@expo/vector-icons";
import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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

  const searchTrim = (foodCtx.searchQuery || "").trim();
  const isSearching = searchTrim.length > 0;

  const filteredCategories = useMemo(() => {
    if (!isSearching) return categories;
    const q = searchTrim.toLowerCase();
    return categories.filter(
      (cat) =>
        cat.name?.toLowerCase().includes(q) ||
        cat.label?.toLowerCase().includes(q),
    );
  }, [categories, isSearching, searchTrim]);

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

          <View className="flex-row items-center gap-2 px-3 py-2 mt-3 bg-white border border-amber-300 rounded-2xl">
            <Ionicons name="search" size={20} color="#9ca3af" />
            <TextInput
              className="flex-1 py-1 text-base text-gray-900"
              placeholder="Search food or category..."
              placeholderTextColor="#9ca3af"
              value={foodCtx.searchQuery}
              onChangeText={foodCtx.setSearchQuery}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
            {isSearching ? (
              <TouchableOpacity
                onPress={() => foodCtx.setSearchQuery("")}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-circle" size={22} color="#9ca3af" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Normal: all categories */}
        {!isSearching ? (
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
                            c?.name?.toLowerCase() ===
                            (cat.name || "").toLowerCase(),
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
        ) : (
          <View className="px-4 pb-28 mt-4">
            <Text className="mb-3 text-sm text-gray-600">
              Results for &quot;{searchTrim}&quot;
            </Text>

            <Text className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Categories
            </Text>
            {filteredCategories.length === 0 ? (
              <Text className="mb-6 text-sm text-gray-500">
                No matching categories.
              </Text>
            ) : (
              <View className="gap-3 mb-6">
                {filteredCategories.map((cat: any, i: number) => (
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
                            c?.name?.toLowerCase() ===
                            (cat.name || "").toLowerCase(),
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
            )}

            <Text className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Foods
            </Text>
            {foodCtx.filteredFoods.length === 0 ? (
              <Text className="text-sm text-gray-500">No matching foods.</Text>
            ) : (
              foodCtx.filteredFoods.map((food) => (
                <FoodCard key={food.id} food={food} />
              ))
            )}
          </View>
        )}
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
