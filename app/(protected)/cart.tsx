import CartList from "@/components/CartList";
import { TabContext } from "@/contexts/TabContext";
import { useCart } from "@/hooks/useCart";
import { router } from "expo-router";
import React, { useContext, useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function Cart() {
  const CartContext = useCart();
  const tab = useContext(TabContext);

  useEffect(() => {
    tab?.setActive("Cart");
  }, []);

  return (
    <>
      <View className="justify-between flex-1 px-4 pt-6 bg-gray-100">
        {/* Cart List */}
        <CartList />
      </View>
      {/* Bottom Button */}
      <View className="absolute bottom-[15%] left-[55%] right-0 p-4 w-[45%] border-gray-300 items-center">
        <TouchableOpacity
          disabled={CartContext.cart.length < 1}
          onPress={() => router.push("/(protected)/checkout")}
          className={`px-8 py-4 rounded-full ${
            CartContext.cart.length < 1 ? "bg-orange-200" : "bg-orange-400"
          }`}
        >
          <Text className="text-base font-semibold text-white">
            {CartContext.placingOrder ? "Placing Order..." : "Confirm"}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
