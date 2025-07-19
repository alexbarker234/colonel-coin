"use client";

import { divIcon } from "leaflet";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";

interface PointFormMapProps {
  onMapClick: (lat: number, lng: number) => void;
  selectedLat: string;
  selectedLng: string;
}

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

export default function PointFormMap({ onMapClick, selectedLat, selectedLng }: PointFormMapProps) {
  const defaultPosition: [number, number] = [-31.957139, 115.807917];
  const zoom = 13;

  return (
    <div className="h-64 w-full rounded-lg overflow-hidden border border-zinc-600">
      <MapContainer center={defaultPosition} zoom={zoom} scrollWheelZoom={true} className="h-full w-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapClickHandler onMapClick={onMapClick} />

        {selectedLat && selectedLng && (
          <Marker
            position={[parseFloat(selectedLat), parseFloat(selectedLng)]}
            icon={divIcon({
              className: "custom-div-icon",
              html: `<div style="background-color: #10b981; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            })}
          />
        )}
      </MapContainer>
    </div>
  );
}
