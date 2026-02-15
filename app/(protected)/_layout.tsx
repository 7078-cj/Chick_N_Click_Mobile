import AuthModal from "@/components/auth/AuthModal";
import AuthContext from "@/contexts/AuthContext";
import { Slot } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProtectedLayout() {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!user) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, []);

  return (
    <>
      <AuthModal visible={visible} setVisible={setVisible} />

      {user && (
        <SafeAreaView className="flex-1 p-2">
          <Slot />
        </SafeAreaView>
      )}
    </>
  );
}
