import { getCurrentUser } from "@/api/user";
import CheckoutCartReview from "@/components/CheckoutCartReview";
import { ScreenIntro } from "@/components/layout/ScreenIntro";
import LocationSelector from "@/components/LocationSelector";
import MapComponent from "@/components/MapComponent";
import MapModal from "@/components/MapModal";
import RequestStatusModal from "@/components/RequestStatusModal";
import { AppText } from "@/components/typography";
import { TAB_BAR_SCROLL_INSET } from "@/constants/theme";
import { showToast } from "@/utils/toast";
import AuthContext from "@/contexts/AuthContext";
import { TabContext } from "@/contexts/TabContext";
import { useCart } from "@/hooks/useCart";
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

type LocationState = {
  full: string;
  lat: number;
  lng: number;
};

export default function Checkout() {
  const tab = useContext(TabContext);
  const auth = useContext(AuthContext);
  const cartCtx = useCart();

  const [orderType, setOrderType] = useState<"delivery" | "pickup">("delivery");
  const [loadingUser, setLoadingUser] = useState(true);
  const [openedMap, setOpenedMap] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const [location, setLocation] = useState<LocationState>({
    full: "",
    lat: 0,
    lng: 0,
  });

  const [proofImage, setProofImage] = useState<{
    uri: string;
    fileUri: string;
    name: string;
    type: string;
  } | null>(null);

  const [referenceId, setReferenceId] = useState("");

  const [statusModal, setStatusModal] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info" as "success" | "error" | "info",
    redirectToOrders: false,
  });

  useEffect(() => {
    tab?.setActive("Checkout");

    if (cartCtx.cart.length < 1) {
      router.replace("/(protected)/cart");
      return;
    }

    loadUserLocation();
  }, []);

  const loadUserLocation = async () => {
    try {
      const token = auth?.token;
      if (!token) return;

      const res = await getCurrentUser(token);
      if (!res.ok) return;

      const data = await res.json();

      const latitude =
        data.latitude !== null && data.latitude !== undefined
          ? Number(data.latitude)
          : null;

      const longitude =
        data.longitude !== null && data.longitude !== undefined
          ? Number(data.longitude)
          : null;

      if (
        latitude !== null &&
        longitude !== null &&
        !Number.isNaN(latitude) &&
        !Number.isNaN(longitude) &&
        data.location
      ) {
        setLocation({
          full: data.location,
          lat: latitude,
          lng: longitude,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUser(false);
    }
  };

  const deliveryFee = useMemo(() => {
    if (orderType === "pickup") return 0;
    return 55;
  }, [orderType]);

  const grandTotal = useMemo(
    () => Number(cartCtx.total || 0) + deliveryFee,
    [cartCtx.total, deliveryFee]
  );

  const pickProofImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        showToast(
          "Permission needed",
          "Allow photo access to upload payment proof.",
          "info",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const asset = result.assets[0];
      const fileName = asset.fileName ?? `proof_${Date.now()}.jpg`;

      setProofImage({
        uri: asset.uri,
        fileUri: asset.uri,
        name: fileName,
        type: asset.mimeType ?? "image/jpeg",
      });
    } catch (err) {
      console.error("Image picker error:", err);
      showToast("Image error", "Failed to pick an image. Please try again.", "error");
    }
  };

  const handlePlaceOrder = async () => {
    if (!referenceId.trim()) {
      setStatusModal({
        visible: true,
        title: "Reference Required",
        message: "Please enter your payment reference ID.",
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

    const payloadLocation =
      orderType === "pickup" ? { full: "", lat: 0, lng: 0 } : location;

    setIsPlacingOrder(true);

    try {
      const result = await cartCtx.placeOrder({
        orderType,
        location: payloadLocation,
        proof: proofImage,
        referenceId,
      });

      if (result.ok) {
        router.replace("/(protected)/orders");
        return;
      }

      setStatusModal({
        visible: true,
        title: "Order Failed",
        message: result.message,
        type: "error",
        redirectToOrders: false,
      });
    } catch (err) {
      console.error("Place order error:", err);
      setStatusModal({
        visible: true,
        title: "Order Failed",
        message: "Something went wrong. Please try again.",
        type: "error",
        redirectToOrders: false,
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Adapter: MapModal passes the full LocationState shape, but our local
  // state uses { full, lat, lng } — normalise here so both components stay happy.
  const handleLocationChange = (loc: any) => {
    if (loc?.lat !== null && loc?.lng !== null) {
      setLocation({
        full: loc.full ?? "",
        lat: loc.lat,
        lng: loc.lng,
      });
    }
  };

  return (
    <>
      {/* ── Placing-order overlay ───────────────────────── */}
      <Modal transparent visible={isPlacingOrder} animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.45)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 20,
              paddingVertical: 32,
              paddingHorizontal: 40,
              alignItems: "center",
              gap: 16,
              shadowColor: "#000",
              shadowOpacity: 0.2,
              shadowRadius: 12,
              elevation: 10,
            }}
          >
            <ActivityIndicator size="large" color="#f97316" />
            <AppText style={{ fontWeight: "600", fontSize: 15, color: "#1a1a1a" }}>
              Placing your order…
            </AppText>
            <AppText style={{ fontSize: 12, color: "#6b7280", textAlign: "center" }}>
              Please wait while we confirm your payment.
            </AppText>
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

          {/* ── Order type toggle ───────────────────────── */}
          <View className="flex-row mb-4 bg-gray-100 rounded-2xl p-1">
            {(["delivery", "pickup"] as const).map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => setOrderType(type)}
                className={`flex-1 py-2 items-center rounded-xl ${
                  orderType === type ? "bg-white shadow" : ""
                }`}
              >
                <AppText
                  className={`font-semibold capitalize text-sm ${
                    orderType === type ? "text-orange-600" : "text-gray-500"
                  }`}
                >
                  {type}
                </AppText>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Delivery location ───────────────────────── */}
          {orderType === "delivery" && (
            <View className="mb-4 bg-white shadow rounded-2xl overflow-hidden">
              {/* Map preview */}
              <View style={{ height: 200 }}>
                <MapComponent
                  editMode={false}
                  location={location}
                  setLocation={handleLocationChange}
                  showSearchBar={false}
                  interactive={false}
                />
              </View>

              {/* LocationSelector sits below the map preview */}
              <View className="px-4 py-3">
                <AppText className="text-base font-semibold mb-2">
                  Delivery Location
                </AppText>
                <LocationSelector
                  location={location}
                  setOpenedMap={setOpenedMap}
                />
              </View>
            </View>
          )}

          {/* ── Payment reference ───────────────────────── */}
          <View className="p-4 mb-4 bg-white shadow rounded-2xl">
            <AppText className="mb-2 text-base font-semibold">
              Payment Reference ID
            </AppText>

            <View className="px-3 py-2 border border-gray-300 rounded-xl">
              <TextInput
                value={referenceId}
                onChangeText={(text) => setReferenceId(text.toUpperCase())}
                placeholder="Enter reference ID"
                className="text-sm"
              />
            </View>
          </View>

          {/* ── Payment proof ───────────────────────────── */}
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
                <AppText className="text-gray-400 text-sm">No image selected</AppText>
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

          {/* ── Order summary ───────────────────────────── */}
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

          {/* ── Place order ─────────────────────────────── */}
          <TouchableOpacity
            onPress={handlePlaceOrder}
            disabled={isPlacingOrder || cartCtx.placingOrder}
            className={`items-center py-4 mb-4 rounded-2xl ${
              isPlacingOrder || cartCtx.placingOrder
                ? "bg-orange-300"
                : "bg-orange-500"
            }`}
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

      {/* ── Map modal (full-screen pin picker) ─────────── */}
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