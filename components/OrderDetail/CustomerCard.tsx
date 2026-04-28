import { AppText } from "@/components/typography";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import type { OrderUser } from "../../types/Order";
import { SectionLabel } from "./ui";

type CustomerCardProps = {
  customerName: string;
  user?: OrderUser;
  estimatedTime?: number | string;
};

export function CustomerCard({
  customerName,
  user,
  estimatedTime,
}: CustomerCardProps) {
  return (
    <View className="mb-5 rounded-2xl bg-gray-50 overflow-hidden">
      <View className="p-4">
        <SectionLabel label="Customer" />

        <View className="flex-row items-center gap-3">
          {/* Avatar */}
          <View className="w-10 h-10 rounded-full bg-orange-100 items-center justify-center">
            <AppText className="text-base font-bold text-orange-600">
              {customerName.charAt(0).toUpperCase()}
            </AppText>
          </View>

          <View className="flex-1">
            <AppText className="text-sm font-semibold text-gray-900">
              {customerName}
            </AppText>
            {user?.email ? (
              <View className="flex-row items-center gap-1 mt-0.5">
                <Ionicons name="mail-outline" size={11} color="#9ca3af" />
                <AppText className="text-xs text-gray-500">
                  {user.email}
                </AppText>
              </View>
            ) : null}
            {user?.phone_number ? (
              <View className="flex-row items-center gap-1 mt-0.5">
                <Ionicons name="call-outline" size={11} color="#9ca3af" />
                <AppText className="text-xs text-gray-500">
                  {user.phone_number}
                </AppText>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      {/* ETC strip — visually distinct at the bottom of the card */}
      {estimatedTime ? (
        <View className="flex-row items-center gap-3 px-4 py-3 bg-orange-50 border-t border-orange-100">
          <View className="w-8 h-8 rounded-full bg-orange-100 items-center justify-center">
            <Ionicons name="time-outline" size={16} color="#ea580c" />
          </View>
          <View>
            <AppText className="text-[9px] font-bold tracking-widest text-orange-400 uppercase">
              Est. completion time
            </AppText>
            <AppText className="text-sm font-extrabold text-orange-600">
              {estimatedTime} min
            </AppText>
          </View>
        </View>
      ) : null}
    </View>
  );
}
