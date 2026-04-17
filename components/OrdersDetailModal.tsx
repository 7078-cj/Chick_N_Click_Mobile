import { Distance } from "@/utils/Distance";
import React from "react";
import {
  Dimensions,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
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
  const [imagePreviewOpen, setImagePreviewOpen] = React.useState(false);
  if (!order) return null;

  const totalPrice = Number(order.total_price || 0);
  const latitude = Number(order.latitude);
  const longitude = Number(order.longitude);
  const hasValidCoordinates = !Number.isNaN(latitude) && !Number.isNaN(longitude);
  const dis = hasValidCoordinates ? Distance(latitude, longitude) : 0;

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
  const itemSubtotal = Number(totalPrice - dis_price).toFixed(2);
  const orderTypeLabel = order.type === "pickup" ? "Pickup" : "Delivery";
  const paymentStatus = (order.payment_status || "pending").toString().toUpperCase();
  const resolveProofUri = (value?: string | null) => {
    if (!value) return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }
    if (trimmed.startsWith("//")) {
      return `https:${trimmed}`;
    }
    const apiUrl = process.env.EXPO_PUBLIC_API_URL || "";
    if (trimmed.startsWith("/storage/")) {
      return `${apiUrl}${trimmed}`;
    }
    return `${apiUrl}/storage/${trimmed.replace(/^\/+/, "")}`;
  };
  const proofUri = resolveProofUri(order.proof_of_payment);

  const { height } = Dimensions.get("window");
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={opened}
      onRequestClose={() => setOpened(false)}
    >
    <View className="absolute right-0 z-50 top-[1%] p-4">
        <TouchableOpacity
          onPress={() => setOpened(false)}
          activeOpacity={0.7}
          className="items-center justify-center bg-white rounded-full shadow w-9 h-9"
        >
          
          <View style={{ width: 14, height: 14, position: "relative" }}>
            <View
              style={{
                position: "absolute",
                width: 14,
                height: 1.5,
                backgroundColor: "#6b7280",
                borderRadius: 2,
                top: 6,
                right: 1,
                transform: [{ rotate: "45deg" }],
              }}
            />
            <View
              style={{
                position: "absolute",
                width: 14,
                height: 1.5,
                backgroundColor: "#6b7280",
                borderRadius: 2,
                top: 6,
                left: 0,
                transform: [{ rotate: "-45deg" }],
              }}
            />
          </View>
        </TouchableOpacity>
      </View>
      {/* Overlay */}
      <View className="items-center justify-center flex-1 p-2 bg-slate-400/[0.40] rounded-t-lg">
        {/* Modal container */}
        <View
          className="w-full overflow-hidden bg-white rounded-lg"
          style={{ maxHeight: height * 0.9 }}
        >
          <ScrollView contentContainerStyle={{ padding: 16 }} nestedScrollEnabled>
            {hasValidCoordinates && (
              <View className="overflow-hidden mb-4 rounded-xl" style={{ height: 220 }}>
                <MapComponent lat2={latitude} lng2={longitude} />
              </View>
            )}
            <View className="flex-col">
              <View className="flex-1 p-4 mb-4 bg-white rounded-lg shadow">
                <Text className="mb-1 text-lg font-bold">Order Summary</Text>
                <Text className="mb-2 text-sm text-gray-500">
                  {orderTypeLabel} • Status: {order.status?.toUpperCase()}
                </Text>

                {/* Fees */}
                <View className="mb-2 space-y-1">
                  <View className="flex-row justify-between">
                    <Text>Orders Total</Text>
                    <Text>₱{itemSubtotal}</Text>
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
                    Payment Status: {paymentStatus}
                  </Text>
                </View>

                {proofUri && (
                  <View className="mt-3">
                    <Text className="mb-2 text-sm font-semibold text-gray-700">
                      Payment Proof
                    </Text>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => setImagePreviewOpen(true)}
                    >
                      <Image
                        source={{ uri: proofUri }}
                        className="w-full h-40 rounded-lg"
                        resizeMode="cover"
                      />
                      <View className="absolute right-2 bottom-2 px-2 py-1 rounded-md bg-black/50">
                        <Text className="text-[11px] text-white">Tap to preview</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Right: Customer & Items */}
              <View className="flex-1 p-4 bg-white rounded-lg shadow">
                <Text className="mb-1 text-xl font-bold">
                  {order.user?.first_name
                    ? `${order.user.first_name} ${order.user.last_name}`
                    : order.user?.name}
                </Text>
                <Text className="mb-2 text-sm text-gray-500">
                  {order.user?.email}
                </Text>

                <Text className="font-medium">
                  Location:{" "}
                  <Text className="text-teal-600">
                    {order.location || "No location"}
                  </Text>
                </Text>

                <Text className="text-sm text-gray-500">
                  Lat:{" "}
                  <Text className="text-orange-600">
                    {order.latitude || "N/A"}
                  </Text>{" "}
                  | Lng:{" "}
                  <Text className="text-orange-600">
                    {order.longitude || "N/A"}
                  </Text>
                </Text>

                <Text className="mt-1 font-medium">
                  Phone:{" "}
                  <Text className="text-orange-600">
                    {order.user?.phone_number || "N/A"}
                  </Text>
                </Text>

                <Text className="mt-2 text-sm text-gray-500">
                  Preparation Time:{" "}
                  <Text className="font-medium">
                    {order.estimated_time_of_completion || 0} mins
                  </Text>
                </Text>

                {hasValidCoordinates && (
                  <TouchableOpacity
                    className="self-start px-3 py-2 mt-2 bg-orange-100 rounded-lg"
                    onPress={() =>
                      Linking.openURL(
                        `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
                      )
                    }
                  >
                    <Text className="text-xs font-semibold text-orange-700">
                      Open in Maps
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Ordered Items */}
                <Text className="mt-4 mb-1 text-lg font-bold">
                  Ordered Items
                </Text>
                <View className="mb-2 border-b border-gray-300" />

                {order.items?.map((item: any) => (
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
      <Modal
        visible={imagePreviewOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setImagePreviewOpen(false)}
      >
        <View className="items-center justify-center flex-1 bg-black/90">
          <TouchableOpacity
            onPress={() => setImagePreviewOpen(false)}
            className="absolute z-10 items-center justify-center w-10 h-10 bg-white rounded-full top-14 right-6"
          >
            <Text className="text-lg font-bold text-gray-700">×</Text>
          </TouchableOpacity>
          {proofUri ? (
            <Image
              source={{ uri: proofUri }}
              style={{ width: "92%", height: "70%" }}
              resizeMode="contain"
            />
          ) : null}
        </View>
      </Modal>
    </Modal>
  );
}
