"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import Button from "../../components/Button";
import { useAddPoint } from "../../hooks/editPoints";

const MapComponent = dynamic(() => import("./PointFormMap"), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full rounded-lg overflow-hidden border border-zinc-600 bg-zinc-700 flex items-center justify-center">
      <div className="text-gray-400">Loading map...</div>
    </div>
  )
});

interface PointFormProps {
  guildId: string;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function PointForm({ guildId, onCancel, onSuccess }: PointFormProps) {
  const [newPoint, setNewPoint] = useState({
    name: "",
    latitude: "",
    longitude: ""
  });

  const addPointMutation = useAddPoint(guildId);

  const handleMapClick = (lat: number, lng: number) => {
    setNewPoint({
      ...newPoint,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6)
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

  return (
    <form onSubmit={handleAddPoint} className="mb-6 p-4 bg-zinc-800 rounded-lg border border-zinc-600">
      <h3 className="text-lg font-medium text-white mb-4">Add New Point</h3>

      {/* Map Section */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">Click on the map to set coordinates</label>
        <MapComponent onMapClick={handleMapClick} selectedLat={newPoint.latitude} selectedLng={newPoint.longitude} />
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
        <Button
          label="Add Point"
          type="submit"
          variant="success"
          loading={addPointMutation.isPending}
          loadingLabel="Adding..."
        />
        <Button label="Cancel" variant="secondary" onClick={onCancel} />
      </div>
    </form>
  );
}
