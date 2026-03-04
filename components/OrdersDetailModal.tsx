import { Distance } from "@/utils/Distance";
import React from "react";
import {
    Dimensions,
    Image,
    Modal,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import MapComponent from "./MapComponent";

type OrderDetailModalProps = {
  opened: boolean;
  order: any;
  setOpened: (open: boolean) => void;
};

export default function OrderDetailModal({
  opened,
  order,
  setOpened,
}: OrderDetailModalProps) {
  if (!order) return null;

  const totalPrice = order.total_price ? parseFloat(order.total_price) : 0;
  const subtotal = totalPrice - 30;

  const dis = Distance(order.latitude, order.longitude);

  let dis_price = 0;
  let extra_km = 0;

  if (order.type === "pickup") {
    dis_price = 0;
  } else {
    const base_km = 3;
    const base_price = 55;
    const extra_price = 10;

    if (dis <= base_km) {
      dis_price = base_price;
    } else {
      extra_km = Math.ceil(dis - base_km);
      dis_price = base_price + extra_km * extra_price;
    }
  }

  const { height } = Dimensions.get("window");

  return (
    <Modal
      animationType="slide"
      transparent
      visible={opened}
      onRequestClose={() => setOpened(false)}
    >
      {/* Overlay */}
      <View className="items-center justify-center flex-1 p-4 bg-slate-400 bg-opacity-20">
        {/* Modal container */}
        <View
          className="w-full overflow-hidden bg-white rounded-lg"
          style={{ maxHeight: height * 0.9 }}
        >
          <ScrollView contentContainerStyle={{ padding: 16 }} nestedScrollEnabled>
            <MapComponent lat2={parseFloat(order.latitude)} lng2={parseFloat(order.longitude)}/> 
            <View className="flex-col">
              {/* Left: Payment + Map */}
              
              <View className="flex-1 p-4 mb-4 bg-white rounded-lg shadow">
                <View className="w-full h-64 mb-4 bg-gray-200 rounded-lg" />
                <Text className="mb-1 text-lg font-bold">Payment Successful</Text>
                <Text className="mb-2 text-sm text-gray-500">
                  Verified via {order.payment_method || "GCash"}.
                </Text>

                {/* Fees */}
                <View className="mb-2 space-y-1">
                  <View className="flex-row justify-between">
                    <Text>Orders Total</Text>
                    <Text>₱{subtotal.toFixed(2)}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text>Paymongo Fee</Text>
                    <Text>₱30.00</Text>
                  </View>
                  <View className="flex-row justify-between mt-1">
                    <Text>Extra Km: {extra_km}</Text>
                    <Text>Delivery Fee: ₱{dis_price}</Text>
                  </View>
                  <View className="mt-1 border-t border-gray-300" />
                  <View className="flex-row justify-between mt-1 font-bold">
                    <Text>Total</Text>
                    <Text>₱{totalPrice.toFixed(2)}</Text>
                  </View>
                </View>

                <View className="flex-row items-center mt-4">
                  <Text className="text-sm text-gray-500">
                    Paid via {order.payment_method || "GCash"}
                  </Text>
                </View>
              </View>

              {/* Right: Customer & Items */}
              <View className="flex-1 p-4 bg-white rounded-lg shadow">
                <Text className="mb-1 text-xl font-bold">
                  {order.user?.first_name
                    ? `${order.user.first_name} ${order.user.last_name}`
                    : order.user?.name}
                </Text>
                <Text className="mb-2 text-sm text-gray-500">{order.user?.phone}</Text>

                <Text className="font-medium">
                  Location:{" "}
                  <Text className="text-teal-600">{order.location || "No location"}</Text>
                </Text>

                <Text className="text-sm text-gray-500">
                  Lat: <Text className="text-orange-600">{order.latitude || "N/A"}</Text> | Lng:{" "}
                  <Text className="text-orange-600">{order.longitude || "N/A"}</Text>
                </Text>

                <Text className="mt-1 font-medium">
                  Phone: <Text className="text-orange-600">{order.user?.phone_number || "N/A"}</Text>
                </Text>

                <Text className="mt-2 text-sm text-gray-500">
                  Preparation Time: <Text className="font-medium">{order.estimated_time_of_completion || 0} mins</Text>
                </Text>

                {/* Ordered Items */}
                <Text className="mt-4 mb-1 text-lg font-bold">Ordered Items</Text>
                <View className="mb-2 border-b border-gray-300" />

                {order.items?.map((item:any) => (
                  <View
                    key={item.id}
                    className="flex-row items-center justify-between p-2 mb-2 rounded-md bg-gray-50"
                  >
                    <Image
                      source={{
                        uri:
                          item.food?.thumbnail ||
                          "https://via.placeholder.com/60x60?text=No+Img",
                      }}
                      className="w-12 h-12 mr-2 rounded-md"
                    />
                    <Text className="flex-1 text-sm font-medium">
                      {item.food?.food_name} ×{item.quantity}
                    </Text>
                    <Text className="text-sm font-semibold">
                      ₱{(item.quantity * item.price).toFixed(2)}
                    </Text>
                  </View>
                ))}

                {order.delivery_fee && (
                  <View className="flex-row justify-between mt-2 font-medium">
                    <Text>Delivery Fee</Text>
                    <Text>₱{order.delivery_fee}</Text>
                  </View>
                )}

                {order.note && (
                  <View className="p-3 mt-4 border border-gray-200 rounded-md bg-gray-50">
                    <Text className="mb-1 text-sm font-semibold">Note:</Text>
                    <Text className="text-sm">{order.note}</Text>
                  </View>
                )}

                {/* Back Button */}
                <View className="flex-row justify-end mt-4">
                  <Pressable
                    className="px-4 py-2 bg-orange-500 rounded-md"
                    onPress={() => setOpened(false)}
                  >
                    <Text className="font-medium text-white">Back</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}