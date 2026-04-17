import { TabContext } from "@/contexts/TabContext";
import { useCart } from "@/hooks/useCart";
import AuthContext from "@/contexts/AuthContext";
import RequestStatusModal from "@/components/RequestStatusModal";
import MapComponent from "@/components/MapComponent";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
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
      const url = process.env.EXPO_PUBLIC_API_URL;
      if (!token || !url) return;

      const res = await fetch(`${url}/api/user`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
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
    [cartCtx.total, deliveryFee],
  );

  const handlePlaceOrder = async () => {
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
        message: "Please set your profile location before placing a delivery order.",
        type: "error",
        redirectToOrders: false,
      });
      return;
    }

    const payloadLocation = orderType === "pickup" ? { full: "", lat: 0, lng: 0 } : location;
    const result = await cartCtx.placeOrder({
      orderType,
      location: payloadLocation,
      proof: proofImage,
    });

    setStatusModal({
      visible: true,
      title: result.ok ? "Success" : "Order Failed",
      message: result.message,
      type: result.ok ? "success" : "error",
      redirectToOrders: result.ok,
    });
  };

  const openLocationModal = () => {
    setDraftLocation(location);
    setLocationModalOpen(true);
  };

  const handleSaveLocation = () => {
    if (!draftLocation.full || !draftLocation.lat || !draftLocation.lng) {
      setStatusModal({
        visible: true,
        title: "Location Required",
        message: "Please choose a valid location on the map.",
        type: "error",
        redirectToOrders: false,
      });
      return;
    }

    setLocation(draftLocation);
    setLocationModalOpen(false);
  };

  const pickProofImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
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
      setStatusModal({
        visible: true,
        title: "Upload Failed",
        message: "Could not pick image.",
        type: "error",
        redirectToOrders: false,
      });
    }
  };

  return (
    <>
      <ScrollView className="flex-1 bg-gray-100">
        <View className="p-5">
        <Text className="mb-2 text-2xl font-bold text-gray-900">Checkout</Text>
        <Text className="mb-5 text-sm text-gray-500">
          Confirm your order details before placing.
        </Text>

        <View className="p-4 mb-4 bg-white shadow rounded-2xl">
          <Text className="mb-3 text-base font-semibold">Order Type</Text>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => setOrderType("delivery")}
              className={`flex-1 rounded-xl py-3 items-center ${orderType === "delivery" ? "bg-orange-500" : "bg-gray-200"}`}
            >
              <Text
                className={`font-semibold ${orderType === "delivery" ? "text-white" : "text-gray-700"}`}
              >
                Delivery
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setOrderType("pickup")}
              className={`flex-1 rounded-xl py-3 items-center ${orderType === "pickup" ? "bg-orange-500" : "bg-gray-200"}`}
            >
              <Text
                className={`font-semibold ${orderType === "pickup" ? "text-white" : "text-gray-700"}`}
              >
                Pickup
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="p-4 mb-4 bg-white shadow rounded-2xl">
          <Text className="mb-2 text-base font-semibold">
            {orderType === "pickup" ? "Pickup Location" : "Delivery Location"}
          </Text>
          {loadingUser ? (
            <View className="flex-row items-center gap-2">
              <ActivityIndicator size="small" color="#f97316" />
              <Text className="text-sm text-gray-500">Loading location...</Text>
            </View>
          ) : (
            <Text className="text-sm text-gray-700">
              {orderType === "pickup"
                ? "Pickup at store"
                : location.full || "No profile location set."}
            </Text>
          )}
          {orderType === "delivery" && !location.full ? (
            <TouchableOpacity
              onPress={() => router.push("/(protected)/profile")}
              className="self-start px-4 py-2 mt-3 bg-orange-100 rounded-lg"
            >
              <Text className="text-sm font-semibold text-orange-700">
                Set Location in Profile
              </Text>
            </TouchableOpacity>
          ) : null}
          {orderType === "delivery" && (
            <TouchableOpacity
              onPress={openLocationModal}
              className="self-start px-4 py-2 mt-2 bg-gray-200 rounded-lg"
            >
              <Text className="text-sm font-semibold text-gray-700">
                Change Location
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View className="p-4 mb-4 bg-white shadow rounded-2xl">
          <Text className="mb-2 text-base font-semibold">Payment Summary</Text>
          <View className="flex-row justify-between mb-1">
            <Text className="text-gray-600">Subtotal</Text>
            <Text className="font-medium">P{Number(cartCtx.total || 0).toFixed(2)}</Text>
          </View>
          <View className="flex-row justify-between mb-1">
            <Text className="text-gray-600">Delivery Fee</Text>
            <Text className="font-medium">P{deliveryFee.toFixed(2)}</Text>
          </View>
          <View className="my-2 border-t border-gray-200" />
          <View className="flex-row justify-between">
            <Text className="font-bold text-gray-900">Total</Text>
            <Text className="text-base font-bold text-orange-600">
              P{grandTotal.toFixed(2)}
            </Text>
          </View>
        </View>

        <View className="p-4 mb-4 bg-white shadow rounded-2xl">
          <Text className="mb-2 text-base font-semibold">Payment Proof</Text>
          <Text className="mb-3 text-xs text-gray-500">
            Upload an image receipt/screenshot for your order payment.
          </Text>
          {proofImage ? (
            <Image
              source={{ uri: proofImage.uri }}
              className="w-full h-40 mb-3 rounded-xl"
              resizeMode="cover"
            />
          ) : (
            <View className="items-center justify-center w-full h-32 mb-3 border border-dashed rounded-xl border-gray-300">
              <Text className="text-sm text-gray-500">No image selected</Text>
            </View>
          )}
          <TouchableOpacity
            onPress={pickProofImage}
            className="items-center py-3 bg-orange-100 rounded-xl"
          >
            <Text className="font-semibold text-orange-700">
              {proofImage ? "Change Proof Image" : "Upload Proof Image"}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handlePlaceOrder}
          disabled={cartCtx.placingOrder}
          className={`rounded-2xl py-4 items-center mb-24 ${cartCtx.placingOrder ? "bg-orange-300" : "bg-orange-500"}`}
        >
          <Text className="text-base font-bold text-white">
            {cartCtx.placingOrder ? "Placing Order..." : "Place Order"}
          </Text>
        </TouchableOpacity>
        </View>
      </ScrollView>
      <RequestStatusModal
        visible={statusModal.visible}
        title={statusModal.title}
        message={statusModal.message}
        type={statusModal.type}
        buttonText={statusModal.redirectToOrders ? "Go to Orders" : "OK"}
        onClose={() => {
          const shouldRedirect = statusModal.redirectToOrders;
          setStatusModal((prev) => ({
            ...prev,
            visible: false,
            redirectToOrders: false,
          }));
          if (shouldRedirect) {
            router.replace("/(protected)/orders");
          }
        }}
      />
      <Modal
        visible={locationModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setLocationModalOpen(false)}
      >
        <View className="justify-end flex-1 bg-black/40">
          <View className="p-4 bg-white rounded-t-3xl" style={{ height: "75%" }}>
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-bold text-gray-900">
                Set Delivery Location
              </Text>
              <TouchableOpacity onPress={() => setLocationModalOpen(false)}>
                <Text className="font-semibold text-gray-500">Close</Text>
              </TouchableOpacity>
            </View>

            <View className="overflow-hidden rounded-xl" style={{ height: 320 }}>
              <MapComponent
                editMode
                location={draftLocation}
                setLocation={(loc) =>
                  setDraftLocation({
                    full: loc.full || "",
                    lat: Number(loc.lat || 0),
                    lng: Number(loc.lng || 0),
                  })
                }
              />
            </View>
            <Text className="mt-3 text-sm text-gray-600">
              {draftLocation.full || "Tap or search on map to select location"}
            </Text>

            <TouchableOpacity
              onPress={handleSaveLocation}
              className="items-center py-3 mt-4 bg-orange-500 rounded-xl"
            >
              <Text className="font-semibold text-white">Confirm Location</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}
