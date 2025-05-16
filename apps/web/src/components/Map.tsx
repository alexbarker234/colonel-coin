import { Icon } from "leaflet";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

// Function to calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const customIcons = {
  markerRed: new Icon({
    iconUrl: "/marker-red.png",
    iconSize: [20, 32],
    iconAnchor: [20, 32],
    popupAnchor: [0, -32]
  }),
  markerGreen: new Icon({
    iconUrl: "/marker-green.png",
    iconSize: [20, 32],
    iconAnchor: [20, 32],
    popupAnchor: [0, -32]
  }),
  markerBlue: new Icon({
    iconUrl: "/marker-blue.png",
    iconSize: [20, 32],
    iconAnchor: [20, 32],
    popupAnchor: [0, -32]
  })
};

export default function Map(props: { position: [number, number]; zoom: number }) {
  const { position: defaultPosition, zoom } = props;
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPosition: [number, number] = [position.coords.latitude, position.coords.longitude];
          setUserPosition(newPosition);
          const dist = calculateDistance(newPosition[0], newPosition[1], defaultPosition[0], defaultPosition[1]);
          setDistance(dist);
        },
        (error) => {
          setError("Unable to retrieve your location");
          console.error("Error getting location:", error);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser");
    }
  }, [defaultPosition]);

  const center = userPosition || defaultPosition;

  return (
    <div className="aspect-2/1">
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} className="h-full w-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={defaultPosition} icon={customIcons.markerRed}>
          <Popup>Default Location</Popup>
        </Marker>
        {userPosition && (
          <Marker position={userPosition} icon={customIcons.markerGreen}>
            <Popup>
              Your Current Location
              {distance !== null && <div className="mt-1">Distance: {distance.toFixed(2)} km</div>}
            </Popup>
          </Marker>
        )}
        <Marker position={[defaultPosition[0] + 0.01, defaultPosition[1] + 0.01]} icon={customIcons.markerBlue}>
          <Popup>Custom Marker 3</Popup>
        </Marker>
      </MapContainer>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}
