import { COLORS, SHADOW } from "@/constants/theme";
import { Food } from "@/types/Food";
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
  const categoriesText =
    food.categories?.map((c) => c.name).join(" • ") || "Popular pick";

  const scale = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // 🎯 Press animation
  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  // 🖼 Fade-in image
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
        onPress={() => setAddOpen(true)}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <Animated.View
          style={[
            {
              transform: [{ scale }],
              backgroundColor: COLORS.card,
              borderRadius: 20,
              marginBottom: 14,
              overflow: "hidden",
            },
            SHADOW,
          ]}
        >
          {/* 🟡 TOP */}
          <View
            style={{
              backgroundColor: COLORS.accent,
              height: 130,
              justifyContent: "center",
              paddingHorizontal: 16,
            }}
          >
            {/* BADGE */}
            <View
              style={{
                position: "absolute",
                top: 12,
                left: 0,
                backgroundColor: COLORS.secondary,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderTopRightRadius: 8,
                borderBottomRightRadius: 8,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>
                AVAILABLE
              </Text>
            </View>

            <View
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                backgroundColor: "rgba(255,255,255,0.85)",
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 999,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: "800", color: "#B45309" }}>
                ₱{food.price}
              </Text>
            </View>

            {/* 🍗 FLOATING IMAGE */}
            <View
              style={[
                {
                  position: "absolute",
                  right: 10,
                  bottom: -25,
                  backgroundColor: "#fff",
                  borderRadius: 12,
                  padding: 4,
                },
                SHADOW,
              ]}
            >
              {/* Skeleton */}
              {!imgLoaded && (
                <View
                  style={{
                    width: 140,
                    height: 100,
                    backgroundColor: "#E5E7EB",
                    borderRadius: 10,
                  }}
                />
              )}

              <Animated.Image
                source={{
                  uri:
                    food.thumbnail ||
                    "https://via.placeholder.com/300",
                }}
                resizeMode="contain"
                onLoad={onImageLoad}
                style={{
                  width: 140,
                  height: 100,
                  opacity: fadeAnim,
                  position: imgLoaded ? "relative" : "absolute",
                }}
              />
            </View>
          </View>

          {/* ⚪ CONTENT */}
          <View style={{ padding: 16, paddingTop: 30 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: COLORS.text,
                paddingRight: 120,
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
                minHeight: 34,
              }}
            >
              {food.description || "Freshly prepared and ready to order."}
            </Text>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 12,
              }}
            >
              <Text
                numberOfLines={1}
                style={{
                  flex: 1,
                  fontSize: 11,
                  color: "#6B7280",
                  marginRight: 10,
                }}
              >
                {categoriesText}
              </Text>

              <View
                style={{
                  backgroundColor: "#F97316",
                  borderRadius: 999,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                }}
              >
                <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>
                  Add to Cart
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </TouchableWithoutFeedback>

      <AddToCartModal
        food={food}
        opened={addOpen}
        setOpened={setAddOpen}
      />
    </>
  );
};

export default FoodCard;