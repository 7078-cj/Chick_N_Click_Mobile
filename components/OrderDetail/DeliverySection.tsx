import { AppText } from "@/components/typography";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Linking, TouchableOpacity, View } from "react-native";
import MapComponent from "../MapComponent";
import { SectionLabel } from "./ui";

type DeliverySectionProps = {
  location?: string;
  latitude: number;
  longitude: number;
  hasCoords: boolean;
};

export function DeliverySection({
  location,
  latitude,
  longitude,
  hasCoords,
}: DeliverySectionProps) {
  return (
    <>
      {/* Map */}
      {hasCoords ? (
        <View className="mb-5">
          <SectionLabel label="Delivery map" />
          <View
            className="overflow-hidden rounded-2xl border border-gray-100"
            style={{ height: 180 }}
          >
            <MapComponent
              lat2={latitude}
              lng2={longitude}
              showSearchBar={false}
              interactive={false}
            />
          </View>
        </View>
      ) : null}

      {/* Address card */}
      <View className="p-4 mb-5 rounded-2xl bg-gray-50">
        <SectionLabel label="Delivery address" />
        <AppText className="text-sm text-gray-800 leading-relaxed">
          {location || "No address on record"}
        </AppText>
        {hasCoords ? (
          <TouchableOpacity
            className="flex-row items-center gap-1 mt-3 self-start"
            onPress={() =>
              Linking.openURL(
                `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
              )
            }
          >
            <Ionicons name="navigate-outline" size={15} color="#ea580c" />
            <AppText className="text-xs font-bold text-orange-600">
              Open in Maps
            </AppText>
          </TouchableOpacity>
        ) : null}
      </View>
    </>
  );
}
