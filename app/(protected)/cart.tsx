import CartList from "@/components/CartList";
import { AppText } from "@/components/typography";
import { ScreenIntro } from "@/components/layout/ScreenIntro";
import { TabContext } from "@/contexts/TabContext";
import { useCart } from "@/hooks/useCart";
import { router } from "expo-router";
import React, { useContext, useEffect } from "react";
import { TouchableOpacity, View } from "react-native";

export default function Cart() {
  const CartContext = useCart();
  const tab = useContext(TabContext);

  useEffect(() => {
    tab?.setActive("Cart");
    CartContext.fetchCart()
  }, []);

  return (
    <>
      <View className="justify-between flex-1 bg-white">
        <ScreenIntro
          eyebrow="Cart"
          title="Your Cart"
          subtitle="Review items before checkout."
          accentTitle
        />
        <View className="flex-1 px-4 pt-2">
        {/* Cart List */}
        <CartList />
        </View>
      </View>
      {/* Bottom Button */}
      <View className="absolute bottom-[14%] left-0 right-0 p-4 border-t bg-white/95 border-brand-soft/30">
        <View className="flex-row items-center justify-between mb-2 px-1">
          <AppText className="text-sm text-gray-500">Subtotal</AppText>
          <AppText className="text-lg font-extrabold text-gray-900">
            ₱{Number(CartContext.total || 0).toFixed(2)}
          </AppText>
        </View>
        <TouchableOpacity
          disabled={CartContext.cart.length < 1}
          onPress={() => router.push("/(protected)/checkout")}
          className={`py-4 rounded-2xl items-center ${
            CartContext.cart.length < 1 ? "bg-brand-soft/50" : "bg-brand"
          }`}
        >
          <AppText className="text-base font-semibold text-white">
            {CartContext.placingOrder ? "Placing Order..." : "Proceed to Checkout"}
          </AppText>
        </TouchableOpacity>
      </View>
    </>
  );
}
