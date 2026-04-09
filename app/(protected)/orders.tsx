import OrdersList from "@/components/OrderList";
import { TabContext } from "@/contexts/TabContext";
import React, { useContext, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function orders() {
  const tab = useContext(TabContext);

  useEffect(() => {
    tab?.setActive("Orders");
  }, []);
  return (
    <View className="h-full">
      <Text>orders</Text>
      <OrdersList />
    </View>
  );
}

const styles = StyleSheet.create({});
