import { AppText } from "@/components/typography";
import { COLORS, SHADOW_SOFT } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import OrderDetailModal from "./OrdersDetailModal";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, { bg: string; color: string }> = {
  pending:   { bg: "#fef3c7", color: "#92400e" },
  approved:  { bg: "#e0f2fe", color: "#0369a1" },
  declined:  { bg: "#ffe4e6", color: "#be123c" },
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
  cancelOrder: (id: number) => Promise<void> | void;
};

// ─── Cancel confirmation modal ────────────────────────────────────────────────

type CancelConfirmModalProps = {
  visible: boolean;
  orderId: number;
  foodName?: string;
  onConfirm: () => Promise<void> | void;
  onDismiss: () => void;
};

function CancelConfirmModal({
  visible,
  orderId,
  foodName,
  onConfirm,
  onDismiss,
}: CancelConfirmModalProps) {
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
      statusBarTranslucent
      hardwareAccelerated
    >
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={onDismiss}>
        <View style={confirmStyles.backdrop} />
      </TouchableWithoutFeedback>

      {/* Card — absolute centered, pointerEvents so backdrop tap still works */}
      <View style={confirmStyles.centeredWrapper} pointerEvents="box-none">
        <View style={confirmStyles.card}>
          {/* Icon ring */}
          <View style={confirmStyles.iconRing}>
            <Ionicons name="trash-outline" size={28} color="#ef4444" />
          </View>

          {/* Copy */}
          <AppText style={confirmStyles.title}>Cancel order?</AppText>
          <AppText style={confirmStyles.bodyText}>
            Are you sure you want to cancel{" "}
            <AppText style={confirmStyles.bold}>
              {foodName ? `"${foodName}"` : `Order #${orderId}`}
            </AppText>
            ?{"\n"}This action cannot be undone.
          </AppText>

          <View style={confirmStyles.divider} />

          {/* Actions */}
          <View style={confirmStyles.actions}>
            <TouchableOpacity
              onPress={onDismiss}
              activeOpacity={0.75}
              disabled={loading}
              style={confirmStyles.keepBtn}
            >
              <AppText style={confirmStyles.keepText}>Keep order</AppText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleConfirm}
              activeOpacity={0.75}
              disabled={loading}
              style={[
                confirmStyles.cancelBtn,
                loading && confirmStyles.cancelBtnDisabled,
              ]}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <AppText style={confirmStyles.cancelText}>Yes, cancel</AppText>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Order card ───────────────────────────────────────────────────────────────

export default function OrderCard({ order, cancelOrder }: OrderCardProps) {
  const [detailOpen, setDetailOpen]   = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const firstFood       = order?.items?.[0]?.food;
  const extraItemsCount = Math.max((order?.items?.length ?? 0) - 1, 0);
  const statusKey       = (order.status ?? "").toLowerCase();
  const badge           = STATUS_BADGE[statusKey] ?? STATUS_BADGE.pending;
  const hasProof        = Boolean(order.proof_of_payment);
  const hasETC          = Boolean(order.estimated_time_of_completion);

  async function handleCancelConfirmed() {
    await cancelOrder(order.id);
    setConfirmOpen(false);
  }

  return (
    <>
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
        <View style={cardStyles.topRow}>
          <View style={cardStyles.badgeGroup}>
            <View style={[cardStyles.statusBadge, { backgroundColor: badge.bg }]}>
              <AppText style={[cardStyles.statusText, { color: badge.color }]}>
                {order.status}
              </AppText>
            </View>

            {order.reference_id ? (
              <View style={cardStyles.refChip}>
                <Ionicons name="receipt-outline" size={10} color="#ea580c" />
                <AppText style={cardStyles.refText}>{order.reference_id}</AppText>
              </View>
            ) : null}
          </View>

          <View style={cardStyles.dateRow}>
            <Ionicons name="time-outline" size={13} color={COLORS.subtext} />
            <AppText style={cardStyles.dateText}>
              {new Date(order.created_at).toLocaleString()}
            </AppText>
          </View>
        </View>

        {/* ── Main body ── */}
        <View style={cardStyles.body}>
          <View style={cardStyles.thumb}>
            <Image
              source={{ uri: firstFood?.thumbnail ?? "https://via.placeholder.com/300" }}
              style={cardStyles.thumbImg}
              resizeMode="cover"
            />
          </View>

          <View style={cardStyles.info}>
            <AppText numberOfLines={1} style={cardStyles.foodName}>
              {firstFood?.food_name ?? "Order item"}
            </AppText>

            <AppText style={cardStyles.orderId}>
              Order #{order.id}
              {extraItemsCount > 0
                ? ` · +${extraItemsCount} more item${extraItemsCount > 1 ? "s" : ""}`
                : ""}
            </AppText>

            {hasETC ? (
              <View style={cardStyles.etcPill}>
                <Ionicons name="timer-outline" size={11} color="#ea580c" />
                <AppText style={cardStyles.etcText}>
                  ~{order.estimated_time_of_completion} min
                </AppText>
              </View>
            ) : null}

            <View style={[cardStyles.metaRow, { marginTop: hasETC ? 6 : 10 }]}>
              <View style={cardStyles.proofRow}>
                {hasProof ? (
                  <>
                    <Ionicons name="checkmark-circle" size={13} color="#10b981" />
                    <AppText style={cardStyles.proofYes}>Proof attached</AppText>
                  </>
                ) : (
                  <>
                    <Ionicons name="ellipse-outline" size={13} color={COLORS.subtext} />
                    <AppText style={cardStyles.proofNo}>No proof</AppText>
                  </>
                )}
              </View>
              <AppText style={cardStyles.price}>₱{order.total_price}</AppText>
            </View>
          </View>
        </View>

        {/* ── Action row ── */}
        <View style={cardStyles.actionsRow}>
          {order.status === "pending" ? (
            <Pressable
              onPress={() => setConfirmOpen(true)}
              style={cardStyles.cancelCardBtn}
            >
              <Ionicons name="close-circle-outline" size={14} color="#ef4444" />
              <AppText style={cardStyles.cancelCardText}>Cancel</AppText>
            </Pressable>
          ) : null}

          <Pressable
            onPress={() => setDetailOpen(true)}
            style={cardStyles.detailBtn}
          >
            <AppText style={cardStyles.detailText}>View Details</AppText>
            <Ionicons name="chevron-forward" size={14} color="#fff" />
          </Pressable>
        </View>
      </View>

      {/* Modals rendered as siblings outside the card View */}
      <CancelConfirmModal
        visible={confirmOpen}
        orderId={order.id}
        foodName={firstFood?.food_name}
        onConfirm={handleCancelConfirmed}
        onDismiss={() => setConfirmOpen(false)}
      />

      <OrderDetailModal
        opened={detailOpen}
        order={order}
        setOpened={setDetailOpen}
      />
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const cardStyles = StyleSheet.create({
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
  },
  badgeGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 1,
    flexWrap: "wrap",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  refChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#fff7ed",
    borderWidth: 1,
    borderColor: "#fed7aa",
  },
  refText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#ea580c",
    letterSpacing: 0.4,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexShrink: 0,
  },
  dateText: { fontSize: 10, color: COLORS.subtext },
  body: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  thumb: {
    width: 80,
    height: 80,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: COLORS.surface,
  },
  thumbImg: { width: 80, height: 80 },
  info: { flex: 1, marginLeft: 12, marginRight: 4 },
  foodName: { fontSize: 16, fontWeight: "800", color: COLORS.text },
  orderId: { fontSize: 12, color: COLORS.subtext, marginTop: 2 },
  etcPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "#fff7ed",
  },
  etcText: { fontSize: 11, fontWeight: "700", color: "#ea580c" },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  proofRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  proofYes: { fontSize: 10, color: "#10b981", fontWeight: "600" },
  proofNo:  { fontSize: 10, color: COLORS.subtext },
  price:    { fontSize: 16, fontWeight: "800", color: COLORS.primary },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
    backgroundColor: "rgba(0,0,0,0.01)",
  },
  cancelCardBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "#fff1f2",
    borderWidth: 1,
    borderColor: "#fecdd3",
  },
  cancelCardText: { fontSize: 12, fontWeight: "600", color: "#ef4444" },
  detailBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: COLORS.primary,
  },
  detailText: { fontSize: 12, fontWeight: "700", color: "#fff" },
});

const confirmStyles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  centeredWrapper: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 24,
    paddingTop: 28,
    paddingBottom: 20,
    paddingHorizontal: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
  iconRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fff1f2",
    borderWidth: 2,
    borderColor: "#fecdd3",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 4,
  },
  bold: { fontWeight: "700", color: "#374151" },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#f3f4f6",
    marginVertical: 20,
  },
  actions: { flexDirection: "row", gap: 10, width: "100%" },
  keepBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: "#f3f4f6",
  },
  keepText: { fontSize: 13, fontWeight: "700", color: "#374151" },
  cancelBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: "#ef4444",
  },
  cancelBtnDisabled: { backgroundColor: "#fca5a5" },
  cancelText: { fontSize: 13, fontWeight: "700", color: "#fff" },
});