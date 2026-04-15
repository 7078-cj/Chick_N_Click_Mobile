import AuthContext from "@/contexts/AuthContext";
import { useAddOn } from "@/hooks/useAddOn";
import React, { useContext, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const url = process.env.EXPO_PUBLIC_API_URL;

const AddToCartModal = ({ food, opened, setOpened }: any) => {
  const authCtx = useContext(AuthContext);
  const { drinks = [], sides = [] } = useAddOn();

  const [quantity, setQuantity] = useState(1);
  const [orderSides, setOrderSides] = useState<any[]>([]);
  const [orderDrinks, setOrderDrinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const isSideOrDrink = food.categories?.some((cat: any) =>
    ["Sides", "Drinks"].includes(cat.name)
  );

  // ✅ Toggle item (add/remove)
  const toggleItem = (item: any, type: "side" | "drink") => {
    const list = type === "side" ? orderSides : orderDrinks;
    const setList = type === "side" ? setOrderSides : setOrderDrinks;

    const exists = list.some((i) => i.id === item.id);

    if (exists) {
      setList(list.filter((i) => i.id !== item.id));
    } else {
      if (list.length >= quantity) {
        alert(`Max ${quantity} ${type}s only`);
        return;
      }

      const newItem =
        type === "side"
          ? { id: item.id, name: item.food_name, price: item.price }
          : {
              id: item.id,
              name: item.food_name,
              size: "medium",
              price: item.price,
            };

      setList([...list, newItem]);
    }
  };

  // 💰 Compute total
  const total =
    food.price * quantity +
    orderSides.reduce((sum, s) => sum + (s.price || 0), 0) +
    orderDrinks.reduce((sum, d) => sum + (d.price || 0), 0);

  const handleAddToCart = async () => {
    if (!authCtx?.token) {
      alert("Please login first");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${url}/api/cart/add/${food.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authCtx.token}`,
        },
        body: JSON.stringify({
          quantity,
          sides: orderSides,
          drinks: orderDrinks,
        }),
      });

      if (res.ok) {
        setOpened(false);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to add to cart.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={opened} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/40">

        {/* SHEET */}
        <View className="bg-white rounded-t-3xl max-h-[92%]">

          {/* CLOSE */}
          <TouchableOpacity
            onPress={() => setOpened(false)}
            className="absolute right-4 top-4 z-10 bg-white p-2 rounded-full shadow"
          >
            <Text>✕</Text>
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false}>

            {/* 🔥 HERO IMAGE */}
            <View className="relative">
              <Image
                source={{
                  uri: food.thumbnail || "https://via.placeholder.com/300",
                }}
                className="w-full h-64"
              />
              <View className="absolute bottom-0 w-full bg-black/50 p-4">
                <Text className="text-white text-2xl font-bold">
                  {food.food_name}
                </Text>
                <Text className="text-white text-lg">₱{food.price}</Text>
              </View>
            </View>

            <View className="p-4">

              {/* DESCRIPTION */}
              <Text className="text-gray-500 mb-3">{food.description}</Text>

              {/* QUANTITY */}
              <View className="flex-row items-center mb-4">
                <TouchableOpacity
                  onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="bg-yellow-300 px-4 py-2 rounded-l-xl"
                >
                  <Text className="text-lg">-</Text>
                </TouchableOpacity>

                <Text className="px-6 font-bold text-lg">{quantity}</Text>

                <TouchableOpacity
                  onPress={() => setQuantity((q) => q + 1)}
                  className="bg-yellow-300 px-4 py-2 rounded-r-xl"
                >
                  <Text className="text-lg">+</Text>
                </TouchableOpacity>
              </View>

              {/* ADD-ONS */}
              {!isSideOrDrink && (
                <>
                  {/* SIDES */}
                  <Text className="font-bold text-lg mb-2">
                    Choose Sides ({orderSides.length}/{quantity})
                  </Text>

                  <View className="flex-row flex-wrap gap-2">
                    {sides.map((s: any) => {
                      const selected = orderSides.some(
                        (i) => i.id === s.id
                      );

                      return (
                        <TouchableOpacity
                          key={s.id}
                          onPress={() => toggleItem(s, "side")}
                          className={`w-[48%] rounded-xl p-2 border ${
                            selected
                              ? "border-amber-500 bg-amber-100"
                              : "border-gray-200"
                          }`}
                        >
                          <View className="relative">
                            <Image
                              source={{ uri: s.thumbnail }}
                              className="w-full h-24 rounded-lg"
                            />

                            {/* ✅ CHECK OVERLAY */}
                            {selected && (
                              <View className="absolute top-1 right-1 bg-amber-500 rounded-full px-2">
                                <Text className="text-white text-xs">✓</Text>
                              </View>
                            )}
                          </View>

                          <Text className="text-sm font-semibold mt-1">
                            {s.food_name}
                          </Text>
                          <Text className="text-xs text-gray-500">
                            ₱{s.price}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* DRINKS */}
                  <Text className="font-bold text-lg mt-4 mb-2">
                    Choose Drinks ({orderDrinks.length}/{quantity})
                  </Text>

                  <View className="flex-row flex-wrap gap-2">
                    {drinks.map((d: any) => {
                      const selected = orderDrinks.some(
                        (i) => i.id === d.id
                      );

                      return (
                        <TouchableOpacity
                          key={d.id}
                          onPress={() => toggleItem(d, "drink")}
                          className={`w-[48%] rounded-xl p-2 border ${
                            selected
                              ? "border-amber-500 bg-amber-100"
                              : "border-gray-200"
                          }`}
                        >
                          <View className="relative">
                            <Image
                              source={{ uri: d.thumbnail }}
                              className="w-full h-24 rounded-lg"
                            />

                            {selected && (
                              <View className="absolute top-1 right-1 bg-amber-500 rounded-full px-2">
                                <Text className="text-white text-xs">✓</Text>
                              </View>
                            )}
                          </View>

                          <Text className="text-sm font-semibold mt-1">
                            {d.food_name}
                          </Text>
                          <Text className="text-xs text-gray-500">
                            ₱{d.price}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </>
              )}
            </View>
          </ScrollView>

          {/* 🧾 STICKY FOOTER */}
          <View className="p-4 border-t bg-white">
            <TouchableOpacity
              onPress={handleAddToCart}
              disabled={loading}
              className="bg-amber-500 p-4 rounded-xl items-center"
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-bold text-lg">
                  Add to Cart • ₱{total}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AddToCartModal;