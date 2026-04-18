import { COLORS } from "@/constants/theme";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  Text,
  View,
} from "react-native";

type CartCardProps = {
  item: any;
  onUpdate?: (
    food_id: number,
    quantity: number,
  ) => boolean | void | Promise<boolean | void>;
  selected?: boolean;
  onToggleSelect?: (food_id: number) => void;
  selectedItems?: number[];
  isOrder?: boolean;
  orderId?: number | null;
  isUpdating?: boolean;
};

export default function CartCard({
  item,
  onUpdate = undefined,
  selected = undefined,
  onToggleSelect = undefined,
  selectedItems = [],
  isOrder = false,
  orderId = null,
  isUpdating = false,
}: CartCardProps) {
  const [quantity, setQuantity] = useState(item.quantity);
  const itemRef = useRef(item);
  itemRef.current = item;

  useEffect(() => {
    setQuantity(item.quantity);
  }, [item.quantity]);

  useEffect(() => {
    if (item.is_addon) return;
    if (quantity === item.quantity) return;
    const timeout = setTimeout(() => {
      if (!onUpdate) return;
      void Promise.resolve(onUpdate(item.food_id, quantity)).then((ok) => {
        if (ok === false) {
          setQuantity(itemRef.current.quantity);
        }
      });
    }, 450);
    return () => clearTimeout(timeout);
  }, [quantity, item.quantity, item.is_addon, item.food_id, onUpdate]);

  const isSelected = selectedItems?.includes(item.food_id);
  const blockQty = isUpdating || item.is_addon;

  return (
    <View className="relative flex-row items-center w-full my-2">
      {/* Selection Circle */}
      {!isOrder && !item.is_addon && (
        <Pressable
          onPress={() => onToggleSelect && onToggleSelect(item.food_id)}
          className={`absolute -left-6 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 items-center justify-center
            ${isSelected ? "border-brand bg-brand" : "border-gray-400"}`}
        >
          {isSelected && (
            <View className="w-2 h-2 bg-white rounded-full" />
          )}
        </Pressable>
      )}

      {/* Card Container */}
      <View
        className={`relative flex-row items-center rounded-3xl overflow-hidden w-full border bg-white
          ${selected ? "border-2 border-brand" : "border-gray-100"}`}
        style={{
          shadowColor: "#000",
          shadowOpacity: 0.06,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 3,
        }}
      >
        {/* Image */}
        <View
          className="w-[100px] h-[88px] overflow-hidden items-center justify-center"
          style={{
            backgroundColor: "rgba(253, 86, 2, 0.08)",
            borderTopLeftRadius: 24,
            borderBottomLeftRadius: 24,
          }}
        >
          <Image
            source={{
              uri: item.thumbnail || item.food?.thumbnail,
            }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>

        {/* Info */}
        <View className="flex-1 px-3 py-2">
          <Text className="font-bold text-gray-900">
            {item.food_name || item.food?.food_name}
          </Text>
          <Text className="font-semibold" style={{ color: COLORS.primary }}>
            ₱
            {isOrder
              ? item.quantity * (item.price ?? item.food?.price ?? 0)
              : item.price ?? item.food?.price ?? 0}
          </Text>
        </View>

        {isOrder && <Text className="mr-2">{item.quantity} ×</Text>}

        {/* Quantity / Order Section */}
        <View
          className="px-2 py-1 rounded-r-3xl w-[44px] h-[88px] items-center justify-between"
          style={{ backgroundColor: COLORS.primary }}
        >
          {isOrder ? (
            <View className="items-center justify-center flex-1">
              <Text className="text-xs text-white rotate-90 whitespace-nowrap">
                Order #{orderId}
              </Text>
            </View>
          ) : (
            <>
              <Pressable
                onPress={() => {
                  if (!blockQty) setQuantity((prev: number) => prev + 1);
                }}
                disabled={blockQty}
              >
                <Text
                  className={`text-lg font-bold text-white
                  ${blockQty ? "opacity-50" : ""}`}
                >
                  +
                </Text>
              </Pressable>

              <Text className="font-bold text-white">{quantity}</Text>

              <Pressable
                onPress={() => {
                  if (!blockQty && quantity > 1)
                    setQuantity((prev: number) => prev - 1);
                }}
                disabled={blockQty}
              >
                <Text
                  className={`text-lg font-bold text-white
                  ${blockQty || quantity <= 1 ? "opacity-50" : ""}`}
                >
                  -
                </Text>
              </Pressable>
            </>
          )}
        </View>

        {isUpdating ? (
          <View
            className="absolute inset-0 rounded-3xl bg-white/70 items-center justify-center"
            pointerEvents="auto"
          >
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text className="mt-1 text-[10px] font-semibold text-gray-600">
              Updating…
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
