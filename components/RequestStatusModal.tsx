import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";

type RequestStatusModalProps = {
  visible: boolean;
  title: string;
  message: string;
  type?: "success" | "error" | "info";
  buttonText?: string;
  onClose: () => void;
};

export default function RequestStatusModal({
  visible,
  title,
  message,
  type = "info",
  buttonText = "OK",
  onClose,
}: RequestStatusModalProps) {
  const accentColor =
    type === "success" ? "bg-green-500" : type === "error" ? "bg-red-500" : "bg-orange-500";

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View className="items-center justify-center flex-1 px-6 bg-black/40">
        <View className="w-full p-5 bg-white shadow rounded-2xl">
          <View className={`w-10 h-1.5 rounded-full mb-4 ${accentColor}`} />
          <Text className="mb-2 text-lg font-bold text-gray-900">{title}</Text>
          <Text className="mb-5 text-sm leading-5 text-gray-600">{message}</Text>
          <TouchableOpacity
            onPress={onClose}
            className={`items-center py-3 rounded-xl ${accentColor}`}
          >
            <Text className="font-semibold text-white">{buttonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
