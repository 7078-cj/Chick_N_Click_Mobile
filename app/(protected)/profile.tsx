import { getCurrentUser, updateUser } from "@/api/user";
import LocationSelector from "@/components/LocationSelector";
import MapComponent from "@/components/MapComponent";
import MapModal from "@/components/MapModal";
import { AppText } from "@/components/typography";
import RequestStatusModal from "@/components/RequestStatusModal";
import { TAB_BAR_SCROLL_INSET } from "@/constants/theme";
import AuthContext from "@/contexts/AuthContext";
import { TabContext } from "@/contexts/TabContext";

import { useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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

  const token = auth?.token;

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openedMap, setOpenedMap] = useState(false);
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

  // Sync location → form safely
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

      const res = await getCurrentUser(token);
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

      const res = await updateUser(token, payload);

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
          validationMessage || data?.message || `Status: ${res.status}`
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
      <View className="flex-1 items-center justify-center gap-3 bg-white">
        <ActivityIndicator size="large" color="#F97316" />
        <AppText className="text-sm text-gray-400">Loading profile...</AppText>
      </View>
    );
  }

  // ── UI ──────────────────────────────────
  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#F5F5F5]"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: TAB_BAR_SCROLL_INSET }}
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center" style={{ paddingTop: 80 }}>

          {/* FLOATING LOGO — sits above the card */}
          <View
            style={{
              position: "absolute",
              top: 20,
              zIndex: 10,
              backgroundColor: "#fff",
              borderRadius: 60,
              padding: 6,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.12,
              shadowRadius: 6,
              elevation: 6,
            }}
          >
            <Image
              source={require("@/assets/images/Logo_Single.png")}
              style={{ width: 90, height: 90, resizeMode: "contain" }}
            />
          </View>

          {/* CARD */}
          <View
            className="w-[92%] bg-white rounded-[30px] px-5 pb-6"
            style={{
              paddingTop: 64,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            {/* TITLE */}
            <AppText className="text-lg font-bold text-center text-gray-800 mb-4">
              Account Settings
            </AppText>

            {/* SECTION LABEL */}
            <AppText className="text-gray-400 mb-2">Personal Information</AppText>

            {/* NAME ROW */}
            <View className="flex-row gap-2">
              <TextInput
                className="flex-1 bg-[#F3F3F3] rounded-xl px-4 py-3 mb-2"
                placeholder="First Name"
                value={formData.first_name}
                editable={isEditing}
                onChangeText={(v) =>
                  setFormData((p) => ({ ...p, first_name: v }))
                }
              />
              <TextInput
                className="flex-1 bg-[#F3F3F3] rounded-xl px-4 py-3 mb-2"
                placeholder="Last Name"
                value={formData.last_name}
                editable={isEditing}
                onChangeText={(v) =>
                  setFormData((p) => ({ ...p, last_name: v }))
                }
              />
            </View>

            {/* PHONE */}
            <TextInput
              className="bg-[#F3F3F3] rounded-xl px-4 py-3 mb-2"
              placeholder="+639XXXXXXXXX"
              value={formData.phone_number}
              editable={isEditing}
              onChangeText={(v) =>
                setFormData((p) => ({ ...p, phone_number: v }))
              }
            />

            {/* LOCATION SECTION */}
            <AppText className="text-gray-400 mt-2 mb-2">Your Location</AppText>

            {isEditing ? (
              /* Edit mode: LocationSelector opens the MapModal */
              (
              <View className="bg-[#F3F3F3] rounded-2xl overflow-hidden">
                <View style={{ height: 200 }}>
                  <MapComponent
                    editMode={false}
                    location={location}
                    setLocation={setLocation}
                    showSearchBar={false}
                    interactive={false}
                  />
                </View>
              <LocationSelector
                location={location}
                setOpenedMap={setOpenedMap}
              />
              </View>)
            ) : (
              /* View mode: compact read-only map preview */
              <View className="bg-[#F3F3F3] rounded-2xl overflow-hidden">
                <View style={{ height: 200 }}>
                  <MapComponent
                    editMode={false}
                    location={location}
                    setLocation={setLocation}
                    showSearchBar={false}
                    interactive={false}
                  />
                </View>
                {location.full ? (
                  <View className="flex-row items-center px-4 py-3 gap-2">
                    <AppText className="text-sm">📍</AppText>
                    <AppText
                      className="text-gray-600 text-xs flex-1"
                      numberOfLines={2}
                    >
                      {location.full}
                    </AppText>
                  </View>
                ) : null}
              </View>
            )}

            {/* EDIT / SAVE BUTTON */}
            <TouchableOpacity
              onPress={() => (isEditing ? handleSave() : setIsEditing(true))}
              disabled={saving}
              className="mt-4 bg-orange-500 rounded-full py-3 items-center"
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <AppText className="text-white font-bold">
                  {isEditing ? "Save Changes" : "Edit Profile"}
                </AppText>
              )}
            </TouchableOpacity>

            {/* LOGOUT */}
            <TouchableOpacity
              onPress={() => auth?.logoutUser()}
              className="mt-3 bg-red-500 rounded-full py-3 items-center"
            >
              <AppText className="text-white font-bold">Logout</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* MAP MODAL — only mounted when editing */}
      <MapModal
        opened={openedMap}
        setOpened={setOpenedMap}
        location={location}
        handleLocationChange={setLocation}
      />

      <RequestStatusModal
        visible={statusModal.visible}
        title={statusModal.title}
        message={statusModal.message}
        type={statusModal.type}
        onClose={() =>
          setStatusModal((prev) => ({ ...prev, visible: false }))
        }
      />
    </KeyboardAvoidingView>
  );
}