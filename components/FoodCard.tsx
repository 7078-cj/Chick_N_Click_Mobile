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
  const categoriesText =
    food.categories?.map((c) => c.name).join(" • ") || "Popular pick";

  const scale = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
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
              paddingVertical: 14,
              paddingHorizontal: 14,
              flexDirection: "row",
              alignItems: "center",
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
                  color: COLORS.primary,
                }}
              >
                ₱{food.price}
              </Text>
            </View>
          </View>

          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: COLORS.primary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="add" size={22} color="#fff" />
          </View>
        </Animated.View>
      </TouchableWithoutFeedback>

      <AddToCartModal food={food} opened={addOpen} setOpened={setAddOpen} />
    </>
  );
};

export default FoodCard;
