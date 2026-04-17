import MapComponent from "@/components/MapComponent";
import RequestStatusModal from "@/components/RequestStatusModal";
import AuthContext from "@/contexts/AuthContext";
import { TabContext } from "@/contexts/TabContext";

import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type LocationState = {
  lat: number | null;
  lng: number | null;
  city?: string;
  country?: string;
  full?: string;
};

export default function Profile() {
  const auth = useContext(AuthContext);
  const tab = useContext(TabContext);
  const router = useRouter();

  const url = process.env.EXPO_PUBLIC_API_URL;
  const token = auth?.token;

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusModal, setStatusModal] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info" as "success" | "error" | "info",
  });

  const [location, setLocation] = useState<LocationState>({
    lat: null,
    lng: null,
    city: "",
    country: "",
    full: "",
  });

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    note: "",
    location: "",
    latitude: null as number | null,
    longitude: null as number | null,
  });

  const hasValidCoordinates = (lat: number | null, lng: number | null) =>
    lat !== null && lng !== null && !Number.isNaN(lat) && !Number.isNaN(lng);

  useEffect(() => {
    tab?.setActive("Profile");
    fetchUser();
  }, []);

  // ✅ Sync location → form safely
  useEffect(() => {
    if (!hasValidCoordinates(location.lat, location.lng)) return;

    setFormData((prev) => ({
      ...prev,
      location: location.full || "",
      latitude: location.lat,
      longitude: location.lng,
    }));
  }, [location]);

  const fetchUser = async () => {
    setLoading(true);
    try {
      if (!token) throw new Error("Token missing");

      const res = await fetch(`${url}/api/user`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error(`Status: ${res.status}`);
      const data = await res.json();
      const latitude =
        data.latitude !== null && data.latitude !== undefined
          ? Number(data.latitude)
          : null;
      const longitude =
        data.longitude !== null && data.longitude !== undefined
          ? Number(data.longitude)
          : null;

      setFormData({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        phone_number: data.phone_number || "",
        note: data.note || "",
        location: data.location || "",
        latitude: !Number.isNaN(latitude) ? latitude : null,
        longitude: !Number.isNaN(longitude) ? longitude : null,
      });

      if (hasValidCoordinates(latitude, longitude)) {
        setLocation({
          lat: latitude,
          lng: longitude,
          city: "",
          country: "",
          full: data.location || "",
        });
      } else {
        setLocation((prev) => ({
          ...prev,
          full: data.location || "",
          lat: null,
          lng: null,
        }));
      }
    } catch (err: any) {
      setStatusModal({
        visible: true,
        title: "Error",
        message: err.message || "Failed to load user data.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (saving || !token) {
      if (!token) {
        setStatusModal({
          visible: true,
          title: "Error",
          message: "Missing authentication token.",
          type: "error",
        });
      }
      return;
    }

    setSaving(true);
    try {
      const computedName =
        `${formData.first_name} ${formData.last_name}`.trim() ||
        auth?.user?.name ||
        "";
      const payload = { ...formData, name: computedName };

      const res = await fetch(`${url}/api/user/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const firstValidationError =
          data?.errors && typeof data.errors === "object"
            ? Object.values(data.errors)?.[0]
            : null;
        const validationMessage = Array.isArray(firstValidationError)
          ? firstValidationError[0]
          : firstValidationError;
        throw new Error(
          validationMessage ||
            data?.message ||
            `Status: ${res.status}`,
        );
      }

      setIsEditing(false);
      setStatusModal({
        visible: true,
        title: "Success",
        message: "Profile updated successfully.",
        type: "success",
      });
    } catch (err: any) {
      setStatusModal({
        visible: true,
        title: "Update Failed",
        message: err.message || "Unable to save changes.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  // ── Loading ─────────────────────────────
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-gray-100">
        <ActivityIndicator size="large" color="#F97316" />
        <Text className="text-sm text-gray-400">Loading profile...</Text>
      </View>
    );
  }

  // ── UI ──────────────────────────────────
  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-100"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-10"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-14 pb-5">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-white items-center justify-center shadow"
          >
            <Ionicons name="chevron-back" size={20} color="#555" />
          </TouchableOpacity>

          <View className="w-16 h-16 rounded-full bg-orange-50 items-center justify-center shadow">
            <Text className="text-3xl">🍗</Text>
          </View>

          <TouchableOpacity
            onPress={() => (isEditing ? handleSave() : setIsEditing(true))}
            disabled={saving}
            className="w-10 h-10 rounded-full bg-orange-500 items-center justify-center shadow"
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <MaterialIcons
                name={isEditing ? "check" : "edit"}
                size={18}
                color="#fff"
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Card */}
        <View className="mx-4 bg-white rounded-3xl p-5 shadow">
          <Text className="text-xl font-bold text-center text-gray-900 mb-5">
            Account Settings
          </Text>

          {/* Personal Info */}
          <Text className="text-xs font-semibold text-gray-400 uppercase mb-2">
            Personal Information
          </Text>

          <View className="flex-row gap-2">
            <TextInput
              className="flex-1 bg-gray-50 border rounded-xl px-3.5 py-3 mb-2"
              placeholder="First Name"
              value={formData.first_name}
              editable={isEditing}
              onChangeText={(v) =>
                setFormData((p) => ({ ...p, first_name: v }))
              }
            />
            <TextInput
              className="flex-1 bg-gray-50 border rounded-xl px-3.5 py-3 mb-2"
              placeholder="Last Name"
              value={formData.last_name}
              editable={isEditing}
              onChangeText={(v) =>
                setFormData((p) => ({ ...p, last_name: v }))
              }
            />
          </View>

          <TextInput
            className="bg-gray-50 border rounded-xl px-3.5 py-3 mb-2"
            placeholder="+639XXXXXXXXX"
            value={formData.phone_number}
            editable={isEditing}
            keyboardType="phone-pad"
            onChangeText={(v) =>
              setFormData((p) => ({ ...p, phone_number: v }))
            }
          />

          <TextInput
            className="bg-gray-50 border rounded-xl px-3.5 py-3 mb-2"
            placeholder="Add Note"
            value={formData.note}
            editable={isEditing}
            onChangeText={(v) =>
              setFormData((p) => ({ ...p, note: v }))
            }
          />

          {/* Location */}
          <Text className="text-xs font-semibold text-gray-400 mt-4 mb-2">
            Your Location
          </Text>

          <View className="bg-orange-50 border rounded-xl p-3 mb-3">
            <View className="flex-row items-center gap-2">
              <Ionicons name="location-outline" size={16} color="#F97316" />
              <Text className="flex-1 text-sm font-semibold">
                {location.full || formData.location || "Location not set"}
              </Text>
            </View>
          </View>

          {/* ✅ FIXED MAP */}
          <View className="rounded-2xl overflow-hidden h-60">
            <MapComponent
              editMode={isEditing}
              location={location}
              setLocation={setLocation}
            />
          </View>

          {isEditing && (
            <Text className="text-xs text-orange-500 text-center mt-2">
              Tap or search to update your location
            </Text>
          )}

          {/* Logout */}
          <TouchableOpacity
            onPress={() => auth?.logoutUser()}
            className="mt-5 bg-red-500 rounded-2xl py-4 items-center"
          >
            <Text className="text-white font-bold">Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <RequestStatusModal
        visible={statusModal.visible}
        title={statusModal.title}
        message={statusModal.message}
        type={statusModal.type}
        onClose={() =>
          setStatusModal((prev) => ({
            ...prev,
            visible: false,
          }))
        }
      />
    </KeyboardAvoidingView>
  );
}