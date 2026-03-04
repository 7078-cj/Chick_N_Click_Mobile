import { useOrder } from "@/hooks/useOrder";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import OrderCard from "./OrderCard";

 const statusColors = {
    pending: "yellow",
    approved: "blue",
    declined: "red",
    completed: "green",
    cancelled: "gray",
  };

export default function OrdersList() {
    const orderContext = useOrder()
  return (
    <View className="w-full">
      {orderContext.orders?.length > 0 ? (
        <ScrollView
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-col w-full space-y-4">
            {orderContext.orders.map((order:any) => (
              <OrderCard
                key={order.id}
                order={order}
                statusColors={statusColors}
                cancelOrder={orderContext.cancelOrder}
              />
            ))}
          </View>
        </ScrollView>
      ) : (
        <View className="items-center justify-center flex-1">
          <Text className="text-center text-gray-500">No orders found.</Text>
        </View>
      )}
    </View>
  );
}