import { PointData } from "@/types";
import { calculateDistance } from "@/utils/mapUtils";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { PointOfInterest, pointsOfInterest } from "game-data";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet/dist/leaflet.css";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from "react-leaflet";
import { customIcons } from "./map/icons";

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

export default function Map({ gameId }: { gameId: string }) {
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [map, setMap] = useState<MapRef | null>(null);
  const { data: session } = useSession();

  const { isLoading, data: pointsData } = useQuery({
    queryKey: ["points"],
    queryFn: async () => {
      const response = await axios.get(`/api/point-game/${gameId}/info`);
      return response.data.points as PointData[];
    }
  });

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

  const handleClaim = async (pointId: string) => {
    console.log(`Claim button clicked for ${pointId}!`);
    if (!userPosition) return;

    try {
      const response = await axios.post("/api/point/claim", {
        longitude: userPosition[1],
        latitude: userPosition[0],
        pointId: pointId
      });

      if (response.data.success) {
        console.log("Point claimed successfully!");
      }
    } catch (error) {
      console.error("Error claiming point:", error);
    }
  };

  const handleDoubleClick = (point: PointOfInterest) => {
    if (!map) return;
    map.setView(point.position, 15);
  };
  console.log({ isLoading, pointsData });

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
            currentUserId={session?.user?.id}
            claimInfo={isLoading ? null : pointsData?.find((p) => p.id === point.id)}
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
  currentUserId,
  userPosition,
  claimInfo,
  handleClaim,
  onDoubleClick
}: {
  point: PointOfInterest;
  currentUserId: string;
  userPosition: [number, number] | null;
  claimInfo: PointData | null;
  handleClaim: (id: string) => void;
  onDoubleClick?: (point: PointOfInterest) => void;
}) {
  const pointDistance = userPosition
    ? calculateDistance(userPosition[0], userPosition[1], point.position[0], point.position[1])
    : null;

  const markerIcon = claimInfo?.claimedBy
    ? claimInfo.claimedBy.id === currentUserId
      ? customIcons.markerGreen
      : customIcons.markerRed
    : customIcons.markerBlue;

  const getTimeUntilClaimable = (claimedAt: Date) => {
    const twoDaysInMs = 2 * 24 * 60 * 60 * 1000;
    const timeUntilClaimable = new Date(claimedAt.getTime() + twoDaysInMs);
    const now = new Date();

    if (timeUntilClaimable <= now) return "Claimable now";

    const diff = timeUntilClaimable.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `Claimable in ${hours}h ${minutes}m`;
  };

  return (
    <Marker
      key={point.name}
      position={point.position}
      icon={markerIcon}
      eventHandlers={{
        dblclick: () => {
          onDoubleClick?.(point);
        }
      }}
    >
      <Popup maxWidth={300} minWidth={180}>
        <div className="flex flex-col items-center text-center">
          <div className="font-bold">{point.name}</div>
          {pointDistance && <div>Distance: {pointDistance.toFixed(2)} km</div>}
          {claimInfo?.claimedBy && (
            <div className=" mt-2 border rounded-md p-2">
              <div className="font-bold">Claimed by</div>
              <div className="flex items-center gap-2">
                <Image
                  src={claimInfo.claimedBy.avatar}
                  alt={claimInfo.claimedBy.username}
                  width={128}
                  height={128}
                  className="w-6 h-6 rounded-full"
                />
                <div className="w-full overflow-hidden text-ellipsis whitespace-nowrap text-xs">
                  {claimInfo.claimedBy.username}
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {getTimeUntilClaimable(new Date(claimInfo.claimedBy.claimedAt))}
              </div>
            </div>
          )}
          {userPosition && pointDistance < distanceThreshold && !claimInfo?.claimedBy && (
            <button
              onClick={() => handleClaim(point.id)}
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
