import { COLORS, SHADOW_SOFT } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import OrderDetailModal from "./OrdersDetailModal";

const STATUS_BADGE_BG: Record<string, string> = {
  pending: "#fbbf24",
  approved: "#0ea5e9",
  declined: "#f43f5e",
  completed: "#10b981",
  cancelled: "#a3a3a3",
};

type OrderCardProps = {
  order: {
    id: number;
    status: string;
    created_at: string;
    total_price: string | number;
    items?: Array<{
      quantity?: number;
      food?: { thumbnail?: string; food_name?: string };
    }>;
  };
  cancelOrder: (id: number) => void;
};

export default function OrderCard({ order, cancelOrder }: OrderCardProps) {
  const [opened, setOpened] = useState(false);
  const firstItem = order?.items?.[0];
  const firstFood = firstItem?.food;
  const extraItemsCount = Math.max((order?.items?.length || 0) - 1, 0);

  const statusKey = (order.status || "").toLowerCase();
  const badgeBg = STATUS_BADGE_BG[statusKey] ?? "#fbbf24";

  return (
    <View
      style={[
        {
          backgroundColor: COLORS.card,
          borderRadius: 20,
          marginBottom: 14,
          paddingVertical: 14,
          paddingHorizontal: 14,
        },
        SHADOW_SOFT,
      ]}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <View
          style={{
            alignSelf: "flex-start",
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 999,
            backgroundColor: badgeBg,
          }}
        >
          <Text
            style={{
              fontSize: 10,
              fontWeight: "700",
              letterSpacing: 0.6,
              color: "#fff",
              textTransform: "uppercase",
            }}
          >
            {order.status}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Ionicons name="receipt-outline" size={16} color={COLORS.subtext} />
          <Text style={{ fontSize: 11, color: COLORS.subtext }}>
            {new Date(order.created_at).toLocaleString()}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View
          style={{
            width: 88,
            height: 88,
            borderRadius: 44,
            overflow: "hidden",
            backgroundColor: COLORS.surface,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            source={{
              uri:
                firstFood?.thumbnail ||
                "https://via.placeholder.com/300",
            }}
            style={{ width: 88, height: 88, borderRadius: 44 }}
            resizeMode="cover"
          />
        </View>

        <View style={{ flex: 1, marginLeft: 14, marginRight: 8 }}>
          <Text
            numberOfLines={1}
            style={{
              fontSize: 17,
              fontWeight: "800",
              color: COLORS.text,
            }}
          >
            {firstFood?.food_name || "Order item"}
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: COLORS.subtext,
              marginTop: 4,
              lineHeight: 18,
            }}
          >
            Order #{order.id}
            {extraItemsCount > 0
              ? ` · +${extraItemsCount} more item${extraItemsCount > 1 ? "s" : ""}`
              : ""}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 10,
            }}
          >
            <Text style={{ fontSize: 11, color: COLORS.subtext }}>
              Tap details for full receipt
            </Text>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "800",
                color: COLORS.primary,
              }}
            >
              ₱{order.total_price}
            </Text>
          </View>
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 10,
          marginTop: 14,
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: "rgba(0,0,0,0.06)",
        }}
      >
        {order.status === "pending" ? (
          <Pressable
            onPress={() => cancelOrder(order.id)}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 999,
              backgroundColor: COLORS.surface,
              borderWidth: 1,
              borderColor: "rgba(0,0,0,0.08)",
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: "600", color: COLORS.subtext }}>
              Cancel
            </Text>
          </Pressable>
        ) : null}

        <Pressable
          onPress={() => setOpened(true)}
          style={{
            paddingHorizontal: 18,
            paddingVertical: 10,
            borderRadius: 999,
            backgroundColor: COLORS.primary,
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: "700", color: "#fff" }}>
            Details
          </Text>
          <Ionicons name="chevron-forward" size={16} color="#fff" />
        </Pressable>
      </View>

      <OrderDetailModal opened={opened} order={order} setOpened={setOpened} />
    </View>
  );
}
