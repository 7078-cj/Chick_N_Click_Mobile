import { AppText } from "@/components/typography";
import { COLORS, SHADOW_SOFT } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Image, Pressable, View } from "react-native";
import OrderDetailModal from "./OrdersDetailModal";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, { bg: string; color: string }> = {
  pending: { bg: "#fef3c7", color: "#92400e" },
  approved: { bg: "#e0f2fe", color: "#0369a1" },
  declined: { bg: "#ffe4e6", color: "#be123c" },
  completed: { bg: "#d1fae5", color: "#065f46" },
  cancelled: { bg: "#f3f4f6", color: "#6b7280" },
};

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderCardProps = {
  order: {
    id: number;
    status: string;
    created_at: string;
    total_price: string | number;
    reference_id?: string;
    estimated_time_of_completion?: number | string;
    proof_of_payment?: string;
    items?: Array<{
      quantity?: number;
      food?: { thumbnail?: string; food_name?: string };
    }>;
  };
  cancelOrder: (id: number) => void;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function OrderCard({ order, cancelOrder }: OrderCardProps) {
  const [opened, setOpened] = useState(false);

  const firstFood = order?.items?.[0]?.food;
  const extraItemsCount = Math.max((order?.items?.length ?? 0) - 1, 0);

  const statusKey = (order.status ?? "").toLowerCase();
  const badge = STATUS_BADGE[statusKey] ?? STATUS_BADGE.pending;

  const hasProof = Boolean(order.proof_of_payment);
  const hasETC = Boolean(order.estimated_time_of_completion);

  return (
    <View
      style={[
        {
          backgroundColor: COLORS.card,
          borderRadius: 20,
          marginBottom: 14,
          overflow: "hidden",
        },
        SHADOW_SOFT,
      ]}
    >
      {/* ── Top row: status + date ── */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 14,
          paddingTop: 12,
          paddingBottom: 10,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <View
            style={{
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 999,
              backgroundColor: badge.bg,
            }}
          >
            <AppText
              style={{
                fontSize: 10,
                fontWeight: "700",
                letterSpacing: 0.6,
                color: badge.color,
                textTransform: "uppercase",
              }}
            >
              {order.status}
            </AppText>
          </View>

          {/* Reference ID chip */}
          {order.reference_id ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 3,
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 999,
                backgroundColor: "#fff7ed",
                borderWidth: 1,
                borderColor: "#fed7aa",
              }}
            >
              <Ionicons name="receipt-outline" size={10} color="#ea580c" />
              <AppText
                style={{
                  fontSize: 9,
                  fontWeight: "700",
                  color: "#ea580c",
                  letterSpacing: 0.4,
                }}
              >
                {order.reference_id}
              </AppText>
            </View>
          ) : null}
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Ionicons name="time-outline" size={13} color={COLORS.subtext} />
          <AppText style={{ fontSize: 10, color: COLORS.subtext }}>
            {new Date(order.created_at).toLocaleString()}
          </AppText>
        </View>
      </View>

      {/* ── Main body ── */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 14,
          paddingBottom: 12,
        }}
      >
        {/* Thumbnail */}
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 16,
            overflow: "hidden",
            backgroundColor: COLORS.surface,
          }}
        >
          <Image
            source={{
              uri: firstFood?.thumbnail ?? "https://via.placeholder.com/300",
            }}
            style={{ width: 80, height: 80 }}
            resizeMode="cover"
          />
        </View>

        <View style={{ flex: 1, marginLeft: 12, marginRight: 4 }}>
          <AppText
            numberOfLines={1}
            style={{ fontSize: 16, fontWeight: "800", color: COLORS.text }}
          >
            {firstFood?.food_name ?? "Order item"}
          </AppText>

          <AppText
            style={{ fontSize: 12, color: COLORS.subtext, marginTop: 2 }}
          >
            Order #{order.id}
            {extraItemsCount > 0
              ? ` · +${extraItemsCount} more item${extraItemsCount > 1 ? "s" : ""}`
              : ""}
          </AppText>

          {/* ETC pill */}
          {hasETC ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                marginTop: 6,
                alignSelf: "flex-start",
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 999,
                backgroundColor: "#fff7ed",
              }}
            >
              <Ionicons name="timer-outline" size={11} color="#ea580c" />
              <AppText
                style={{ fontSize: 11, fontWeight: "700", color: "#ea580c" }}
              >
                ~{order.estimated_time_of_completion} min
              </AppText>
            </View>
          ) : null}

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: hasETC ? 6 : 10,
            }}
          >
            {/* Proof of payment indicator */}
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 3 }}
            >
              {hasProof ? (
                <>
                  <Ionicons name="checkmark-circle" size={13} color="#10b981" />
                  <AppText
                    style={{
                      fontSize: 10,
                      color: "#10b981",
                      fontWeight: "600",
                    }}
                  >
                    Proof attached
                  </AppText>
                </>
              ) : (
                <>
                  <Ionicons
                    name="ellipse-outline"
                    size={13}
                    color={COLORS.subtext}
                  />
                  <AppText style={{ fontSize: 10, color: COLORS.subtext }}>
                    No proof
                  </AppText>
                </>
              )}
            </View>

            <AppText
              style={{ fontSize: 16, fontWeight: "800", color: COLORS.primary }}
            >
              ₱{order.total_price}
            </AppText>
          </View>
        </View>
      </View>

      {/* ── Action row ── */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 10,
          paddingHorizontal: 14,
          paddingVertical: 12,
          borderTopWidth: 1,
          borderTopColor: "rgba(0,0,0,0.05)",
          backgroundColor: "rgba(0,0,0,0.01)",
        }}
      >
        {order.status === "pending" ? (
          <Pressable
            onPress={() => cancelOrder(order.id)}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 9,
              borderRadius: 999,
              backgroundColor: COLORS.surface,
              borderWidth: 1,
              borderColor: "rgba(0,0,0,0.08)",
            }}
          >
            <AppText
              style={{ fontSize: 12, fontWeight: "600", color: COLORS.subtext }}
            >
              Cancel
            </AppText>
          </Pressable>
        ) : null}

        <Pressable
          onPress={() => setOpened(true)}
          style={{
            paddingHorizontal: 18,
            paddingVertical: 9,
            borderRadius: 999,
            backgroundColor: COLORS.primary,
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
          }}
        >
          <AppText style={{ fontSize: 12, fontWeight: "700", color: "#fff" }}>
            View Details
          </AppText>
          <Ionicons name="chevron-forward" size={14} color="#fff" />
        </Pressable>
      </View>

      <OrderDetailModal opened={opened} order={order} setOpened={setOpened} />
    </View>
  );
}
