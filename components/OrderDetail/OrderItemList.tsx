import { AppText } from "@/components/typography";
import React from "react";
import { Image, View } from "react-native";
import type { OrderItem } from "../../types/Order";
import { formatCurrency } from "../../utils/Distance";
import { SectionLabel } from "./ui";

type OrderItemRowProps = { item: OrderItem };

function OrderItemRow({ item }: OrderItemRowProps) {
  const lineTotal = item.quantity * item.price;
  const imgSrc = item.food?.thumbnail
    ? { uri: item.food.thumbnail }
    : { uri: "https://via.placeholder.com/56x56/f3f4f6/9ca3af?text=?" };

  return (
    <View className="flex-row items-center py-3 border-b border-gray-50 last:border-b-0">
      <Image
        source={imgSrc}
        className="w-12 h-12 mr-3 rounded-xl bg-gray-100"
        resizeMode="cover"
      />
      <View className="flex-1 mr-2">
        <AppText
          className="text-sm font-semibold text-gray-900 leading-snug"
          numberOfLines={2}
        >
          {item.food?.food_name ?? "Unknown item"}
        </AppText>
        <AppText className="mt-0.5 text-xs text-gray-400">
          {formatCurrency(item.price)} × {item.quantity}
        </AppText>
      </View>
      <AppText className="text-sm font-bold text-gray-900">
        {formatCurrency(lineTotal)}
      </AppText>
    </View>
  );
}

type OrderItemsListProps = { items?: OrderItem[] };

export function OrderItemsList({ items }: OrderItemsListProps) {
  return (
    <View className="mb-5">
      <SectionLabel label={`Items (${items?.length ?? 0})`} />
      <View className="rounded-2xl border border-gray-100 px-3 overflow-hidden">
        {items?.length ? (
          items.map((item) => <OrderItemRow key={item.id} item={item} />)
        ) : (
          <AppText className="py-4 text-center text-sm text-gray-400">
            No items found
          </AppText>
        )}
      </View>
    </View>
  );
}
