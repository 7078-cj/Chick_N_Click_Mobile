import { TabContext } from "@/contexts/TabContext";
import React, { useContext, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function checkout() {
  const tab = useContext(TabContext);

  useEffect(() => {
    tab?.setActive("Checkout");
  }, []);
  return (
    <View className="flex-1">
      <Text>checkout</Text>
    </View>
  );
}

const styles = StyleSheet.create({});
