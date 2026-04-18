import { CategoryCard } from "@/components/CategoryCard";
import CategoryFoodModal from "@/components/CategoryFoodModal";
import FoodCard from "@/components/FoodCard";
import { COLORS } from "@/constants/theme";
import { TabContext } from "@/contexts/TabContext";
import { useFood } from "@/hooks/useFood";
import { getCategoryMaterialIcon } from "@/utils/categoryIcon";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, {
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  findNodeHandle,
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

  const scrollRef = useRef<ScrollView>(null);
  const categoriesRef = useRef<View>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategoryName, setSelectedCategoryName] = useState("");

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

  const scrollToCategories = () => {
    const scrollNode = findNodeHandle(scrollRef.current);
    const catEl = categoriesRef.current;
    if (scrollNode == null || !catEl) return;
    catEl.measureLayout(
      scrollNode,
      (_x, y) => {
        scrollRef.current?.scrollTo({
          y: Math.max(0, y - 16),
          animated: true,
        });
      },
      () => {},
    );
  };

  const openCategory = (cat: any) => {
    foodCtx?.setSelectedCategory?.(cat.value);
    setSelectedCategoryName(cat.name);
    setModalVisible(true);
  };

  return (
    <>
      <ScrollView ref={scrollRef} className="flex-1 bg-white">
        {/* Header */}
        <View
          className="px-4 pt-3 pb-4 mb-1 bg-white border-b rounded-b-3xl"
          style={{ borderBottomColor: "rgba(0, 0, 0, 0.06)" }}
        >
          <Text className="text-xs tracking-wider text-gray-600 uppercase">
            Delicious picks
          </Text>
          <Text
            className="text-3xl font-extrabold"
            style={{ color: COLORS.primary }}
          >
            Menu
          </Text>
          <Text className="mt-1 text-sm text-gray-600">
            Choose your favorites and order in seconds.
          </Text>

          <View
            className="flex-row items-center gap-2 px-3 py-2.5 mt-3 rounded-2xl border border-gray-100"
            style={{ backgroundColor: COLORS.surface }}
          >
            <Ionicons name="search" size={20} color={COLORS.primary} />
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

        {/* Normal: categories + hero */}
        {!isSearching ? (
          <View className="gap-4 px-4 pb-10 mt-4">


            <View ref={categoriesRef}>
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-lg font-bold text-gray-900">
                  Categories
                </Text>
              </View>
              {categories.length > 0 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 4, gap: 12 }}
                >
                  {categories.map((cat: any, i: number) => {
                    const itemCount = (foodCtx?.foods || []).filter(
                      (f: any) =>
                        f.categories?.some(
                          (c: any) =>
                            c?.name?.toLowerCase() ===
                            (cat.name || "").toLowerCase(),
                        ),
                    ).length;
                    const iconName = getCategoryMaterialIcon(cat.name || "");
                    return (
                      <TouchableOpacity
                        key={cat.id ?? i}
                        activeOpacity={0.88}
                        onPress={() => openCategory(cat)}
                        className="items-center justify-center px-3 py-3 rounded-2xl"
                        style={{
                          width: 112,
                          backgroundColor: COLORS.surface,
                          minHeight: 118,
                        }}
                      >
                        <MaterialIcons
                          name={iconName}
                          size={36}
                          color={COLORS.primary}
                        />
                        <Text
                          className="mt-2 text-sm font-bold text-center text-gray-900"
                          numberOfLines={2}
                        >
                          {cat.name}
                        </Text>
                        <Text className="mt-1 text-xs text-gray-500">
                          {itemCount} items
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              ) : null}
            </View>

            <Text className="mt-2 mb-1 text-lg font-bold text-gray-900">
              Browse all
            </Text>

            {categories.length === 0
              ? [0, 1].map((i) => (
                  <CategoryCard
                    key={i}
                    label="LOADING"
                    title="Loading..."
                    bgColor={i % 2 === 0 ? "#FFAF42" : "#FF8D03"}
                  />
                ))
              : categories.map((cat: any, i: number) => (
                  <CategoryCard
                    key={cat.id ?? i}
                    label={cat.label ?? cat.name?.toUpperCase()}
                    title={cat.name}
                    description={cat.description}
                    iconName={getCategoryMaterialIcon(cat.name || "")}
                    itemCount={
                      (foodCtx?.foods || []).filter((f: any) =>
                        f.categories?.some(
                          (c: any) =>
                            c?.name?.toLowerCase() ===
                            (cat.name || "").toLowerCase(),
                        ),
                      ).length
                    }
                    bgColor={i % 2 === 0 ? "#FF8D03" : "#FE6B00"}
                    onPress={() => openCategory(cat)}
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
                    iconName={getCategoryMaterialIcon(cat.name || "")}
                    itemCount={
                      (foodCtx?.foods || []).filter((f: any) =>
                        f.categories?.some(
                          (c: any) =>
                            c?.name?.toLowerCase() ===
                            (cat.name || "").toLowerCase(),
                        ),
                      ).length
                    }
                    bgColor={i % 2 === 0 ? "#FF8D03" : "#FE6B00"}
                    onPress={() => openCategory(cat)}
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
