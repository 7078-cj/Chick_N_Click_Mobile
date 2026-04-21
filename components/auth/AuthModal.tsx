import { TabContext } from "@/contexts/TabContext";
import { router } from "expo-router";
import React, { useContext, useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Login from "./Login";
import Register from "./Register";

type AuthModalProps = {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function AuthModal({
  visible,
  setVisible,
}: AuthModalProps) {
  const tab = useContext(TabContext);
  const [page, setPage] = useState<"login" | "sign-up">("login");

  const onClose = () => {
    setVisible(false);
    tab?.setActive("Menu");
    router.push("/");
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
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
          {/* CLOSE BUTTON */}
          <View
            className="items-end w-11/12"
            style={{ marginBottom: -20, zIndex: 20 }}
          >
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.7}
              className="items-center justify-center bg-white rounded-full shadow w-9 h-9"
              style={{ elevation: 4 }}
            >
              <View style={{ width: 14, height: 14, position: "relative" }}>
                <View
                  style={{
                    position: "absolute",
                    width: 14,
                    height: 1.5,
                    backgroundColor: "#6b7280",
                    top: 6,
                    transform: [{ rotate: "45deg" }],
                  }}
                />
                <View
                  style={{
                    position: "absolute",
                    width: 14,
                    height: 1.5,
                    backgroundColor: "#6b7280",
                    top: 6,
                    transform: [{ rotate: "-45deg" }],
                  }}
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* CARD + LOGO WRAPPER */}
          <View
            className="w-11/12 items-center"
            style={{ position: "relative" }}
          >
            {/* 🔥 FLOATING LOGO */}
            <View
              style={{
                position: "absolute",
                top: -45, // controls overlap
                alignSelf: "center",
                zIndex: 30,
                backgroundColor: "#fff",
                borderRadius: 50,
                padding: 6,
                shadowColor: "#000",
                shadowOpacity: 0.15,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              <Image
                source={require("@/assets/images/Logo_Single.png")}
                style={{
                  width: 80,
                  height: 80,
                  resizeMode: "contain",
                }}
              />
            </View>

            {/* CARD */}
            <View
              className="items-center w-full px-6 bg-white shadow-lg rounded-3xl pb-7"
              style={{
                paddingTop: 60, // space for logo
              }}
            >
              {/* TITLE */}
              <Text className="mb-5 text-lg font-bold text-center text-gray-900">
                {page === "login"
                  ? "Sign in your Account"
                  : "Create an Account"}
              </Text>

              {/* CONTENT */}
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
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}