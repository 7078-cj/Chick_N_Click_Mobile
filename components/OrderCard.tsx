import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import OrderDetailModal from "./OrdersDetailModal";

export default function OrderCard({ order, cancelOrder }: any) {
  const [opened, setOpened] = useState(false);

  const isCompleted = order.status === "completed";

  return (
    <View className="mx-4 mb-5 bg-[#EDE6D6] rounded-2xl p-4 shadow-md">
      {/* Status Badge */}
      <View className="absolute left-4 top-4">
        <View
          className={`px-3 py-1 rounded-md ${
            isCompleted ? "bg-green-500" : "bg-gray-500"
          }`}
        >
          <Text className="text-xs font-bold text-white">
            {order.status.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Close Icon (optional) */}
      <View className="absolute right-4 top-4">
        <Ionicons name="close" size={18} />
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
            source={{ uri: order.items?.[0]?.image }}
            className="w-12 h-12 rounded-full"
          />
          <Text className="font-semibold">{order.items?.[0]?.name}</Text>
        </View>

        <Text className="font-bold">{order.items?.[0]?.quantity}x</Text>
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
