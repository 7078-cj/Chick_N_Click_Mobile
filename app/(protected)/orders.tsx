import OrdersList from "@/components/OrderList";
import { TabContext } from "@/contexts/TabContext";
import React, { useContext, useEffect } from "react";
import { StyleSheet, View } from "react-native";

export default function orders() {
  const tab = useContext(TabContext);

  useEffect(() => {
    tab?.setActive("Orders");
  }, []);
  return (
    <View className="flex-1">
      <OrdersList />
    </View>
  );
}

const styles = StyleSheet.create({});
