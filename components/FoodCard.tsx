import { COLORS, SHADOW_SOFT } from "@/constants/theme";
import { Food } from "@/types/Food";
import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  Animated,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import AddToCartModal from "./AddToCartModal";

type Props = {
  food: Food;
};

const FoodCard: React.FC<Props> = ({ food }) => {
  const [addOpen, setAddOpen] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const isAvailable = food.available !== 0; 

  const categoriesText =
    food.categories?.map((c) => c.name).join(" • ") || "Popular pick";

  const scale = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const onPressIn = () => {
    if (!isAvailable) return;
    Animated.spring(scale, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    if (!isAvailable) return;
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const onImageLoad = () => {
    setImgLoaded(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  return (
    <>
      <TouchableWithoutFeedback
        onPress={() => isAvailable && setAddOpen(true)} // ✅ block tap when unavailable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <Animated.View
          style={[
            {
              transform: [{ scale }],
              backgroundColor: isAvailable ? COLORS.card : "#F3F4F6", // ✅ gray bg
              borderRadius: 20,
              marginBottom: 14,
              paddingVertical: 14,
              paddingHorizontal: 14,
              flexDirection: "row",
              alignItems: "center",
              opacity: isAvailable ? 1 : 0.6, // ✅ dim entire card
            },
            SHADOW_SOFT,
          ]}
        >
          <View
            style={{
              width: 88,
              height: 88,
              borderRadius: 44,
              overflow: "hidden",
              backgroundColor: COLORS.surface,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {!imgLoaded ? (
              <View
                style={{
                  position: "absolute",
                  width: 88,
                  height: 88,
                  borderRadius: 44,
                  backgroundColor: "#E5E7EB",
                }}
              />
            ) : null}

            <Animated.Image
              source={{
                uri: food.thumbnail || "https://via.placeholder.com/300",
              }}
              resizeMode="cover"
              onLoad={onImageLoad}
              style={{
                width: 88,
                height: 88,
                borderRadius: 44,
                opacity: fadeAnim,
              }}
            />
          </View>

          <View style={{ flex: 1, marginLeft: 14, marginRight: 8 }}>
            <Text
              numberOfLines={1}
              style={{
                fontSize: 17,
                fontWeight: "800",
                color: isAvailable ? COLORS.text : "#9CA3AF", // ✅ gray text
              }}
            >
              {food.food_name}
            </Text>
            <Text
              numberOfLines={2}
              style={{
                fontSize: 13,
                color: COLORS.subtext,
                marginTop: 4,
                lineHeight: 18,
              }}
            >
              {food.description || "Freshly prepared and ready to order."}
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 10,
              }}
            >
              <Text
                numberOfLines={1}
                style={{
                  flex: 1,
                  fontSize: 11,
                  color: "#6B7280",
                  marginRight: 8,
                }}
              >
                {categoriesText}
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "800",
                  color: isAvailable ? COLORS.primary : "#9CA3AF", // ✅ gray price
                }}
              >
                ₱{food.price}
              </Text>
            </View>
          </View>

          {/* ✅ Add button — grayed out when unavailable */}
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: isAvailable ? COLORS.primary : "#D1D5DB",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isAvailable ? (
              <Ionicons name="add" size={22} color="#fff" />
            ) : (
              <Ionicons name="ban-outline" size={18} color="#9CA3AF" />
            )}
          </View>

          {/* ✅ Unavailable overlay label */}
          {!isAvailable && (
            <View
              style={{
                position: "absolute",
                top: 8,
                left: 8,
                backgroundColor: "#374151",
                borderRadius: 8,
                paddingHorizontal: 8,
                paddingVertical: 3,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}>
                Unavailable
              </Text>
            </View>
          )}
        </Animated.View>
      </TouchableWithoutFeedback>

      {/* ✅ Modal only mounts when available */}
      {isAvailable && (
        <AddToCartModal food={food} opened={addOpen} setOpened={setAddOpen} />
      )}
    </>
  );
};

export default FoodCard;