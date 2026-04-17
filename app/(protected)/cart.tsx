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
    CartContext.fetchCart()
  }, []);

  return (
    <>
      <View className="justify-between flex-1 px-4 pt-3 bg-gray-100">
        <View className="px-2 mb-2">
          <Text className="text-2xl font-extrabold text-gray-900">Your Cart</Text>
          <Text className="text-sm text-gray-500">
            Review items before checkout.
          </Text>
        </View>
        {/* Cart List */}
        <CartList />
      </View>
      {/* Bottom Button */}
      <View className="absolute bottom-[14%] left-0 right-0 p-4 border-t border-gray-200 bg-white/95">
        <View className="flex-row items-center justify-between mb-2 px-1">
          <Text className="text-sm text-gray-500">Subtotal</Text>
          <Text className="text-lg font-extrabold text-gray-900">
            ₱{Number(CartContext.total || 0).toFixed(2)}
          </Text>
        </View>
        <TouchableOpacity
          disabled={CartContext.cart.length < 1}
          onPress={() => router.push("/(protected)/checkout")}
          className={`py-4 rounded-2xl items-center ${
            CartContext.cart.length < 1 ? "bg-orange-200" : "bg-orange-500"
          }`}
        >
          <Text className="text-base font-semibold text-white">
            {CartContext.placingOrder ? "Placing Order..." : "Proceed to Checkout"}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
