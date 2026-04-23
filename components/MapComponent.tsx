import { coordinate } from "@/types/Map";
import { ReverseGeolocation, handleSearch } from "@/utils/Map";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { WebView } from "react-native-webview";

type LocationState = {
  lat: number | null;
  lng: number | null;
  city?: string;
  country?: string;
  full?: string;
};

type MapComponentProps = {
  lat2?: number | null;
  lng2?: number | null;
  editMode?: boolean;
  location?: LocationState;
  setLocation?: (loc: LocationState) => void;
  showSearchBar?: boolean;
  interactive?: boolean;
};

const DEFAULT_LAT = 14.9581;
const DEFAULT_LNG = 120.7589;
const DEFAULT_ZOOM = 14;

export default function MapComponent({
  lat2,
  lng2,
  editMode = false,
  location: externalLocation,
  setLocation: externalSetLocation,
  showSearchBar = true,
  interactive = true,
}: MapComponentProps) {
  const webViewRef = useRef<WebView>(null);
  const timeoutRef = useRef<any>(null);

  const [search, setSearch] = useState("");
  const [internalLocation, setInternalLocation] = useState<coordinate | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  const usesExternalLocation = !!externalLocation;
  const activeLocation = usesExternalLocation ? externalLocation : internalLocation;

  const hasValidCoordinates = (lat: number | null | undefined, lng: number | null | undefined) =>
    lat != null && lng != null && !Number.isNaN(lat) && !Number.isNaN(lng);

  // 🔒 Safe injection
  const injectSafe = (js: string) => {
    if (!isMapReady) return;
    webViewRef.current?.injectJavaScript(`
      try { ${js} } catch(e) {}
      true;
    `);
  };

  // 🚀 Batch update (marker + camera)
  const updateMap = (lat: number, lng: number) => {
    injectSafe(`
      if (typeof setMarker === 'function' && typeof flyToLocation === 'function') {
        setMarker(${lat}, ${lng});
        flyToLocation(${lat}, ${lng}, ${DEFAULT_ZOOM});
      }
    `);
  };

  useEffect(() => {
    if (!editMode && lat2 != null && lng2 != null) {
      setInternalLocation({ lat: lat2, lng: lng2 });
    }
  }, [lat2, lng2, editMode]);

  // ⚡ Debounced updates
  useEffect(() => {
    if (!hasValidCoordinates(activeLocation?.lat, activeLocation?.lng)) return;

    clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      updateMap(activeLocation!.lat!, activeLocation!.lng!);
    }, 120);
  }, [activeLocation, isMapReady]);

  // 🧠 Optimized message handler
  const handleMessage = (event: any) => {
    if (!interactive) return;
    if (usesExternalLocation && !editMode) return;

    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === "click") {
        const { lat, lng } = data;

        setTimeout(async () => {
          const loc = await ReverseGeolocation({ lat, lng });

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
        }, 0);
      }
    } catch (e) {
      console.log("Map message error:", e);
    }
  };

  const fakeMapRef = {
    current: {
      flyTo: ({ center }: { center: [number, number] }) => {
        updateMap(center[1], center[0]);
      },
    },
  } as any;

  // 🔥 Memoized HTML (prevents reload)
  const leafletHTML = useMemo(() => `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
html, body, #map {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}
</style>
</head>
<body>
<div id="map"></div>
<script>
  var map = L.map('map').setView([${DEFAULT_LAT}, ${DEFAULT_LNG}], ${DEFAULT_ZOOM});

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
  }).addTo(map);

  var marker = null;

  function setMarker(lat, lng) {
    if (marker) {
      marker.setLatLng([lat, lng]);
    } else {
      marker = L.marker([lat, lng]).addTo(map);
    }
  }

  function flyToLocation(lat, lng, zoom) {
    map.flyTo([lat, lng], zoom || 14, { duration: 0.5 });
  }

  map.on('click', function(e) {
    var lat = e.latlng.lat;
    var lng = e.latlng.lng;

    setMarker(lat, lng);

    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: "click",
      lat: lat,
      lng: lng
    }));
  });
</script>
</body>
</html>
  `, []);

  return (
    <View style={styles.container}>
      {showSearchBar && (
        <View className="absolute z-50 flex-row items-center p-2 bg-white rounded-full shadow top-5 left-4 right-4">
          <TextInput
            className="flex-1 px-4 py-2"
            placeholder="Search location"
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={(e) =>
              handleSearch(
                e.nativeEvent.text,
                fakeMapRef,
                setSearch,
                usesExternalLocation && editMode && externalSetLocation
                  ? (loc: LocationState) => externalSetLocation(loc)
                  : setInternalLocation,
              )
            }
          />
        </View>
      )}

      <WebView
        ref={webViewRef}
        style={styles.map}
        source={{ html: leafletHTML }}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={["*"]}
        onLoadEnd={() => setIsMapReady(true)}
        androidLayerType="software"
        cacheEnabled
        allowFileAccess
        allowUniversalAccessFromFileURLs
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});