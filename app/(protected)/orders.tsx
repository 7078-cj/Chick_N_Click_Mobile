import OrdersList from "@/components/OrderList";
import { TabContext } from "@/contexts/TabContext";
import React, { useContext, useEffect } from "react";
import { Text, View } from "react-native";

export default function orders() {
  const tab = useContext(TabContext);

  useEffect(() => {
    tab?.setActive("Orders");
  }, []);
  return (
    <View className="flex-1 px-4 pt-3 bg-gray-100">
      <View className="mb-2">
        <Text className="text-2xl font-extrabold text-gray-900">Your Orders</Text>
        <Text className="text-sm text-gray-500">
          Track your latest food orders in real time.
        </Text>
      </View>
      <OrdersList />
    </View>
  );
}
