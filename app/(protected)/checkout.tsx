import { getCurrentUser } from "@/api/user";
import CheckoutCartReview from "@/components/CheckoutCartReview";
import { ScreenIntro } from "@/components/layout/ScreenIntro";
import MapComponent from "@/components/MapComponent";
import RequestStatusModal from "@/components/RequestStatusModal";
import { TAB_BAR_SCROLL_INSET } from "@/constants/theme";
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
  TextInput,
  TouchableOpacity,
  View
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
  const [isEditingLocation, setIsEditingLocation] = useState(false);

  const [location, setLocation] = useState<LocationState>({
    full: "",
    lat: 0,
    lng: 0,
  });

  const [proofImage, setProofImage] = useState<{
    uri: string;
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
      orderType === "pickup"
        ? { full: "", lat: 0, lng: 0 }
        : location;

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

          {orderType === "delivery" && (
            <View className="mb-4 bg-white shadow rounded-2xl overflow-hidden">
              <View className="p-4">
                <Text className="mb-1 text-base font-semibold">Delivery Location</Text>
                <Text className="text-xs text-gray-500 mb-3">
                  {location.full.trim()
                    ? location.full
                    : "No location set. Tap the map to pin your delivery address."}
                </Text>
                <TouchableOpacity
                  onPress={() => setIsEditingLocation((prev) => !prev)}
                  className="items-center py-2 bg-orange-100 rounded-xl"
                >
                  <Text className="font-semibold text-orange-700">
                    {isEditingLocation ? "Done" : "Change Location"}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={{ height: 220 }}>
                <MapComponent
                  editMode={isEditingLocation}
                  location={{
                    lat: location.lat,
                    lng: location.lng,
                    full: location.full,
                  }}
                  setLocation={(loc) => {
                    if (loc.lat !== null && loc.lng !== null) {
                      setLocation({
                        full: loc.full ?? "",
                        lat: loc.lat as number,
                        lng: loc.lng as number,
                      });
                    }
                  }}
                  showSearchBar={isEditingLocation}
                  interactive={isEditingLocation}
                />
              </View>
            </View>
          )}

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
            className={`items-center py-4 mb-4 rounded-2xl ${
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
        buttonText={statusModal.redirectToOrders ? "Go to Orders" : "OK"}
        onClose={() => setStatusModal((prev) => ({ ...prev, visible: false }))}
      />
    </>
  );
}