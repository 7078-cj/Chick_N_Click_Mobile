import { getCurrentUser } from "@/api/user";
import CheckoutCartReview from "@/components/CheckoutCartReview";
import { ScreenIntro } from "@/components/layout/ScreenIntro";
import LocationSelector from "@/components/LocationSelector";
import MapComponent from "@/components/MapComponent";
import MapModal from "@/components/MapModal";
import RequestStatusModal from "@/components/RequestStatusModal";
import { AppText } from "@/components/typography";
import { TAB_BAR_SCROLL_INSET } from "@/constants/theme";
import AuthContext from "@/contexts/AuthContext";
import { TabContext } from "@/contexts/TabContext";
import { useCart } from "@/hooks/useCart";
import { showToast } from "@/utils/toast";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────

type LocationState = {
  full: string;
  lat: number;
  lng: number;
};

// ─── Reference ID helpers ─────────────────────────────────────────────────────
//
// Format: XXXX-XXX-XXXXXX  (4 digits – 3 digits – 6 digits)
// Example: 0001-002-003004

const REF_REGEX = /^\d{4}-\d{3}-\d{6}$/;

// Segment lengths for auto-hyphen insertion
const SEG = [4, 3, 6] as const;
const SEG_TOTAL = SEG[0] + SEG[1] + SEG[2]; // 13 digits

/**
 * Turn a raw string of digits (up to 13) into the formatted X-X-X display
 * string with hyphens inserted automatically.
 *
 * "0001002003004" → "0001-002-003004"
 */
function formatRefId(digits: string): string {
  const d = digits.slice(0, SEG_TOTAL);
  const p0 = d.slice(0, SEG[0]);                       // first 4
  const p1 = d.slice(SEG[0], SEG[0] + SEG[1]);         // next  3
  const p2 = d.slice(SEG[0] + SEG[1]);                 // last  6

  if (p1.length > 0 && p2.length > 0) return `${p0}-${p1}-${p2}`;
  if (p1.length > 0)                  return `${p0}-${p1}`;
  return p0;
}

/**
 * Validate the fully-formed reference ID.
 * Returns an error string, or undefined when valid.
 */
function validateRefId(value: string): string | undefined {
  if (!value.trim()) return "Payment reference ID is required";
  const digits = value.replace(/-/g, "");
  if (digits.length < SEG_TOTAL) return `Must be ${SEG_TOTAL} digits (${SEG[0]}-${SEG[1]}-${SEG[2]} format)`;
  if (!REF_REGEX.test(value))    return "Format must be XXXX-XXX-XXXXXX (e.g. 0001-002-003004)";
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Checkout() {
  const tab    = useContext(TabContext);
  const auth   = useContext(AuthContext);
  const cartCtx = useCart();

  const [orderType,     setOrderType]     = useState<"delivery" | "pickup">("delivery");
  const [loadingUser,   setLoadingUser]   = useState(true);
  const [openedMap,     setOpenedMap]     = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const [location, setLocation] = useState<LocationState>({ full: "", lat: 0, lng: 0 });

  const [proofImage, setProofImage] = useState<{
    uri: string; fileUri: string; name: string; type: string;
  } | null>(null);

  // Reference ID — stored as the formatted string (with hyphens)
  const [referenceId,      setReferenceId]      = useState("");
  const [referenceIdError, setReferenceIdError] = useState<string | undefined>();
  const [refTouched,       setRefTouched]        = useState(false);

  const [statusModal, setStatusModal] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info" as "success" | "error" | "info",
    redirectToOrders: false,
  });

  useEffect(() => {
    tab?.setActive("Checkout");
    if (cartCtx.cart.length < 1) { router.replace("/(protected)/cart"); return; }
    loadUserLocation();
  }, []);

  const loadUserLocation = async () => {
    try {
      const token = auth?.token;
      if (!token) return;
      const res  = await getCurrentUser(token);
      if (!res.ok) return;
      const data = await res.json();
      const latitude  = data.latitude  != null ? Number(data.latitude)  : null;
      const longitude = data.longitude != null ? Number(data.longitude) : null;
      if (latitude !== null && longitude !== null && !Number.isNaN(latitude) && !Number.isNaN(longitude) && data.location) {
        setLocation({ full: data.location, lat: latitude, lng: longitude });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUser(false);
    }
  };

  // ── Reference ID input handler ─────────────────────────────────────────────

  const handleRefIdChange = (raw: string) => {
    // Strip everything that isn't a digit
    const digits = raw.replace(/\D/g, "").slice(0, SEG_TOTAL);
    const formatted = formatRefId(digits);
    setReferenceId(formatted);

    // Live-validate once the field has been touched
    if (refTouched) {
      setReferenceIdError(validateRefId(formatted));
    }
  };

  const handleRefIdBlur = () => {
    setRefTouched(true);
    setReferenceIdError(validateRefId(referenceId));
  };

  // ── Delivery & totals ──────────────────────────────────────────────────────

  const deliveryFee = useMemo(() => (orderType === "pickup" ? 0 : 55), [orderType]);
  const grandTotal  = useMemo(() => Number(cartCtx.total || 0) + deliveryFee, [cartCtx.total, deliveryFee]);

  // ── Image picker ───────────────────────────────────────────────────────────

  const pickProofImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        showToast("Permission needed", "Allow photo access to upload payment proof.", "info");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.8,
      });
      if (result.canceled || !result.assets?.[0]) return;
      const asset    = result.assets[0];
      const fileName = asset.fileName ?? `proof_${Date.now()}.jpg`;
      setProofImage({ uri: asset.uri, fileUri: asset.uri, name: fileName, type: asset.mimeType ?? "image/jpeg" });
    } catch (err) {
      console.error("Image picker error:", err);
      showToast("Image error", "Failed to pick an image. Please try again.", "error");
    }
  };

  // ── Place order ────────────────────────────────────────────────────────────

  const handlePlaceOrder = async () => {
    // Validate ref ID first — mark touched so error shows
    setRefTouched(true);
    const refError = validateRefId(referenceId);
    setReferenceIdError(refError);

    if (refError) {
      setStatusModal({
        visible: true,
        title: "Reference ID Required",
        message: refError,
        type: "error",
        redirectToOrders: false,
      });
      return;
    }

    if (!proofImage) {
      setStatusModal({
        visible: true,
        title: "Proof Required",
        message: "Please upload your payment proof image.",
        type: "error",
        redirectToOrders: false,
      });
      return;
    }

    if (orderType === "delivery" && !location.full.trim()) {
      setStatusModal({
        visible: true,
        title: "Location Required",
        message: "Please set your delivery location before placing an order.",
        type: "error",
        redirectToOrders: false,
      });
      return;
    }

    const payloadLocation = orderType === "pickup" ? { full: "", lat: 0, lng: 0 } : location;
    setIsPlacingOrder(true);

    try {
      const result = await cartCtx.placeOrder({
        orderType,
        location: payloadLocation,
        proof: proofImage,
        referenceId,
      });

      if (result.ok) { router.replace("/(protected)/orders"); return; }

      setStatusModal({
        visible: true, title: "Order Failed",
        message: result.message, type: "error", redirectToOrders: false,
      });
    } catch (err) {
      console.error("Place order error:", err);
      setStatusModal({
        visible: true, title: "Order Failed",
        message: "Something went wrong. Please try again.", type: "error", redirectToOrders: false,
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleLocationChange = (loc: any) => {
    if (loc?.lat != null && loc?.lng != null) {
      setLocation({ full: loc.full ?? "", lat: loc.lat, lng: loc.lng });
    }
  };

  // ── Derived ────────────────────────────────────────────────────────────────

  const refDigits  = referenceId.replace(/-/g, "").length;
  const refIsValid = REF_REGEX.test(referenceId);

  return (
    <>
      {/* ── Placing-order overlay ── */}
      <Modal transparent visible={isPlacingOrder} animationType="fade">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)", alignItems: "center", justifyContent: "center" }}>
          <View style={{ backgroundColor: "white", borderRadius: 20, paddingVertical: 32, paddingHorizontal: 40, alignItems: "center", gap: 16, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 12, elevation: 10 }}>
            <ActivityIndicator size="large" color="#f97316" />
            <AppText style={{ fontWeight: "600", fontSize: 15, color: "#1a1a1a" }}>Placing your order…</AppText>
            <AppText style={{ fontSize: 12, color: "#6b7280", textAlign: "center" }}>Please wait while we confirm your payment.</AppText>
          </View>
        </View>
      </Modal>

      <ScrollView
        className="flex-1 bg-white"
        contentContainerStyle={{ paddingBottom: TAB_BAR_SCROLL_INSET + 24 }}
        showsVerticalScrollIndicator={false}
      >
        <ScreenIntro
          eyebrow="Almost there"
          title="Checkout"
          subtitle="Confirm your order details before placing."
          accentTitle
        />

        <View className="p-5">
          <CheckoutCartReview />

          {/* ── Order type toggle ── */}
          <View className="flex-row mb-4 bg-gray-100 rounded-2xl p-1">
            {(["delivery", "pickup"] as const).map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => setOrderType(type)}
                className={`flex-1 py-2 items-center rounded-xl ${orderType === type ? "bg-white shadow" : ""}`}
              >
                <AppText className={`font-semibold capitalize text-sm ${orderType === type ? "text-orange-600" : "text-gray-500"}`}>
                  {type}
                </AppText>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Delivery location ── */}
          {orderType === "delivery" && (
            <View className="mb-4 bg-white shadow rounded-2xl overflow-hidden">
              <View style={{ height: 200 }}>
                <MapComponent
                  editMode={false}
                  location={location}
                  setLocation={handleLocationChange}
                  showSearchBar={false}
                  interactive={false}
                />
              </View>
              <View className="px-4 py-3">
                <AppText className="text-base font-semibold mb-2">Delivery Location</AppText>
                <LocationSelector location={location} setOpenedMap={setOpenedMap} />
              </View>
            </View>
          )}

          {/* ── Payment reference ID ── */}
          <View className="p-4 mb-4 bg-white shadow rounded-2xl">
            <View className="flex-row items-center justify-between mb-1">
              <AppText className="text-base font-semibold">Payment Reference ID</AppText>
              {/* Live check / X icon */}
              {referenceId.length > 0 ? (
                refIsValid ? (
                  <Ionicons name="checkmark-circle" size={18} color="#22c55e" />
                ) : (
                  <Ionicons name="close-circle" size={18} color="#ef4444" />
                )
              ) : null}
            </View>

            {/* Format hint */}
            <AppText className="text-xs text-gray-400 mb-2">
              Format: XXXX-XXX-XXXXXX · e.g. 0001-002-003004
            </AppText>

            {/* Input */}
            <View
              className={`flex-row items-center border rounded-xl px-3 overflow-hidden ${
                referenceIdError && refTouched
                  ? "border-red-400 bg-red-50"
                  : refIsValid
                  ? "border-green-400 bg-green-50"
                  : "border-gray-300 bg-white"
              }`}
            >
              <TextInput
                value={referenceId}
                onChangeText={handleRefIdChange}
                onBlur={handleRefIdBlur}
                placeholder="0001-002-003004"
                placeholderTextColor="#ADADAD"
                keyboardType="number-pad"
                maxLength={15} // 13 digits + 2 hyphens
                autoCapitalize="none"
                autoCorrect={false}
                style={{ flex: 1, paddingVertical: 10, fontSize: 15, fontWeight: "600", letterSpacing: 1, color: "#111827", fontVariant: ["tabular-nums"] }}
              />
              {/* Digit progress counter */}
              <AppText className={`text-xs font-semibold ml-2 ${refDigits === SEG_TOTAL ? "text-green-500" : "text-gray-400"}`}>
                {refDigits}/{SEG_TOTAL}
              </AppText>
            </View>

            {/* Segment visual guide */}
            <View className="flex-row items-center gap-1 mt-2">
              {SEG.map((len, i) => (
                <React.Fragment key={i}>
                  {/* Segment fill bar */}
                  <View className="flex-row gap-0.5">
                    {Array.from({ length: len }).map((_, j) => {
                      const digitIndex = SEG.slice(0, i).reduce((a, b) => a + b, 0) + j;
                      const filled = digitIndex < refDigits;
                      return (
                        <View
                          key={j}
                          style={{
                            width: 10,
                            height: 4,
                            borderRadius: 2,
                            backgroundColor: filled
                              ? refIsValid ? "#22c55e" : "#f97316"
                              : "#e5e7eb",
                          }}
                        />
                      );
                    })}
                  </View>
                  {i < SEG.length - 1 ? (
                    <AppText className="text-gray-300 text-xs">–</AppText>
                  ) : null}
                </React.Fragment>
              ))}
            </View>

            {/* Error message */}
            {referenceIdError && refTouched ? (
              <View className="flex-row items-center gap-1 mt-2">
                <Ionicons name="alert-circle-outline" size={13} color="#ef4444" />
                <AppText className="text-xs text-red-500 flex-1">{referenceIdError}</AppText>
              </View>
            ) : refIsValid ? (
              <View className="flex-row items-center gap-1 mt-2">
                <Ionicons name="checkmark-circle-outline" size={13} color="#22c55e" />
                <AppText className="text-xs text-green-600">Reference ID looks good</AppText>
              </View>
            ) : null}
          </View>

          {/* ── Payment proof ── */}
          <View className="p-4 mb-4 bg-white shadow rounded-2xl">
            <AppText className="mb-2 text-base font-semibold">Payment Proof</AppText>

            {proofImage ? (
              <Image
                source={{ uri: proofImage.uri }}
                className="w-full h-40 mb-3 rounded-xl"
                resizeMode="cover"
                onError={(e) => console.warn("Image load error:", e.nativeEvent)}
              />
            ) : (
              <View className="items-center justify-center w-full h-32 mb-3 border border-dashed border-gray-300 rounded-xl">
                <Ionicons name="image-outline" size={28} color="#d1d5db" />
                <AppText className="text-gray-400 text-sm mt-1">No image selected</AppText>
              </View>
            )}

            <TouchableOpacity
              onPress={pickProofImage}
              className="items-center py-3 bg-orange-100 rounded-xl"
            >
              <AppText className="font-semibold text-orange-700">
                {proofImage ? "Change Image" : "Upload Proof Image"}
              </AppText>
            </TouchableOpacity>
          </View>

          {/* ── Order summary ── */}
          <View className="p-4 mb-4 bg-orange-50 rounded-2xl">
            <AppText className="text-base font-semibold mb-2">Order Summary</AppText>
            <View className="flex-row justify-between mb-1">
              <AppText className="text-sm text-gray-600">Subtotal</AppText>
              <AppText className="text-sm">₱{Number(cartCtx.total || 0).toFixed(2)}</AppText>
            </View>
            <View className="flex-row justify-between mb-1">
              <AppText className="text-sm text-gray-600">Delivery Fee</AppText>
              <AppText className="text-sm">
                {orderType === "pickup" ? "Free" : `₱${deliveryFee.toFixed(2)}`}
              </AppText>
            </View>
            <View className="flex-row justify-between mt-2 pt-2 border-t border-orange-200">
              <AppText className="font-bold text-base">Total</AppText>
              <AppText className="font-bold text-base text-orange-600">
                ₱{grandTotal.toFixed(2)}
              </AppText>
            </View>
          </View>

          {/* ── Place order ── */}
          <TouchableOpacity
            onPress={handlePlaceOrder}
            disabled={isPlacingOrder || cartCtx.placingOrder}
            className={`items-center py-4 mb-4 rounded-2xl ${isPlacingOrder || cartCtx.placingOrder ? "bg-orange-300" : "bg-orange-500"}`}
          >
            {isPlacingOrder || cartCtx.placingOrder ? (
              <View className="flex-row items-center gap-2">
                <ActivityIndicator size="small" color="white" />
                <AppText className="text-white font-bold ml-2">Placing Order…</AppText>
              </View>
            ) : (
              <AppText className="text-white font-bold">Place Order</AppText>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <MapModal
        opened={openedMap}
        setOpened={setOpenedMap}
        location={location}
        handleLocationChange={handleLocationChange}
      />

      <RequestStatusModal
        visible={statusModal.visible}
        title={statusModal.title}
        message={statusModal.message}
        type={statusModal.type}
        buttonText="OK"
        onClose={() => setStatusModal((prev) => ({ ...prev, visible: false }))}
      />
    </>
  );
}