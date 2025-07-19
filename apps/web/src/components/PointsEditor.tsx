"use client";

import { useState } from "react";
import { FaMapMarkerAlt, FaPlus, FaTrash } from "react-icons/fa";
import { useAddPoint, useDeletePoint, useGetPoints, useResetPoints } from "../hooks/editPoints";

interface PointsEditorProps {
  guildId: string;
}

export default function PointsEditor({ guildId }: PointsEditorProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPoint, setNewPoint] = useState({
    name: "",
    latitude: "",
    longitude: ""
  });

  // Use React Query hooks
  const { data: points = [], isLoading: loading, error } = useGetPoints(guildId);
  const addPointMutation = useAddPoint(guildId);
  const resetPointsMutation = useResetPoints(guildId);
  const deletePointMutation = useDeletePoint(guildId);

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
    setShowAddForm(false);
  };

  const handleDeletePoint = async (pointId: string) => {
    if (!confirm("Are you sure you want to delete this point?")) {
      return;
    }
    await deletePointMutation.mutateAsync(pointId);
  };

  if (loading) {
    return (
      <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-700">
        <div className="animate-pulse">
          <div className="h-6 bg-zinc-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-zinc-700 rounded"></div>
            <div className="h-4 bg-zinc-700 rounded w-5/6"></div>
            <div className="h-4 bg-zinc-700 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <FaMapMarkerAlt className="mr-2" />
          Points of Interest
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <FaPlus className="mr-2" />
          Add Point
        </button>
        <button
          onClick={() => resetPointsMutation.mutate()}
          disabled={resetPointsMutation.isPending}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors disabled:opacity-50"
        >
          <FaTrash className="mr-2" />
          {resetPointsMutation.isPending ? "Resetting..." : "Reset Points"}
        </button>
      </div>

      {(error || addPointMutation.error || resetPointsMutation.error || deletePointMutation.error) && (
        <div className="bg-red-900/20 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-4">
          {error?.message ||
            addPointMutation.error?.message ||
            resetPointsMutation.error?.message ||
            deletePointMutation.error?.message ||
            "An error occurred"}
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleAddPoint} className="mb-6 p-4 bg-zinc-800 rounded-lg border border-zinc-600">
          <h3 className="text-lg font-medium text-white mb-4">Add New Point</h3>
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
              onClick={() => {
                setShowAddForm(false);
                setNewPoint({ name: "", latitude: "", longitude: "" });
              }}
              className="bg-zinc-600 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {points.length === 0 ? (
        <div className="text-center py-8">
          <FaMapMarkerAlt className="mx-auto text-4xl text-gray-500 mb-4" />
          <p className="text-gray-400">No points of interest found</p>
          <p className="text-sm text-gray-500 mt-2">Add your first point to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {points.map((point) => (
            <div
              key={point.id}
              className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg border border-zinc-600"
            >
              <div className="flex items-center">
                <FaMapMarkerAlt className="text-blue-400 mr-3" />
                <div>
                  <h3 className="text-white font-medium">{point.name}</h3>
                  <p className="text-sm text-gray-400">
                    {parseFloat(point.latitude).toFixed(6)}, {parseFloat(point.longitude).toFixed(6)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDeletePoint(point.id)}
                className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-900/20 transition-colors"
                title="Delete point"
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
