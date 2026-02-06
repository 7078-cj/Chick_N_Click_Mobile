import { Redirect, Slot } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProtectedLayout() {
  const user = false;

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return <SafeAreaView className="flex-1 p-2"><Slot/></SafeAreaView>;
}
