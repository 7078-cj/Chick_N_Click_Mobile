import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import OrderDetailModal from "./OrdersDetailModal";

export default function OrderCard({ order, cancelOrder }: any) {
  const [opened, setOpened] = useState(false);
  const firstItem = order?.items?.[0];
  const firstFood = firstItem?.food;
  const extraItemsCount = Math.max((order?.items?.length || 0) - 1, 0);

  const getBadgeColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "approved":
        return "bg-sky-500";
      case "declined":
        return "bg-red-500";
      case "cancelled":
        return "bg-gray-500";
      default:
        return "bg-amber-500";
    }
  };

  return (
    <View className="mx-4 mb-5 bg-[#EDE6D6] rounded-2xl p-4 shadow-md">
      {/* Status Badge */}
      <View className="absolute left-4 top-4">
        <View
          className={`px-3 py-1 rounded-md ${getBadgeColor(order.status)}`}
        >
          <Text className="text-xs font-bold text-white">
            {order.status.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Close Icon (optional) */}
      <View className="absolute right-4 top-4">
        <Ionicons name="receipt-outline" size={18} color="#6b7280" />
      </View>

      {/* Header */}
      <View className="items-center mt-6 mb-3">
        <Text className="text-base font-bold">Order #{order.id}</Text>
        <Text className="text-xs text-gray-500">
          {new Date(order.created_at).toLocaleString()}
        </Text>
      </View>

      {/* Item Capsule */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-[#E6D8B5] rounded-full">
        <View className="flex-row items-center gap-3">
          <Image
            source={{
              uri:
                firstFood?.thumbnail ||
                "https://via.placeholder.com/60x60?text=No+Img",
            }}
            className="w-12 h-12 rounded-full"
          />
          <View>
            <Text className="font-semibold">
              {firstFood?.food_name || "Order item"}
            </Text>
            {extraItemsCount > 0 && (
              <Text className="text-xs text-gray-500">
                +{extraItemsCount} more item{extraItemsCount > 1 ? "s" : ""}
              </Text>
            )}
          </View>
        </View>

        <Text className="font-bold">{firstItem?.quantity || 0}x</Text>
      </View>

      {/* Footer */}
      <View className="flex-row items-center justify-between mt-4">
        <View className="flex-row gap-2">
          {order.status === "pending" && (
            <Pressable
              onPress={() => cancelOrder(order.id)}
              className="px-4 py-2 bg-gray-400 rounded-full"
            >
              <Text className="text-xs text-white">Cancel</Text>
            </Pressable>
          )}

          <Pressable
            onPress={() => setOpened(true)}
            className="px-4 py-2 bg-yellow-400 rounded-full"
          >
            <Text className="text-xs font-semibold text-white">DETAILS</Text>
          </Pressable>
        </View>

        <Text className="font-bold">TOTAL: ₱{order.total_price}</Text>
      </View>

      <OrderDetailModal opened={opened} order={order} setOpened={setOpened} />
    </View>
  );
}
