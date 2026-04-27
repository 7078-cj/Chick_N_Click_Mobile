import { COLORS } from "@/constants/theme";
import React from "react";
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";

const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={[{ borderLeftColor: COLORS.primary }, props.style]}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      text1Style={{ fontSize: 15, fontWeight: "700", color: COLORS.text }}
      text2Style={{ fontSize: 13, color: COLORS.subtext }}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      text1Style={{ fontSize: 15, fontWeight: "700", color: COLORS.text }}
      text2Style={{ fontSize: 13, color: COLORS.subtext }}
    />
  ),
  info: (props: any) => (
    <BaseToast
      {...props}
      style={[{ borderLeftColor: COLORS.accent }, props.style]}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      text1Style={{ fontSize: 15, fontWeight: "600", color: COLORS.text }}
      text2Style={{ fontSize: 13, color: COLORS.subtext }}
    />
  ),
};

export default function ToastRoot() {
  return (
    <Toast
      config={toastConfig}
      topOffset={56}
    />
  );
}
