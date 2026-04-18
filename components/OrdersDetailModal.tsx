import { Distance } from "@/utils/Distance";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Dimensions,
  Image,
  Linking,
  Modal,
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

  React.useEffect(() => {
    if (!opened) {
      setImagePreviewOpen(false);
    }
  }, [opened]);

  if (!order) return null;

  const totalPrice = Number(order.total_price || 0);
  const latitude = Number(order.latitude);
  const longitude = Number(order.longitude);
  const hasValidCoordinates = !Number.isNaN(latitude) && !Number.isNaN(longitude);
  const dis = hasValidCoordinates ? Distance(latitude, longitude) : 0;

  let dis_price = 0;
  let extra_km = 0;

  if (order.type !== "pickup") {
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
  const paymentStatus = (order.payment_status || "pending").toString();

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

  const customerName = order.user?.first_name
    ? `${order.user.first_name} ${order.user.last_name}`
    : order.user?.name ?? "Customer";

  return (
    <Modal
      animationType="slide"
      transparent
      visible={opened}
      onRequestClose={() => setOpened(false)}
    >
      <View className="justify-end flex-1 bg-black/50">
        <View
          className="w-full overflow-hidden bg-white rounded-t-3xl"
          style={{ maxHeight: height * 0.92 }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-4 pt-4 pb-2 border-b border-gray-100">
            <View className="flex-1 pr-2">
              <Text className="text-lg font-bold text-gray-900">
                Order #{order.id}
              </Text>
              <Text className="text-xs text-gray-500">
                {new Date(order.created_at).toLocaleString()}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setOpened(false)}
              className="items-center justify-center w-10 h-10 rounded-full bg-gray-100"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={22} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 16, paddingBottom: 28 }}
            nestedScrollEnabled
          >
            {/* Status row */}
            <View className="flex-row flex-wrap gap-2 mb-4">
              <View className="px-3 py-1 rounded-full bg-orange-100">
                <Text className="text-xs font-semibold text-orange-800">
                  {orderTypeLabel}
                </Text>
              </View>
              <View className="px-3 py-1 rounded-full bg-gray-100">
                <Text className="text-xs font-semibold text-gray-800">
                  {order.status?.toUpperCase() ?? "—"}
                </Text>
              </View>
              <View className="px-3 py-1 rounded-full bg-emerald-50">
                <Text className="text-xs font-semibold text-emerald-800">
                  Payment: {paymentStatus}
                </Text>
              </View>
            </View>

            {/* Map — no search bar, view-only */}
            {hasValidCoordinates ? (
              <View className="overflow-hidden mb-4 rounded-2xl border border-gray-100" style={{ height: 176 }}>
                <MapComponent
                  lat2={latitude}
                  lng2={longitude}
                  showSearchBar={false}
                  interactive={false}
                />
              </View>
            ) : null}

            {/* Location */}
            <View className="p-4 mb-4 rounded-2xl bg-gray-50">
              <Text className="mb-1 text-xs font-semibold text-gray-500 uppercase">
                Delivery location
              </Text>
              <Text className="text-sm text-gray-900">
                {order.location || "No address saved"}
              </Text>
              {hasValidCoordinates ? (
                <TouchableOpacity
                  className="flex-row items-center gap-1 mt-3 self-start"
                  onPress={() =>
                    Linking.openURL(
                      `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
                    )
                  }
                >
                  <Ionicons name="map-outline" size={16} color="#ea580c" />
                  <Text className="text-sm font-semibold text-orange-600">
                    Open in Maps
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Totals */}
            <View className="p-4 mb-4 rounded-2xl border border-gray-100">
              <Text className="mb-3 text-xs font-semibold text-gray-500 uppercase">
                Bill
              </Text>
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm text-gray-600">Food subtotal</Text>
                <Text className="text-sm font-semibold text-gray-900">
                  ₱{itemSubtotal}
                </Text>
              </View>
              {order.type !== "pickup" ? (
                <View className="flex-row justify-between mb-2">
                  <Text className="text-sm text-gray-600">
                    Delivery{extra_km > 0 ? ` (+${extra_km} km)` : ""}
                  </Text>
                  <Text className="text-sm font-semibold text-gray-900">
                    ₱{dis_price.toFixed(2)}
                  </Text>
                </View>
              ) : null}
              <View className="flex-row justify-between pt-3 mt-1 border-t border-gray-200">
                <Text className="text-base font-bold text-gray-900">Total</Text>
                <Text className="text-lg font-extrabold text-orange-600">
                  ₱{totalPrice.toFixed(2)}
                </Text>
              </View>
            </View>

            {/* Proof */}
            {proofUri ? (
              <View className="mb-4">
                <Text className="mb-2 text-xs font-semibold text-gray-500 uppercase">
                  Payment proof
                </Text>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setImagePreviewOpen(true)}
                  className="overflow-hidden rounded-2xl"
                >
                  <Image
                    source={{ uri: proofUri }}
                    className="w-full h-36"
                    resizeMode="cover"
                  />
                  <View className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-black/55">
                    <Text className="text-[11px] text-white">Tap to enlarge</Text>
                  </View>
                </TouchableOpacity>
              </View>
            ) : null}

            {/* Items */}
            <View className="mb-4">
              <Text className="mb-2 text-xs font-semibold text-gray-500 uppercase">
                Items
              </Text>
              {order.items?.map((item: any) => (
                <View
                  key={item.id}
                  className="flex-row items-center py-3 border-b border-gray-100 last:border-b-0"
                >
                  <Image
                    source={{
                      uri:
                        item.food?.thumbnail ||
                        "https://via.placeholder.com/60x60?text=No+Img",
                    }}
                    className="w-11 h-11 mr-3 rounded-lg bg-gray-100"
                  />
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-gray-900">
                      {item.food?.food_name}
                    </Text>
                    <Text className="text-xs text-gray-500">
                      ₱{item.price} × {item.quantity}
                    </Text>
                  </View>
                  <Text className="text-sm font-bold text-gray-900">
                    ₱{(item.quantity * item.price).toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>

            {/* Customer compact */}
            <View className="p-4 rounded-2xl bg-gray-50 mb-4">
              <Text className="mb-2 text-xs font-semibold text-gray-500 uppercase">
                Customer
              </Text>
              <Text className="text-base font-semibold text-gray-900">{customerName}</Text>
              {order.user?.email ? (
                <Text className="text-sm text-gray-600">{order.user.email}</Text>
              ) : null}
              {order.estimated_time_of_completion ? (
                <Text className="mt-2 text-sm text-gray-600">
                  Est. prep:{" "}
                  <Text className="font-semibold text-gray-900">
                    {order.estimated_time_of_completion} min
                  </Text>
                </Text>
              ) : null}
            </View>

            {order.note ? (
              <View className="p-4 mb-4 rounded-2xl border border-dashed border-gray-200">
                <Text className="mb-1 text-xs font-semibold text-gray-500">Note</Text>
                <Text className="text-sm text-gray-800">{order.note}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              onPress={() => setOpened(false)}
              className="items-center py-3.5 rounded-2xl bg-orange-500"
            >
              <Text className="text-base font-bold text-white">Done</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>

      {/* Image preview */}
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
            <Ionicons name="close" size={24} color="#374151" />
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
