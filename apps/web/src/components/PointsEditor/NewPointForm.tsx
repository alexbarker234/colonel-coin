"use client";

import { divIcon } from "leaflet";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet/dist/leaflet.css";
import { useState } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import { useAddPoint } from "../../hooks/editPoints";

interface NewPointFormProps {
  guildId: string;
  onCancel: () => void;
  onSuccess: () => void;
}

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

export default function NewPointForm({ guildId, onCancel, onSuccess }: NewPointFormProps) {
  const [newPoint, setNewPoint] = useState({
    name: "",
    latitude: "",
    longitude: ""
  });

  const addPointMutation = useAddPoint(guildId);

  const handleMapClick = (lat: number, lng: number) => {
    setNewPoint({
      ...newPoint,
      latitude: lat.toString(),
      longitude: lng.toString()
    });
  };

  const handleAddPoint = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPoint.name || !newPoint.latitude || !newPoint.longitude) {
      return;
    }

    const lat = parseFloat(newPoint.latitude);
    const lng = parseFloat(newPoint.longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return;
    }

    await addPointMutation.mutateAsync({
      name: newPoint.name,
      latitude: lat,
      longitude: lng
    });

    setNewPoint({ name: "", latitude: "", longitude: "" });
    onSuccess();
  };

  const defaultPosition: [number, number] = [-31.957139, 115.807917];
  const zoom = 13;

  return (
    <form onSubmit={handleAddPoint} className="mb-6 p-4 bg-zinc-800 rounded-lg border border-zinc-600">
      <h3 className="text-lg font-medium text-white mb-4">Add New Point</h3>

      {/* Map Section */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">Click on the map to set coordinates</label>
        <div className="h-64 w-full rounded-lg overflow-hidden border border-zinc-600">
          <MapContainer center={defaultPosition} zoom={zoom} scrollWheelZoom={true} className="h-full w-full">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapClickHandler onMapClick={handleMapClick} />

            {newPoint.latitude && newPoint.longitude && (
              <Marker
                position={[parseFloat(newPoint.latitude), parseFloat(newPoint.longitude)]}
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
          <input
            type="text"
            value={newPoint.name}
            onChange={(e) => setNewPoint({ ...newPoint, name: e.target.value })}
            className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Point name"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Latitude</label>
          <input
            type="number"
            step="any"
            value={newPoint.latitude}
            onChange={(e) => setNewPoint({ ...newPoint, latitude: e.target.value })}
            className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="-31.980191"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Longitude</label>
          <input
            type="number"
            step="any"
            value={newPoint.longitude}
            onChange={(e) => setNewPoint({ ...newPoint, longitude: e.target.value })}
            className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="115.817908"
            required
          />
        </div>
      </div>
      <div className="flex gap-3 mt-4">
        <button
          type="submit"
          disabled={addPointMutation.isPending}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          {addPointMutation.isPending ? "Adding..." : "Add Point"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-zinc-600 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
