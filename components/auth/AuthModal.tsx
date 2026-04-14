import { TabContext } from "@/contexts/TabContext";
import { router } from "expo-router";
import React, { useContext, useState } from "react";
import { Modal, ScrollView, Text, View } from "react-native";
import Login from "./Login";
import Register from "./Register";

type AuthModalProps = {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

function LogoPlaceholder() {
  return (
    <View className="items-center justify-center w-20 h-20 bg-orange-100 border-4 border-white rounded-full shadow-md">
      <Text className="text-4xl">🍗</Text>
    </View>
  );
}

export default function AuthModal({ visible, setVisible }: AuthModalProps) {
  const tab = useContext(TabContext);
  const [page, setPage] = useState<"login" | "sign-up">("login");

  const onClose = () => {
    setVisible(false);
    tab?.setActive("Menu");
    router.push("/");
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View className="items-center justify-center flex-1 bg-black/40">
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 40,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          className="w-full"
        >
          {/* Floating logo */}
          <View className="z-10" style={{ marginBottom: -36 }}>
            <LogoPlaceholder />
          </View>

          {/* Card */}
          <View
            className="items-center w-11/12 px-6 bg-white shadow-lg rounded-3xl pb-7"
            style={{ paddingTop: 52 }}
          >
            <Text className="mb-5 text-lg font-bold text-center text-gray-900">
              {page === "login" ? "Sign in your Account" : "Create an Account"}
            </Text>

            <View className="w-full">
              {page === "login" ? (
                <Login
                  setVisible={setVisible}
                  onGoToSignUp={() => setPage("sign-up")}
                />
              ) : (
                <Register
                  onGoToLogin={() => setPage("login")}
                  setVisible={setVisible}
                />
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
