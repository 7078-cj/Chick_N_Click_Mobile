import { coordinate } from "@/types/Map";
import { ReverseGeolocation, handleSearch } from "@/utils/Map";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import MapView, { MapPressEvent, Marker } from "react-native-maps";

type LocationState = {
  lat: number | null;
  lng: number | null;
  city?: string;
  country?: string;
  full?: string;
};

type MapComponentProps = {
  // ── Delivery-map props (unchanged) ────────────────────────────────────────
  lat2?: number | null;
  lng2?: number | null;
  // ── Register-map props ────────────────────────────────────────────────────
  editMode?: boolean;
  location?: LocationState;
  setLocation?: (loc: LocationState) => void;
};

export default function MapComponent({
  lat2,
  lng2,
  editMode = false,
  location: externalLocation,
  setLocation: externalSetLocation,
}: MapComponentProps) {
  const mapRef = useRef<MapView>(null);
  const hasValidCoordinates = (lat: number | null, lng: number | null) =>
    lat !== null && lng !== null && !Number.isNaN(lat) && !Number.isNaN(lng);

  // Internal location state — used only in delivery mode (lat2/lng2 flow)
  const [internalLocation, setInternalLocation] = useState<coordinate | null>(
    null,
  );

  const [search, setSearch] = useState("");
  const usesExternalLocation = !!externalLocation;

  // ── Which location object to render the user marker from ─────────────────
  // In editMode (Register), use externalLocation controlled by the parent.
  // In delivery mode, use internalLocation.
  const activeLocation = usesExternalLocation ? externalLocation : internalLocation;

  // ── Handle map tap ────────────────────────────────────────────────────────
  const handlePress = async (e: MapPressEvent) => {
    if (usesExternalLocation && !editMode) return;

    const { latitude, longitude } = e.nativeEvent.coordinate;
    const loc = await ReverseGeolocation({ lat: latitude, lng: longitude });

    const resolved: LocationState = {
      lat: loc.lat,
      lng: loc.lng,
      city: loc.city,
      country: loc.country,
      full: loc.full,
    };

    if (usesExternalLocation && externalSetLocation) {
      externalSetLocation(resolved);
    } else {
      setInternalLocation(resolved);
    }
  };

  // ── Delivery mode: sync when lat2/lng2 props change ───────────────────────
  useEffect(() => {
    if (!editMode && lat2 != null && lng2 != null) {
      setInternalLocation({ lat: lat2, lng: lng2 });
    }
  }, [lat2, lng2, editMode]);

  // ── Animate map to the selected location when it changes ─────────────────
  useEffect(() => {
    if (hasValidCoordinates(activeLocation?.lat ?? null, activeLocation?.lng ?? null)) {
      mapRef.current?.animateToRegion(
        {
          latitude: activeLocation!.lat!,
          longitude: activeLocation!.lng!,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        500,
      );
    }
  }, [activeLocation]);

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View className="absolute z-50 flex-row items-center p-2 bg-white rounded-full shadow top-5 left-4 right-4">
        <TextInput
          className="flex-1 px-4 py-2"
          placeholder="Search for a location"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={(e) =>
            handleSearch(
              e.nativeEvent.text,
              mapRef,
              setSearch,
              // In editMode, wrap handleSearch result to lift state up
              usesExternalLocation && editMode && externalSetLocation
                ? (loc: LocationState) => {
                    if (loc) externalSetLocation(loc as LocationState);
                  }
                : setInternalLocation,
            )
          }
          returnKeyType="search"
        />
      </View>

      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: 14.9581,
          longitude: 120.7589,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        onPress={handlePress}
      >
        {/* User / delivery location marker */}
        {hasValidCoordinates(activeLocation?.lat ?? null, activeLocation?.lng ?? null) && (
          <Marker
            coordinate={{
              latitude: activeLocation!.lat!,
              longitude: activeLocation!.lng!,
            }}
            title={activeLocation?.full ?? "Selected location"}
            description={usesExternalLocation ? "Your location" : "Delivery location"}
          />
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", height: "100%" },
  map: { width: "100%", height: "100%" },
});
