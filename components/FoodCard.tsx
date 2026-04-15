import { COLORS, SHADOW } from "@/constants/theme";
import { Food } from "@/types/Food";
import React, { useRef, useState } from "react";
import {
  Animated,
  Text,
  TouchableWithoutFeedback,
  View
} from "react-native";
import AddToCartModal from "./AddToCartModal";

type Props = {
  food: Food;
};

const FoodCard: React.FC<Props> = ({ food }) => {
  const [addOpen, setAddOpen] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

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
              marginBottom: 20,
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
              <Text style={{ color: "#fff", fontSize: 12 }}>
                AVAILABLE
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
              }}
            >
              {food.description}
            </Text>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 10,
              }}
            >
              <Text style={{ fontSize: 11, color: "#9CA3AF" }}>
                {food.categories?.map((c) => c.name).join(", ")}
              </Text>

              <Text
                style={{
                  color: COLORS.secondary,
                  fontWeight: "bold",
                  fontSize: 18,
                }}
              >
                ₱{food.price}
              </Text>
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