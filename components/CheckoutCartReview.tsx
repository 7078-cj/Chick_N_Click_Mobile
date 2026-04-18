import { COLORS, SHADOW_SOFT } from "@/constants/theme";
import { useCart } from "@/hooks/useCart";
import React from "react";
import { Image, Text, View } from "react-native";

type CartRow = {
  food_id: number;
  quantity?: number;
  price?: number;
  subtotal?: number;
  is_addon?: boolean;
  food_name?: string;
  thumbnail?: string;
  food?: { food_name?: string; thumbnail?: string; price?: number };
};

function lineTotal(item: CartRow) {
  const sub = Number(item.subtotal);
  if (Number.isFinite(sub)) return sub;
  const q = Number(item.quantity) || 0;
  const p = Number(item.price ?? item.food?.price ?? 0);
  return q * p;
}

export default function CheckoutCartReview() {
  const { cart } = useCart();

  if (!cart?.length) return null;

  return (
    <View
      className="p-4 mb-4 bg-white rounded-2xl border border-gray-100"
      style={SHADOW_SOFT}
    >
      <Text className="mb-3 text-base font-semibold text-gray-900">
        Order items
      </Text>
      <View className="gap-0">
        {(cart as CartRow[]).map((item, index) => {
          const name = item.food_name || item.food?.food_name || "Item";
          const uri =
            item.thumbnail ||
            item.food?.thumbnail ||
            "https://via.placeholder.com/96";
          const qty = Number(item.quantity) || 0;
          const unit = Number(item.price ?? item.food?.price ?? 0);
          const total = lineTotal(item);

          return (
            <View
              key={`${item.food_id}-${index}`}
              className={`flex-row items-center py-3 ${
                index < cart.length - 1 ? "border-b border-gray-100" : ""
              }`}
            >
              <Image
                source={{ uri }}
                className="rounded-xl bg-gray-100"
                style={{ width: 52, height: 52 }}
                resizeMode="cover"
              />
              <View className="flex-1 mx-3">
                {item.is_addon ? (
                  <Text
                    className="text-[10px] font-bold uppercase mb-0.5"
                    style={{ color: COLORS.subtext }}
                  >
                    Add-on
                  </Text>
                ) : null}
                <Text
                  className="text-sm font-semibold text-gray-900"
                  numberOfLines={2}
                >
                  {name}
                </Text>
                <Text className="mt-0.5 text-xs text-gray-500">
                  {qty} × P{unit.toFixed(2)}
                </Text>
              </View>
              <Text
                className="text-sm font-bold"
                style={{ color: COLORS.primary }}
              >
                P{total.toFixed(2)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
