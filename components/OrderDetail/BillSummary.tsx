import { AppText } from "@/components/typography";
import React from "react";
import { View } from "react-native";
import { formatCurrency } from "../../utils/Distance";
import { Divider, SectionLabel } from "./ui";

type BillSummaryProps = {
  foodSubtotal: number;
  deliveryPrice: number;
  totalPrice: number;
  isDelivery: boolean;
  extraKm: number;
};

export function BillSummary({
  foodSubtotal,
  deliveryPrice,
  totalPrice,
  isDelivery,
  extraKm,
}: BillSummaryProps) {
  return (
    <View className="p-4 mb-5 rounded-2xl border border-gray-100">
      <SectionLabel label="Bill summary" />

      <View className="flex-row justify-between mb-2">
        <AppText className="text-sm text-gray-500">Food subtotal</AppText>
        <AppText className="text-sm font-semibold text-gray-800">
          {formatCurrency(foodSubtotal)}
        </AppText>
      </View>

      {isDelivery ? (
        <View className="flex-row justify-between mb-2">
          <View className="flex-row items-center gap-1">
            <AppText className="text-sm text-gray-500">Delivery fee</AppText>
            {extraKm > 0 ? (
              <View className="px-1.5 py-0.5 rounded bg-orange-50">
                <AppText className="text-[10px] font-bold text-orange-500">
                  +{extraKm} km
                </AppText>
              </View>
            ) : null}
          </View>
          <AppText className="text-sm font-semibold text-gray-800">
            {formatCurrency(deliveryPrice)}
          </AppText>
        </View>
      ) : null}

      <Divider />

      <View className="flex-row justify-between items-center">
        <AppText className="text-base font-bold text-gray-900">Total</AppText>
        <AppText className="text-xl font-extrabold text-orange-500">
          {formatCurrency(totalPrice)}
        </AppText>
      </View>
    </View>
  );
}
