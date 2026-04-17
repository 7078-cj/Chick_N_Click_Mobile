// app/_layout.tsx
import Header from "@/components/Header";
import Tabs from "@/components/Tabs";
import { AddOnProvider } from "@/contexts/AddOnContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { FoodProvider } from "@/contexts/FoodContext";
import { OrderProvider } from "@/contexts/OrderContext";
import { TabProvider } from "@/contexts/TabContext";
import { Stack } from "expo-router";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import "../global.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TabProvider>
      <AuthProvider>
        <FoodProvider>
          <OrderProvider>
            <CartProvider>
              <AddOnProvider>
                <SafeAreaView className="flex-1 bg-gray-50">
                  <Header />
                  <Stack screenOptions={{ headerShown: false }} />
                  <Tabs />
                </SafeAreaView>
              </AddOnProvider>
            </CartProvider>
          </OrderProvider>
        </FoodProvider>
      </AuthProvider>
    </TabProvider>
  );
}
