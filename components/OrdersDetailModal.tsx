import { AppText } from "@/components/typography";
import { Distance } from "@/utils/Distance";
import { resolveStorageOrRemoteUrl } from "@/utils/resolveMediaUrl";
import React from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
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
  const { height } = Dimensions.get("window");
  const statusBarHeight = StatusBar.currentHeight ?? 0;
  const sheetMaxHeight = height - statusBarHeight - 24;

  if (!order) return null;

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
      hardwareAccelerated
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/*
          Backdrop: TouchableWithoutFeedback wraps a plain View that fills the
          screen. This is intentionally NOT a parent of the sheet — the sheet
          sits in absolute position above it. This avoids the core scroll bug:
          a Pressable/TouchableOpacity ancestor captures touch start events for
          its own gesture recognizer, which starves the ScrollView of the
          scroll gesture on Android.
        */}
        <TouchableWithoutFeedback onPress={() => setOpened(false)}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        {/* Sheet — absolute, bottom-anchored, NOT inside the backdrop touch */}
        <View style={[styles.sheet, { maxHeight: sheetMaxHeight }]}>
          {/* Drag handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Header — fixed above scroll */}
          <OrderHeader
            order={order}
            isDelivery={isDelivery}
            onClose={() => setOpened(false)}
          />

          {/*
            ScrollView is a direct child of the sheet View — no Pressable
            wrapper around it. Critical on Android: any Pressable ancestor
            intercepts touch events for its own gesture detection, which
            prevents the ScrollView from cleanly receiving scroll gestures.
          */}
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            overScrollMode="never"
            bounces={false}
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
              activeOpacity={0.8}
              style={styles.doneButton}
            >
              <AppText style={styles.doneText}>Done</AppText>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
//
// StyleSheet (not NativeWind className) for all structural/layout rules.
// Tailwind class resolution can be unreliable for flex/position/overflow
// values that directly affect scroll and gesture behaviour.

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },

  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
    flexDirection: "column",
  },

  handleContainer: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 4,
  },

  handle: {
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#e5e7eb",
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  doneButton: {
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 18,
    backgroundColor: "#f97316",
    marginTop: 4,
  },

  doneText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.3,
  },
});