import { CLAIM_COOLDOWN, DISTANCE_THRESHOLD } from "@/constants";
import { useClaimPoint, useGetPoints } from "@/hooks/pointGame";
import { PointData } from "@/types";
import { calculateDistance } from "@/utils/mapUtils";
import { PointOfInterest } from "database";
import { divIcon } from "leaflet";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet/dist/leaflet.css";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from "react-leaflet";
import { customIcons } from "../lib/mapIcons";
import PulseLoader from "./PulseLoader";

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
// dont think theres an existing type for this
interface MapRef {
  setView: (position: [number, number], zoom: number) => void;
}
type PositionStatus = "loading" | "denied" | "unavailable" | "success";

export default function Map({ gameId }: { gameId: string }) {
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [positionStatus, setPositionStatus] = useState<PositionStatus>("loading");

  const [error, setError] = useState<string | null>(null);
  const [map, setMap] = useState<MapRef | null>(null);
  const { data: session } = useSession();

  const { isLoading, data: pointsData } = useGetPoints(gameId);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPosition: [number, number] = [position.coords.latitude, position.coords.longitude];
          setUserPosition(newPosition);
          setPositionStatus("success");
        },
        (error) => {
          setError("Unable to retrieve your location");
          console.error("Error getting location:", error);
          if (error.code === 1) {
            setPositionStatus("denied");
          } else {
            setPositionStatus("unavailable");
          }
        },
        { enableHighAccuracy: true }
      );
    } else {
      setError("Geolocation is not supported by your browser");
    }
  }, []);

  const handleDoubleClick = (point: PointOfInterest) => {
    if (!map) return;
    map.setView([+point.latitude, +point.longitude], 15);
  };

  return (
    <div className="h-full relative">
      <MapContainer
        center={defaultPosition}
        zoom={zoom}
        scrollWheelZoom={true}
        className="h-full w-full relative z-0"
        ref={setMap}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapEvents />
        <LocationInfo positionStatus={positionStatus} />

        {userPosition && (
          <Marker
            position={userPosition}
            // i dont like this
            icon={divIcon({
              className: "custom-div-icon",
              html: `<div style="background-color: red; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white;"></div>`,
              iconSize: [16, 16],
              iconAnchor: [8, 8]
            })}
          >
            <Popup>Your Current Location</Popup>
          </Marker>
        )}
        {pointsData?.map((point) => (
          <PointOfInterestMarker
            key={point.name}
            point={point}
            currentUserId={session?.user?.id}
            gameId={gameId}
            claimInfo={isLoading ? null : pointsData?.find((p) => p.id === point.id)}
            userPosition={userPosition}
            onDoubleClick={() => handleDoubleClick(point)}
          />
        ))}
      </MapContainer>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}

function LocationInfo({ positionStatus }: { positionStatus: PositionStatus }) {
  if (positionStatus === "success") return null;

  return (
    <div className="flex items-center justify-center w-fit p-2 rounded-full mx-auto my-2 absolute top-0 left-0 right-0 bg-black/50 text-white py-2 text-center z-[1010]">
      {positionStatus === "loading" && (
        <>
          <span className="mr-2">Loading your position</span>
          <PulseLoader />
        </>
      )}
      {positionStatus === "denied" && <span>Permission denied. Please enable location services.</span>}
      {positionStatus === "unavailable" && <span>Location services unavailable.</span>}
    </div>
  );
}

function PointOfInterestMarker({
  point,
  currentUserId,
  userPosition,
  claimInfo,
  gameId,
  onDoubleClick
}: {
  point: PointOfInterest;
  currentUserId: string;
  userPosition: [number, number] | null;
  claimInfo: PointData | null;
  gameId: string;
  onDoubleClick?: (point: PointOfInterest) => void;
}) {
  const pointDistance = userPosition
    ? calculateDistance(userPosition[0], userPosition[1], +point.latitude, +point.longitude)
    : null;

  const markerIcon = claimInfo?.claimedBy
    ? claimInfo.claimedBy.id === currentUserId
      ? customIcons.markerGreen
      : customIcons.markerRed
    : customIcons.markerBlue;

  const getTimeUntilClaimable = (claimedAt: Date) => {
    const timeUntilClaimable = new Date(claimedAt.getTime() + CLAIM_COOLDOWN);
    const now = new Date();

    if (timeUntilClaimable <= now) return "Claimable now";

    const diff = timeUntilClaimable.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `Claimable in ${hours}h ${minutes}m`;
  };

  const isClaimable =
    !claimInfo?.claimedBy ||
    (claimInfo.claimedBy && new Date(claimInfo.claimedBy.claimedAt).getTime() + CLAIM_COOLDOWN <= new Date().getTime());

  const { mutate: claimPoint } = useClaimPoint();

  return (
    <Marker
      key={point.name}
      position={[+point.latitude, +point.longitude]}
      icon={markerIcon}
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
          {claimInfo?.claimedBy && (
            <div className="flex flex-col mt-2 border rounded-md px-4 py-2">
              <div className="font-bold">Claimed by</div>
              {/* this is some ridiculous jank with mr since the contents keep overflowing due to padding */}
              <div className="flex items-center gap-2 w-full justify-center mr-2">
                <Image
                  src={claimInfo.claimedBy.avatar}
                  alt=""
                  width={128}
                  height={128}
                  className="w-6 h-6 rounded-full"
                />
                <div className="text-xs">{claimInfo.claimedBy.username}</div>
              </div>
              <div className="text-xs text-gray-500">
                {getTimeUntilClaimable(new Date(claimInfo.claimedBy.claimedAt))}
              </div>
            </div>
          )}
          {userPosition && pointDistance < DISTANCE_THRESHOLD && isClaimable && (
            <button
              onClick={() =>
                claimPoint({ gameId, pointId: point.id, longitude: userPosition[1], latitude: userPosition[0] })
              }
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
            >
              Claim
            </button>
          )}
        </div>
      </Popup>
    </Marker>
  );
}
