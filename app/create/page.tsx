"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface TurfTimeOption {
  id: string;
  turfName: string;
  startTime: string;
  endTime: string;
  minPlayers: number;
  maxPlayers: number;
}

export default function CreateEventPage() {
  const router = useRouter();
  const [eventName, setEventName] = useState("");
  const [sport, setSport] = useState("football");
  const [eventDate, setEventDate] = useState("");
  const [pricePerPlayer, setPricePerPlayer] = useState("");
  const [notes, setNotes] = useState("");
  const [options, setOptions] = useState<TurfTimeOption[]>([
    {
      id: "1",
      turfName: "",
      startTime: "",
      endTime: "",
      minPlayers: 6,
      maxPlayers: 10,
    },
  ]);

  const addOption = () => {
    if (options.length >= 4) {
      alert("Maximum 4 options allowed");
      return;
    }
    setOptions([
      ...options,
      {
        id: Date.now().toString(),
        turfName: "",
        startTime: "",
        endTime: "",
        minPlayers: 6,
        maxPlayers: 10,
      },
    ]);
  };

  const removeOption = (id: string) => {
    if (options.length === 1) {
      alert("At least one option required");
      return;
    }
    setOptions(options.filter((opt) => opt.id !== id));
  };

  const updateOption = (id: string, field: keyof TurfTimeOption, value: any) => {
    setOptions(
      options.map((opt) =>
        opt.id === id ? { ...opt, [field]: value } : opt
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!eventName || !eventDate) {
      alert("Please fill in event name and date");
      return;
    }

    for (const opt of options) {
      if (!opt.turfName || !opt.startTime || !opt.endTime) {
        alert("Please fill in all turf/time details");
        return;
      }
    }

    // Store event data (for now, in localStorage - we'll use a DB later)
    const eventId = Date.now().toString();
    const eventData = {
      id: eventId,
      eventName,
      sport,
      eventDate,
      pricePerPlayer,
      notes,
      options,
      votes: [], // Will store votes here
      status: "active",
      createdAt: new Date().toISOString(),
    };

    // Save to localStorage (temporary - will be replaced with API)
    const existingEvents = JSON.parse(localStorage.getItem("events") || "[]");
    localStorage.setItem("events", JSON.stringify([...existingEvents, eventData]));

    // Redirect to the event share page
    router.push(`/event/${eventId}/share`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/"
            className="text-primary hover:underline text-sm mb-2 inline-block"
          >
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold mb-2">Create Event</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Set up your sports event with multiple turf/time options
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="font-bold text-lg mb-4">Basic Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Event Name *
                </label>
                <input
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="e.g., Friday Night Football"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Sport *
                </label>
                <select
                  value={sport}
                  onChange={(e) => setSport(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700"
                >
                  <option value="football">⚽ Football</option>
                  <option value="cricket">🏏 Cricket</option>
                  <option value="badminton">🏸 Badminton</option>
                  <option value="bowling">🎳 Bowling</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700"
                  required
                />
              </div>
            </div>
          </div>

          {/* Turf/Time Options Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg">Turf & Time Options</h2>
              <button
                type="button"
                onClick={addOption}
                className="text-primary hover:underline text-sm font-medium"
                disabled={options.length >= 4}
              >
                + Add Option
              </button>
            </div>

            <div className="space-y-6">
              {options.map((option, index) => (
                <div
                  key={option.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 relative"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-medium">Option {index + 1}</span>
                    {options.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeOption(option.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        ✕ Remove
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Turf/Venue Name *
                      </label>
                      <input
                        type="text"
                        value={option.turfName}
                        onChange={(e) =>
                          updateOption(option.id, "turfName", e.target.value)
                        }
                        placeholder="e.g., Main Pitch, Court A"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Start Time *
                        </label>
                        <input
                          type="time"
                          value={option.startTime}
                          onChange={(e) =>
                            updateOption(option.id, "startTime", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          End Time *
                        </label>
                        <input
                          type="time"
                          value={option.endTime}
                          onChange={(e) =>
                            updateOption(option.id, "endTime", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Min Players
                        </label>
                        <input
                          type="number"
                          value={option.minPlayers || ""}
                          onChange={(e) =>
                            updateOption(
                              option.id,
                              "minPlayers",
                              parseInt(e.target.value) || 1
                            )
                          }
                          min="1"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Max Players
                        </label>
                        <input
                          type="number"
                          value={option.maxPlayers || ""}
                          onChange={(e) =>
                            updateOption(
                              option.id,
                              "maxPlayers",
                              parseInt(e.target.value) || option.minPlayers
                            )
                          }
                          min={option.minPlayers}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Optional Details Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="font-bold text-lg mb-4">Optional Details</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Price per Player
                </label>
                <input
                  type="text"
                  value={pricePerPlayer}
                  onChange={(e) => setPricePerPlayer(e.target.value)}
                  placeholder="e.g., $25"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Notes (What to bring, rules, etc.)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Bring shin guards, studs recommended"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-primary hover:bg-green-600 text-white font-bold py-4 px-6 rounded-lg transition-colors"
          >
            Create Event →
          </button>
        </form>
      </div>
    </div>
  );
}
