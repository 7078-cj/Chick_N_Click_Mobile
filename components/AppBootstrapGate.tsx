import AuthContext from "@/contexts/AuthContext";
import { useFood } from "@/hooks/useFood";
import { useOrder } from "@/hooks/useOrder";
import React, { useContext } from "react";
import { View } from "react-native";
import AppLoadingScreen from "./AppLoadingScreen";

type Props = {
  children: React.ReactNode;
};

/**
 * Shows loading screen until auth is hydrated, menu API finished, food WS ready,
 * and (when logged in) order WS ready.
 */
export default function AppBootstrapGate({ children }: Props) {
  const auth = useContext(AuthContext);
  const food = useFood();
  const order = useOrder();

  const authHydrated = auth?.authHydrated ?? false;

  const bootstrapReady =
    authHydrated &&
    !food.isLoading &&
    food.foodSocketReady &&
    (!auth?.token || !auth?.user ? true : order.orderSocketReady);

  if (!bootstrapReady) {
    return (
      <View className="flex-1">
        <AppLoadingScreen />
      </View>
    );
  }

  return <>{children}</>;
}
