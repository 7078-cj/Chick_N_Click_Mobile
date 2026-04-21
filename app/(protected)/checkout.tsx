import { getCurrentUser } from "@/api/user";
import CheckoutCartReview from "@/components/CheckoutCartReview";
import { ScreenIntro } from "@/components/layout/ScreenIntro";
import RequestStatusModal from "@/components/RequestStatusModal";
import AuthContext from "@/contexts/AuthContext";
import { TabContext } from "@/contexts/TabContext";
import { useCart } from "@/hooks/useCart";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TextInput, // ✅ ADDED
  TouchableOpacity,
  View
} from "react-native";

export default function Checkout() {
  const tab = useContext(TabContext);
  const auth = useContext(AuthContext);
  const cartCtx = useCart();

  const [orderType, setOrderType] = useState<"delivery" | "pickup">("delivery");
  const [loadingUser, setLoadingUser] = useState(true);

  const [location, setLocation] = useState({
    full: "",
    lat: 0,
    lng: 0,
  });

  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [draftLocation, setDraftLocation] = useState({
    full: "",
    lat: 0,
    lng: 0,
  });

  const [proofImage, setProofImage] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);

  // ✅ NEW STATE
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

  /**
   * PLACE ORDER
   */
  const handlePlaceOrder = async () => {
    // ✅ reference validation
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
        message:
          "Please set your profile location before placing a delivery order.",
        type: "error",
        redirectToOrders: false,
      });
      return;
    }

    const payloadLocation =
      orderType === "pickup"
        ? { full: "", lat: 0, lng: 0 }
        : location;

    const result = await cartCtx.placeOrder({
      orderType,
      location: payloadLocation,
      proof: proofImage,
      referenceId, // ✅ INCLUDED
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
  };

  const pickProofImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        setStatusModal({
          visible: true,
          title: "Permission Needed",
          message: "Please allow gallery access to upload payment proof.",
          type: "error",
          redirectToOrders: false,
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const asset = result.assets[0];
      const fallbackName = `proof_${Date.now()}.jpg`;

      setProofImage({
        uri: asset.uri,
        name: asset.fileName || fallbackName,
        type: asset.mimeType || "image/jpeg",
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <ScrollView className="flex-1 bg-white">
        <ScreenIntro
          eyebrow="Almost there"
          title="Checkout"
          subtitle="Confirm your order details before placing."
          accentTitle
        />

        <View className="p-5">
          <CheckoutCartReview />

          {/* ✅ REFERENCE ID INPUT */}
          <View className="p-4 mb-4 bg-white shadow rounded-2xl">
            <Text className="mb-2 text-base font-semibold">
              Payment Reference ID
            </Text>

            <Text className="mb-3 text-xs text-gray-500">
              Enter your payment reference number (GCash / bank).
            </Text>

            <View className="px-3 py-2 border border-gray-300 rounded-xl">
              <TextInput
                value={referenceId}
                onChangeText={(text) => setReferenceId(text.toUpperCase())}
                placeholder="Enter reference ID"
                placeholderTextColor="#9CA3AF"
                className="text-sm text-gray-800"
              />
            </View>
          </View>

          {/* PAYMENT PROOF */}
          <View className="p-4 mb-4 bg-white shadow rounded-2xl">
            <Text className="mb-2 text-base font-semibold">
              Payment Proof
            </Text>

            {proofImage ? (
              <Image
                source={{ uri: proofImage.uri }}
                className="w-full h-40 mb-3 rounded-xl"
              />
            ) : (
              <View className="items-center justify-center w-full h-32 mb-3 border border-dashed rounded-xl border-gray-300">
                <Text>No image selected</Text>
              </View>
            )}

            <TouchableOpacity
              onPress={pickProofImage}
              className="items-center py-3 bg-orange-100 rounded-xl"
            >
              <Text className="font-semibold text-orange-700">
                Upload Proof Image
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handlePlaceOrder}
            disabled={cartCtx.placingOrder}
            className={`items-center py-4 mb-24 rounded-2xl ${
              cartCtx.placingOrder ? "bg-orange-300" : "bg-orange-500"
            }`}
          >
            {cartCtx.placingOrder ? (
              <View className="flex-row items-center gap-2">
                <ActivityIndicator size="small" color="#fff" />
                <Text className="text-base font-bold text-white">
                  Processing Checkout...
                </Text>
              </View>
            ) : (
              <Text className="text-base font-bold text-white">
                Place Order
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <RequestStatusModal
        visible={statusModal.visible}
        title={statusModal.title}
        message={statusModal.message}
        type={statusModal.type}
        buttonText={
          statusModal.redirectToOrders ? "Go to Orders" : "OK"
        }
        onClose={() => setStatusModal((prev) => ({ ...prev, visible: false }))}
      />
    </>
  );
}