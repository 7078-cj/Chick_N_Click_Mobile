import AuthContext from "@/contexts/AuthContext";
import { Redirect, Slot } from "expo-router";
import { useContext } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProtectedLayout() {
  const auth = useContext(AuthContext);
  const user = auth?.user;

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return <SafeAreaView className="flex-1 p-2"><Slot/></SafeAreaView>;
}
