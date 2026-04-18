import { TAB_BAR_SCROLL_INSET } from "@/constants/theme";
import { useOrder } from "@/hooks/useOrder";
import React from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import OrderCard from "./OrderCard";

export default function OrdersList() {
  const orderContext = useOrder();

  if (orderContext.loading) {
    return (
      <View className="items-center justify-center flex-1">
        <ActivityIndicator size="large" color="#FD5602" />
        <Text className="mt-2 text-sm text-gray-500">Loading orders...</Text>
      </View>
    );
  }

  return (
    <View className="w-full">
      {orderContext.orders?.length > 0 ? (
        <ScrollView
          contentContainerStyle={{ paddingBottom: TAB_BAR_SCROLL_INSET }}
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-col w-full">
            {orderContext.orders.map((order: any) => (
              <OrderCard
                key={order.id}
                order={order}
                cancelOrder={orderContext.cancelOrder}
              />
            ))}
          </View>
        </ScrollView>
      ) : (
        <View className="items-center justify-center flex-1 px-6">
          <Text className="text-lg font-semibold text-gray-700">No orders yet</Text>
          <Text className="mt-1 text-sm text-center text-gray-500">
            Your placed orders will appear here.
          </Text>
        </View>
      )}
    </View>
  );
}