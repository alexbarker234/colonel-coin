import { PointOfInterest, pointsOfInterest } from "game-data";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from "react-leaflet";
import { customIcons } from "./map/icons";

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

function MapEvents() {
  useMapEvents({
    click: (e) => {
      console.log(`Clicked at: ${e.latlng.lat}, ${e.latlng.lng}`);
    }
  });
  return null;
}

const zoom = 13;
const defaultPosition: [number, number] = [-31.957139, 115.807917];
const distanceThreshold = 0.25;
// dont think theres an existing type for this
interface MapRef {
  setView: (position: [number, number], zoom: number) => void;
}

export default function Map() {
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [map, setMap] = useState<MapRef | null>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPosition: [number, number] = [position.coords.latitude, position.coords.longitude];
          setUserPosition(newPosition);
        },
        (error) => {
          setError("Unable to retrieve your location");
          console.error("Error getting location:", error);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser");
    }
  }, []);

  const handleClaim = (pointName: string) => {
    console.log(`Claim button clicked for ${pointName}!`);
  };

  const handleDoubleClick = (point: PointOfInterest) => {
    if (!map) return;
    map.setView(point.position, 15);
  };

  return (
    <div className="h-full">
      <MapContainer center={defaultPosition} zoom={zoom} scrollWheelZoom={true} className="h-full w-full" ref={setMap}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapEvents />
        {userPosition && (
          <Marker position={userPosition} icon={customIcons.markerGreen}>
            <Popup>Your Current Location</Popup>
          </Marker>
        )}
        {pointsOfInterest.map((point) => (
          <PointOfInterestMarker
            key={point.name}
            point={point}
            userPosition={userPosition}
            handleClaim={handleClaim}
            onDoubleClick={() => handleDoubleClick(point)}
          />
        ))}
      </MapContainer>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}

function PointOfInterestMarker({
  point,
  userPosition,
  handleClaim,
  onDoubleClick
}: {
  point: PointOfInterest;
  userPosition: [number, number] | null;
  handleClaim: (name: string) => void;
  onDoubleClick?: (point: PointOfInterest) => void;
}) {
  const pointDistance = userPosition
    ? calculateDistance(userPosition[0], userPosition[1], point.position[0], point.position[1])
    : null;

  return (
    <Marker
      key={point.name}
      position={point.position}
      icon={customIcons.markerBlue}
      eventHandlers={{
        dblclick: () => {
          onDoubleClick?.(point);
        }
      }}
    >
      <Popup>
        <div className="flex flex-col items-center text-center">
          <div className="font-bold">{point.name}</div>
          {pointDistance && <div>Distance: {pointDistance.toFixed(2)} km</div>}
          {userPosition && pointDistance < distanceThreshold && (
            <button
              onClick={() => handleClaim(point.name)}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Claim
            </button>
          )}
        </div>
      </Popup>
    </Marker>
  );
}
