"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface TurfConfig {
  id: string;
  name: string;
  defaultMinPlayers: number;
  defaultMaxPlayers: number;
  defaultPrice: string;
  active: boolean;
}

export default function AdminSettingsPage() {
  const [turfs, setTurfs] = useState<TurfConfig[]>([]);
  const [newTurfName, setNewTurfName] = useState("");

  useEffect(() => {
    // Load saved turfs
    const saved = localStorage.getItem("turfConfig");
    if (saved) {
      setTurfs(JSON.parse(saved));
    }
  }, []);

  const saveTurfs = (updatedTurfs: TurfConfig[]) => {
    setTurfs(updatedTurfs);
    localStorage.setItem("turfConfig", JSON.stringify(updatedTurfs));
  };

  const addTurf = () => {
    if (!newTurfName.trim()) {
      alert("Please enter a turf name");
      return;
    }

    const newTurf: TurfConfig = {
      id: Date.now().toString(),
      name: newTurfName.trim(),
      defaultMinPlayers: 6,
      defaultMaxPlayers: 10,
      defaultPrice: "$25",
      active: true,
    };

    saveTurfs([...turfs, newTurf]);
    setNewTurfName("");
  };

  const updateTurf = (id: string, field: keyof TurfConfig, value: any) => {
    saveTurfs(turfs.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
  };

  const deleteTurf = (id: string) => {
    if (confirm("Delete this turf? It will no longer appear in event creation.")) {
      saveTurfs(turfs.filter((t) => t.id !== id));
    }
  };

  const bulkAdd = () => {
    const count = prompt("How many turfs/courts do you want to add?", "5");
    if (!count) return;

    const num = parseInt(count);
    if (isNaN(num) || num < 1 || num > 50) {
      alert("Please enter a number between 1 and 50");
      return;
    }

    const prefix = prompt("Prefix for turf names?", "Court");
    if (!prefix) return;

    const newTurfs: TurfConfig[] = [];
    for (let i = 1; i <= num; i++) {
      newTurfs.push({
        id: `${Date.now()}-${i}`,
        name: `${prefix} ${i}`,
        defaultMinPlayers: 6,
        defaultMaxPlayers: 10,
        defaultPrice: "$25",
        active: true,
      });
    }

    saveTurfs([...turfs, ...newTurfs]);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/"
            className="text-primary hover:underline text-sm mb-2 inline-block"
          >
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold mb-2">⚙️ Admin Settings</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Configure your turfs, courts, and default settings
          </p>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="font-bold text-lg mb-4">Quick Setup</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <button
              onClick={bulkAdd}
              className="bg-primary hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              🚀 Bulk Add Turfs
            </button>
            <Link
              href="/create"
              className="bg-secondary hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-center transition-colors"
            >
              ➕ Create Event
            </Link>
          </div>
        </div>

        {/* Add New Turf */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="font-bold text-lg mb-4">Add New Turf / Court</h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={newTurfName}
              onChange={(e) => setNewTurfName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addTurf()}
              placeholder="e.g., Main Pitch, Court 1, Field A"
              className="flex-1 px-4 py-3 text-base border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700"
            />
            <button
              onClick={addTurf}
              className="bg-primary hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        {/* Turfs List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">
              Your Turfs ({turfs.length})
            </h2>
            {turfs.length > 0 && (
              <span className="text-sm text-gray-500">
                These will appear when creating events
              </span>
            )}
          </div>

          {turfs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏟️</div>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                No turfs configured yet. Add your first turf above!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {turfs.map((turf) => (
                <div
                  key={turf.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-start gap-4">
                    {/* Active Toggle */}
                    <input
                      type="checkbox"
                      checked={turf.active}
                      onChange={(e) =>
                        updateTurf(turf.id, "active", e.target.checked)
                      }
                      className="mt-1 w-5 h-5 cursor-pointer"
                    />

                    {/* Turf Details */}
                    <div className="flex-1 space-y-3">
                      {/* Name */}
                      <input
                        type="text"
                        value={turf.name}
                        onChange={(e) =>
                          updateTurf(turf.id, "name", e.target.value)
                        }
                        className="w-full px-4 py-2 text-lg font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700"
                      />

                      {/* Defaults */}
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            Min Players
                          </label>
                          <input
                            type="number"
                            value={turf.defaultMinPlayers}
                            onChange={(e) =>
                              updateTurf(
                                turf.id,
                                "defaultMinPlayers",
                                parseInt(e.target.value) || 1
                              )
                            }
                            min="1"
                            inputMode="numeric"
                            className="w-full px-3 py-2 text-center border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            Max Players
                          </label>
                          <input
                            type="number"
                            value={turf.defaultMaxPlayers}
                            onChange={(e) =>
                              updateTurf(
                                turf.id,
                                "defaultMaxPlayers",
                                parseInt(e.target.value) || turf.defaultMinPlayers
                              )
                            }
                            min={turf.defaultMinPlayers}
                            inputMode="numeric"
                            className="w-full px-3 py-2 text-center border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            Default Price
                          </label>
                          <input
                            type="text"
                            value={turf.defaultPrice}
                            onChange={(e) =>
                              updateTurf(turf.id, "defaultPrice", e.target.value)
                            }
                            placeholder="$25"
                            className="w-full px-3 py-2 text-center border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => deleteTurf(turf.id)}
                      className="mt-1 px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Export/Import (Future) */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>💡 Tip: Configure your turfs once, then select them when creating events</p>
        </div>
      </div>
    </div>
  );
}
