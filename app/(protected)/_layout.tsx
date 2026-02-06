import Tabs from "@/components/Tabs";
import { Redirect, Slot } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProtectedLayout() {
  const user = null;

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return <SafeAreaView><Slot/><Tabs/></SafeAreaView>;
}
