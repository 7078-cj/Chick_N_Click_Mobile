import AuthContext from "@/contexts/AuthContext";
import React, { useContext, useEffect, useState } from "react";
import {
    Image,
    Pressable,
    Text,
    View,
} from "react-native";

const url = process.env.EXPO_PUBLIC_API_URL;

type CartCardProps = {
  item: any;
  onUpdate?: (food_id: number, quantity: number) => void;
  selected?: boolean;
  onToggleSelect?: (food_id: number) => void;
  selectedItems?: number[];
  isOrder?: boolean;
  orderId?: number | null;
}

export default function CartCard({
  item,
  onUpdate = undefined ,
  selected = undefined,
  onToggleSelect = undefined,
  selectedItems = [],
  isOrder = false,
  orderId = null,
}:CartCardProps) {
  const auth = useContext(AuthContext);
  const [quantity, setQuantity] = useState(item.quantity);

  useEffect(() => {
    if (quantity !== item.quantity && !item.is_addon) {
      const timeout = setTimeout(() => {
        handleUpdateQuantity(quantity);
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [quantity]);

  const handleUpdateQuantity = async (newQty:number) => {
    try {
      const res = await fetch(`${url}/api/cart/add/${item.food_id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth?.token}`,
        },
        body: JSON.stringify({ quantity: newQty }),
      });

      await res.json();
      onUpdate && onUpdate(item.food_id, newQty);
    } catch (err) {
      console.error(err);
    }
  };

  const isSelected = selectedItems?.includes(item.food_id);

  return (
    <View className="relative flex-row items-center w-full my-2">

      {/* Selection Circle */}
      {!isOrder && !item.is_addon && (
        <Pressable
          onPress={() => onToggleSelect && onToggleSelect(item.food_id)}
          className={`absolute -left-6 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 items-center justify-center
            ${isSelected ? "bg-orange-500 border-orange-500" : "border-gray-400"}`}
        >
          {isSelected && (
            <View className="w-2 h-2 bg-white rounded-full" />
          )}
        </Pressable>
      )}

      {/* Card Container */}
      <View
        className={`flex-row items-center bg-[#fef9e7] rounded-3xl overflow-hidden w-full shadow-md
          ${selected ? "border-2 border-orange-500" : ""}`}
      >
        {/* Image */}
        <View className="w-[100px] h-20 overflow-hidden rounded-3xl bg-yellow-400 items-center justify-center">
          <Image
            source={{
              uri:
                item.thumbnail ||
                item.food?.thumbnail,
            }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>

        {/* Info */}
        <View className="flex-1 px-3">
          <Text className="font-bold text-black">
            {item.food_name || item.food?.food_name}
          </Text>
          <Text className="text-[#ff6600] font-semibold">
            ₱
            {isOrder
              ? item.quantity *
                (item.price ?? item.food?.price ?? 0)
              : item.price ?? item.food?.price ?? 0}
          </Text>
        </View>

        {isOrder && (
          <Text className="mr-2">{item.quantity} ×</Text>
        )}

        {/* Quantity / Order Section */}
        <View className="bg-yellow-300 px-2 py-1 rounded-r-lg w-[40px] h-[80px] items-center justify-between">

          {isOrder ? (
            <View className="items-center justify-center flex-1">
              <Text className="text-xs text-black rotate-90 whitespace-nowrap">
                Order #{orderId}
              </Text>
            </View>
          ) : (
            <>
              <Pressable
                onPress={() => {
                  if (!item.is_addon)
                    setQuantity((prev:any) => prev + 1);
                }}
                disabled={item.is_addon}
              >
                <Text
                  className={`text-lg font-bold text-orange-700
                  ${item.is_addon ? "opacity-50" : ""}`}
                >
                  +
                </Text>
              </Pressable>

              <Text className="font-bold">
                {quantity}
              </Text>

              <Pressable
                onPress={() => {
                  if (!item.is_addon && quantity > 1)
                    setQuantity((prev:any) => prev - 1);
                }}
                disabled={item.is_addon}
              >
                <Text
                  className={`text-lg font-bold text-orange-700
                  ${item.is_addon ? "opacity-50" : ""}`}
                >
                  -
                </Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </View>
  );
}