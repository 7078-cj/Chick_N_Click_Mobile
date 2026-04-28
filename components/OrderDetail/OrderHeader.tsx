import { AppText } from "@/components/typography";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import type { Order } from "../../types/Order";
import { paymentColor, statusColor } from "../../utils/Distance";
import { StatusBadge } from "./ui";

type OrderHeaderProps = {
  order: Order;
  isDelivery: boolean;
  onClose: () => void;
};

export function OrderHeader({ order, isDelivery, onClose }: OrderHeaderProps) {
  const orderStatus = order.status?.toLowerCase() ?? "";
  const paymentStatus = (order.payment_status ?? "pending").toLowerCase();
  const { bg: statusBg, text: statusText } = statusColor(orderStatus);
  const { bg: payBg, text: payText } = paymentColor(paymentStatus);

  return (
    <View className="px-5 pt-2 pb-3 border-b border-gray-100">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-4">
          <AppText className="text-xl font-extrabold text-gray-900 tracking-tight">
            Order #{order.id}
          </AppText>
          <View className="flex-row items-center gap-2 mt-1 flex-wrap">
            {order.reference_id ? (
              <View className="flex-row items-center gap-1 px-2 py-0.5 rounded-md bg-orange-50 border border-orange-100">
                <Ionicons name="receipt-outline" size={10} color="#ea580c" />
                <AppText className="text-[10px] font-bold text-orange-600 tracking-wide">
                  {order.reference_id}
                </AppText>
              </View>
            ) : null}
            <AppText className="text-xs text-gray-400">
              {new Date(order.created_at).toLocaleString()}
            </AppText>
          </View>
        </View>

        <TouchableOpacity
          onPress={onClose}
          className="items-center justify-center w-9 h-9 rounded-full bg-gray-100 mt-0.5"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <View className="flex-row flex-wrap gap-2 mt-3">
        <StatusBadge
          label={isDelivery ? "🛵  Delivery" : "🏪  Pickup"}
          bg="bg-orange-100"
          text="text-orange-800"
        />
        <StatusBadge
          label={orderStatus.toUpperCase() || "—"}
          bg={statusBg}
          text={statusText}
        />
        <StatusBadge
          label={`Payment: ${paymentStatus}`}
          bg={payBg}
          text={payText}
        />
      </View>
    </View>
  );
}
