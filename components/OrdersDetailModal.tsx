import { AppText } from "@/components/typography";
import { Distance } from "@/utils/Distance";
import { resolveStorageOrRemoteUrl } from "@/utils/resolveMediaUrl";
import React from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";

import type { Order } from "../types/Order";
import { computeDelivery, resolveCustomerName } from "../utils/Distance";

import { BillSummary } from "@/components/OrderDetail/BillSummary";
import { CustomerCard } from "@/components/OrderDetail/CustomerCard";
import { CustomerNote } from "@/components/OrderDetail/CustomerNote";
import { DeliverySection } from "@/components/OrderDetail/DeliverySection";
import { OrderHeader } from "@/components/OrderDetail/OrderHeader";
import { OrderItemsList } from "@/components/OrderDetail/OrderItemList";
import { PaymentProof } from "@/components/OrderDetail/PaymentProof";

// ─── Props ────────────────────────────────────────────────────────────────────

type OrderDetailModalProps = {
  opened: boolean;
  order: Order | null | any;
  setOpened: (open: boolean) => void;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function OrderDetailModal({
  opened,
  order,
  setOpened,
}: OrderDetailModalProps) {
  if (!order) return null;

  const { height } = Dimensions.get("window");

  // Coordinates
  const latitude = Number(order.latitude);
  const longitude = Number(order.longitude);
  const hasCoords = !Number.isNaN(latitude) && !Number.isNaN(longitude);

  // Delivery
  const isDelivery = order.type !== "pickup";
  const distanceKm = hasCoords ? Distance(latitude, longitude) : 0;
  const { price: deliveryPrice, extraKm } = isDelivery
    ? computeDelivery(distanceKm)
    : { price: 0, extraKm: 0 };

  // Bill
  const totalPrice = Number(order.total_price ?? 0);
  const foodSubtotal = Math.max(0, totalPrice - deliveryPrice);

  // Proof
  const proofUri = resolveStorageOrRemoteUrl(order.proof_of_payment);

  // Customer
  const customerName = resolveCustomerName(order.user);

  return (
    <Modal
      animationType="slide"
      transparent
      visible={opened}
      onRequestClose={() => setOpened(false)}
      statusBarTranslucent
    >
      {/* Backdrop — tap to dismiss */}
      <Pressable
        className="flex-1 justify-end bg-black/60"
        onPress={() => setOpened(false)}
      >
        {/* Sheet */}
        <Pressable
          className="w-full bg-white rounded-t-3xl overflow-hidden"
          style={{ maxHeight: height * 0.93 }}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Drag handle */}
          <View className="items-center pt-3 pb-1">
            <View className="w-10 h-1 rounded-full bg-gray-200" />
          </View>

          {/* Header */}
          <OrderHeader
            order={order}
            isDelivery={isDelivery}
            onClose={() => setOpened(false)}
          />

          {/* Scrollable body */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 20, paddingBottom: 36 }}
            nestedScrollEnabled
          >
            {isDelivery ? (
              <DeliverySection
                location={order.location}
                latitude={latitude}
                longitude={longitude}
                hasCoords={hasCoords}
              />
            ) : null}

            <BillSummary
              foodSubtotal={foodSubtotal}
              deliveryPrice={deliveryPrice}
              totalPrice={totalPrice}
              isDelivery={isDelivery}
              extraKm={extraKm}
            />

            <OrderItemsList items={order.items} />

            {proofUri ? <PaymentProof proofUri={proofUri} /> : null}

            <CustomerCard
              customerName={customerName}
              user={order.user}
              estimatedTime={order.estimated_time_of_completion}
            />

            {order.note ? <CustomerNote note={order.note} /> : null}

            <TouchableOpacity
              onPress={() => setOpened(false)}
              className="items-center py-4 rounded-2xl bg-orange-500 active:opacity-80"
            >
              <AppText className="text-base font-extrabold text-white tracking-wide">
                Done
              </AppText>
            </TouchableOpacity>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
