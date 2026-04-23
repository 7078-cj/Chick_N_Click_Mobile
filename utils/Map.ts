import { coordinate, route } from "@/types/Map";
import { Alert } from "react-native";
import MapView from "react-native-maps";

const NOMINATIM_HEADERS = {
  "User-Agent": "ReactNativeApp/1.0 (7078ceejay@gmail.com)",
  "Accept-Language": "en",
};

export async function ReverseGeolocation({ lat, lng }: coordinate) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: NOMINATIM_HEADERS },
    );

    if (!res.ok) {
      console.log("Reverse geocode HTTP error:", res.status);
      return { lat, lng, city: "", country: "", full: "" };
    }

    const data = await res.json();

    return {
      lat,
      lng,
      city:
        data.address?.city || data.address?.town || data.address?.village || "",
      country: data.address?.country || "",
      full: data.display_name || "",
    };
  } catch (err) {
    console.log("Reverse geocode error:", err);
    return { lat, lng, city: "", country: "", full: "" };
  }
}

export const fetchRoute = async ({ start, end, setRouteCoords }: route) => {
  const ORS_API_KEY = process.env.EXPO_PUBLIC_ORS_API_KEY;
  try {
    const res = await fetch(
      `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_API_KEY}&start=${start.lng},${start.lat}&end=${end?.lng},${end?.lat}`,
    );
    const data = await res.json();

    if (!res.ok || !data.features) throw new Error("Failed to fetch route");

    const coords: any[] = data.features[0].geometry.coordinates.map(
      (c: [number, number]) => ({ longitude: c[0], latitude: c[1] }),
    );
    setRouteCoords(coords);
  } catch (err: any) {
    console.log("Error fetching route:", err);
    Alert.alert("Error", err.message || "Failed to fetch route");
  }
};

export const handleSearch = async (
  search: string,
  mapRef: React.RefObject<MapView | null>,
  setSearch: any,
  setLocation: any,
) => {
  if (!search) return;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(search)}&format=json&limit=1`,
      { headers: NOMINATIM_HEADERS }, // ← shared headers, consistent with ReverseGeolocation
    );

    if (!res.ok) {
      console.log("Search HTTP error:", res.status);
      return;
    }

    const data = await res.json();

    if (!data || data.length === 0) return;

    const result = data[0];
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);

    if (isNaN(lat) || isNaN(lng)) return;

    const loc: coordinate = {
      lat,
      lng,
      city: result.display_name,
      country: result.display_name,
      full: result.display_name,
    };

    mapRef.current?.animateToRegion(
      {
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      1000,
    );

    setLocation(loc);
    setSearch("");
  } catch (err) {
    console.log("Search error:", err);
  }
};
