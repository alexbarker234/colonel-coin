"use client";

import { PointsOfInterest } from "database";
import { useEffect, useState } from "react";
import { FaMapMarkerAlt, FaPlus, FaTrash } from "react-icons/fa";

interface PointsEditorProps {
  guildId: string;
}

export default function PointsEditor({ guildId }: PointsEditorProps) {
  const [points, setPoints] = useState<PointsOfInterest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPoint, setNewPoint] = useState({
    name: "",
    latitude: "",
    longitude: ""
  });

  // Fetch points on component mount
  useEffect(() => {
    fetchPoints();
  }, [guildId]);

  const fetchPoints = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/guild/${guildId}/points`);
      if (!response.ok) {
        throw new Error("Failed to fetch points");
      }
      const data = await response.json();
      setPoints(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch points");
    } finally {
      setLoading(false);
    }
  };

  const resetPoints = async () => {
    try {
      const response = await fetch(`/api/guild/${guildId}/points/reset`, {
        method: "POST"
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset points");
    }
  };

  const handleAddPoint = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPoint.name || !newPoint.latitude || !newPoint.longitude) {
      setError("All fields are required");
      return;
    }

    const lat = parseFloat(newPoint.latitude);
    const lng = parseFloat(newPoint.longitude);

    if (isNaN(lat) || isNaN(lng)) {
      setError("Invalid coordinates");
      return;
    }

    try {
      const response = await fetch(`/api/guild/${guildId}/points`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: newPoint.name,
          latitude: lat,
          longitude: lng
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add point");
      }

      const addedPoint = await response.json();
      setPoints([...points, addedPoint]);
      setNewPoint({ name: "", latitude: "", longitude: "" });
      setShowAddForm(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add point");
    }
  };

  const handleDeletePoint = async (pointId: string) => {
    if (!confirm("Are you sure you want to delete this point?")) {
      return;
    }

    try {
      const response = await fetch(`/api/guild/${guildId}/points/${pointId}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Failed to delete point");
      }

      setPoints(points.filter((point) => point.id !== pointId));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete point");
    }
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
          onClick={resetPoints}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <FaTrash className="mr-2" />
          Reset Points
        </button>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-4">{error}</div>
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
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Add Point
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setNewPoint({ name: "", latitude: "", longitude: "" });
                setError(null);
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
