import { coordinate } from '@/types/Map';
import { ReverseGeolocation, fetchRoute, handleSearch } from '@/utils/Map';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import MapView, { MapPressEvent, Marker, Polyline } from 'react-native-maps';

type MarkerInfo = {
  lat: number;
  lng: number;
  city?: string;
  country?: string;
  full?: string;
};

type Markers = {
  start: { lat: number; lng: number };
  end: MarkerInfo | null;
};

export default function MapComponent() {
    const mapRef = useRef<MapView>(null);
    const [location, setLocation] = useState<coordinate | null>(null);
    const [routeCoords, setRouteCoords] = useState<{ latitude: number; longitude: number }[]>([]);
    const [search, setSearch] = useState('')
    const HOC_LOCATION = {
        lat: 14.958753194320153,
        lng: 120.75846924744896,
        };

    const handlePress = async (e: MapPressEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;

    const loc = await ReverseGeolocation({ lat: latitude, lng: longitude });

    const newMarkers = { lat: loc.lat, lng: loc.lng, city: loc.city, country: loc.country, full: loc.full };
    setLocation(newMarkers);
    }

    useEffect(()=>{
        if(location){
            fetchRoute({ start: HOC_LOCATION, end: location, setRouteCoords });
        }
        
    },[location])

  return (
    <View >
        <View className="absolute z-50 flex-row items-center p-2 bg-white rounded-full shadow top-5 left-4 right-4">
        <TextInput
            className="flex-1 px-4 py-2"
            placeholder="Search for a location"
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={(e) =>
                handleSearch(e.nativeEvent.text, mapRef, setSearch, setLocation)
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
        
        <Marker
            key={1}
            coordinate={{ latitude: HOC_LOCATION.lat, longitude: HOC_LOCATION.lng }}
            title={`House of Chicken`}
            description={'House of Chicken'}
          />

        {location && 
            <Marker
            key={2}
            coordinate={{ latitude: location.lat, longitude: location.lng }}
            title={location.full}
            description={'delivery location'}
          />
        }
       

        {/* Draw polyline for route if available */}
        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeColor="#3B82F6"
            strokeWidth={4}
          />
        )}
      </MapView>
    </View>
  );
}




const styles = StyleSheet.create({ map: { width: '100%', height: '80%', } });
