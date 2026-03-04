import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import CartItemCard from "./CartCard";
import OrderDetailModal from "./OrdersDetailModal";


type OrderType = {
  id: number;
  status: string;
  created_at: string;
  estimated_time_of_completion?: number;
  type?: string;
  items?: any[];
  total_price?: number;
};

type OrderCardProps = {
  order: OrderType;
  statusColors: { [key: string]: string };
  cancelOrder: (orderId: number) => void;
};

export default function OrderCard({
  order,
  statusColors,
  cancelOrder,
}: OrderCardProps) {
  if (!order) return null;
  const [opened, setOpened] = useState(false);

  const statusColor = statusColors[order.status] || "gray";

  return (
    <View className="p-4 mb-4 bg-white rounded-lg shadow-md">
      {/* Header */}
      <View className="flex-row justify-between mb-2">
        <Text className="text-lg font-bold">Order #{order.id}</Text>
        <View
          
          className={`px-2 py-1 rounded-md ${statusColor}`}
          
        >
          <Text className="font-semibold text-white">
            {order.status?.toUpperCase() || "UNKNOWN"}
          </Text>
        </View>
      </View>

      <Text className="text-sm text-gray-500">
        Placed on {new Date(order.created_at).toLocaleString()}
      </Text>

      {/* ETA */}
      {order.estimated_time_of_completion && order.estimated_time_of_completion > 0 && (
        <View className="flex-row items-center mt-2">
          <View className="flex-row items-center px-2 py-1 bg-teal-500 rounded-lg">
            <MaterialCommunityIcons name="clock-outline" size={16} color="white" />
            <Text className="ml-1 text-sm text-white">
              {order.estimated_time_of_completion} min ETA
            </Text>
          </View>
        </View>
      )}

      {/* Divider */}
      <View className="my-2 border-t border-gray-300" />

      {/* Order Type */}
      {order.type && (
        <View className="flex-row items-center gap-1 mb-2">
          <MaterialCommunityIcons name="shopping-outline" size={18} />
          <Text className="font-semibold">Order Type:</Text>
          <Text>{order.type}</Text>
        </View>
      )}

      {/* Items */}
      <View className="flex-col gap-2 mt-2">
        {order.items?.map((item) => (
          <CartItemCard
            key={item.food_id}
            item={item}
            isOrder
            orderId={order.id}
          />
        ))}
      </View>

      {/* Divider */}
      <View className="my-2 border-t border-gray-300" />

      {/* Footer */}
      <View className="flex-row items-center justify-between mt-2">
        <Text className="font-bold text-md">
          Total: ₱{order.total_price ?? "0.00"}
        </Text>

        <View className="flex-row gap-2">
          {order.status === "pending" && (
            <Pressable
              className="flex-row items-center px-3 py-1 bg-red-400 rounded-md"
              onPress={() => cancelOrder(order.id)}
            >
              <Ionicons name="close" size={14} color="white" />
              <Text className="ml-1 text-xs text-white">Cancel Order</Text>
            </Pressable>
          )}

          <Pressable
            className={`px-3 py-1 rounded-md ${statusColor}`}
            
            onPress={() => setOpened(true)}
          >
            <Text className="text-xs text-white">View Details</Text>
          </Pressable>
        </View>
      </View>

      {/* Modal */}
      <OrderDetailModal opened={opened} order={order} setOpened={setOpened} />
    </View>
  );
}