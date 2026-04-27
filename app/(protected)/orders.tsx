import { ScreenIntro } from "@/components/layout/ScreenIntro";
import OrdersList from "@/components/OrderList";
import { TabContext } from "@/contexts/TabContext";
import { useOrder } from "@/hooks/useOrder";
import React, { useContext, useEffect } from "react";
import { View } from "react-native";

export default function orders() {
  const tab = useContext(TabContext);
  const orders = useOrder()

  useEffect(() => {
    tab?.setActive("Orders");
    orders.fetchOrders()
  }, []);
  return (
    <View className="flex-1 bg-white">
      <ScreenIntro
        eyebrow="Orders"
        title="Your Orders"
        subtitle="Track your latest food orders in real time."
        accentTitle
      />
      <View className="flex-1 px-4 pt-2">
        <OrdersList />
      </View>
    </View>
  );
}
