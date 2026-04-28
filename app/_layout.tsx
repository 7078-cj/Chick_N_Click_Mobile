// app/_layout.tsx
import AppBootstrapGate from "@/components/AppBootstrapGate";
import Header from "@/components/Header";
import Tabs from "@/components/Tabs";
import ToastRoot from "@/components/ToastRoot";
import { AddOnProvider } from "@/contexts/AddOnContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { FoodProvider } from "@/contexts/FoodContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
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
            <NotificationProvider>
              <CartProvider>
                <AddOnProvider>
                  <AppBootstrapGate>

                    {/* ✅ App UI */}
                    <SafeAreaView className="flex-1 flex-col bg-white justify-start">
                      <Header />
                      <Stack screenOptions={{ headerShown: false }} />
                      <Tabs />
                    </SafeAreaView>

                    <ToastRoot />

                  </AppBootstrapGate>
                </AddOnProvider>
              </CartProvider>
            </NotificationProvider>
          </OrderProvider>
        </FoodProvider>
      </AuthProvider>
    </TabProvider>
  );
}
