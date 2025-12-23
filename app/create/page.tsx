"use client";

import { useState, useEffect } from "react";
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

interface SavedTurf {
  id: string;
  name: string;
  defaultMinPlayers: number;
  defaultMaxPlayers: number;
  defaultPrice: string;
  active: boolean;
}

export default function CreateEventPage() {
  const router = useRouter();
  const [eventName, setEventName] = useState("");
  const [sport, setSport] = useState("football");
  const [eventDate, setEventDate] = useState("");
  const [pricePerPlayer, setPricePerPlayer] = useState("");
  const [notes, setNotes] = useState("");

  // Saved turfs from admin settings
  const [savedTurfs, setSavedTurfs] = useState<SavedTurf[]>([]);
  const [selectedTurfIds, setSelectedTurfIds] = useState<Set<string>>(new Set());

  // Time slots
  const [timeSlots, setTimeSlots] = useState<Array<{ start: string; end: string }>>([
    { start: "", end: "" },
  ]);

  // Load saved turfs on mount
  useEffect(() => {
    const saved = localStorage.getItem("turfConfig");
    if (saved) {
      const turfs: SavedTurf[] = JSON.parse(saved);
      setSavedTurfs(turfs.filter(t => t.active));
    }
  }, []);

  // Toggle turf selection
  const toggleTurf = (turfId: string) => {
    const newSelected = new Set(selectedTurfIds);
    if (newSelected.has(turfId)) {
      newSelected.delete(turfId);
    } else {
      newSelected.add(turfId);
    }
    setSelectedTurfIds(newSelected);
  };

  // Select/deselect all turfs
  const toggleAllTurfs = () => {
    if (selectedTurfIds.size === savedTurfs.length) {
      setSelectedTurfIds(new Set());
    } else {
      setSelectedTurfIds(new Set(savedTurfs.map(t => t.id)));
    }
  };

  // Time slot management
  const addTimeSlot = () => {
    setTimeSlots([...timeSlots, { start: "", end: "" }]);
  };

  const removeTimeSlot = (index: number) => {
    if (timeSlots.length === 1) {
      alert("At least one time slot required");
      return;
    }
    setTimeSlots(timeSlots.filter((_, i) => i !== index));
  };

  const updateTimeSlot = (index: number, field: "start" | "end", value: string) => {
    const newSlots = [...timeSlots];
    newSlots[index][field] = value;
    setTimeSlots(newSlots);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!eventName || !eventDate) {
      alert("Please fill in event name and date");
      return;
    }

    if (selectedTurfIds.size === 0) {
      alert("Please select at least one turf");
      return;
    }

    const validTimeSlots = timeSlots.filter(s => s.start && s.end);
    if (validTimeSlots.length === 0) {
      alert("Please add at least one complete time slot");
      return;
    }

    // Generate all combinations of turfs × time slots
    const options: TurfTimeOption[] = [];
    selectedTurfIds.forEach(turfId => {
      const turf = savedTurfs.find(t => t.id === turfId);
      if (!turf) return;

      validTimeSlots.forEach(slot => {
        options.push({
          id: `${turfId}-${slot.start}-${slot.end}`,
          turfName: turf.name,
          startTime: slot.start,
          endTime: slot.end,
          minPlayers: turf.defaultMinPlayers,
          maxPlayers: turf.defaultMaxPlayers,
        });
      });
    });

    if (options.length > 100) {
      if (!confirm(`This will create ${options.length} voting options. Continue?`)) {
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
                <label className="block text-sm font-medium mb-2">
                  Event Name *
                </label>
                <input
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="e.g., Friday Night Football"
                  className="w-full px-4 py-3 text-base border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Sport *
                </label>
                <select
                  value={sport}
                  onChange={(e) => setSport(e.target.value)}
                  className="w-full px-4 py-3 text-base border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 bg-white dark:bg-gray-700"
                >
                  <option value="football">⚽ Football</option>
                  <option value="cricket">🏏 Cricket</option>
                  <option value="badminton">🏸 Badminton</option>
                  <option value="bowling">🎳 Bowling</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-4 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 text-center font-semibold"
                  required
                />
              </div>
            </div>
          </div>

          {/* Select Turfs Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg">1. Select Turfs / Courts</h2>
              {savedTurfs.length > 0 && (
                <button
                  type="button"
                  onClick={toggleAllTurfs}
                  className="text-primary hover:underline text-sm font-medium"
                >
                  {selectedTurfIds.size === savedTurfs.length ? "Deselect All" : "Select All"}
                </button>
              )}
            </div>

            {savedTurfs.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">🏟️</div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  No turfs configured yet!
                </p>
                <Link
                  href="/admin/settings"
                  className="inline-block bg-primary hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  ⚙️ Go to Admin Settings
                </Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-2">
                {savedTurfs.map((turf) => (
                  <label
                    key={turf.id}
                    className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedTurfIds.has(turf.id)
                        ? "border-primary bg-green-50 dark:bg-green-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-primary"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedTurfIds.has(turf.id)}
                      onChange={() => toggleTurf(turf.id)}
                      className="w-5 h-5 text-primary cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{turf.name}</div>
                      <div className="text-xs text-gray-500">
                        {turf.defaultMinPlayers}-{turf.defaultMaxPlayers} players · {turf.defaultPrice}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {selectedTurfIds.size > 0 && (
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                ✓ {selectedTurfIds.size} turf{selectedTurfIds.size !== 1 ? "s" : ""} selected
              </div>
            )}
          </div>

          {/* Time Slots Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg">2. Add Time Slots</h2>
              <button
                type="button"
                onClick={addTimeSlot}
                className="text-primary hover:underline text-sm font-medium"
              >
                + Add Slot
              </button>
            </div>

            <div className="space-y-3">
              {timeSlots.map((slot, index) => (
                <div key={index} className="flex gap-3 items-center">
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <input
                      type="time"
                      value={slot.start}
                      onChange={(e) => updateTimeSlot(index, "start", e.target.value)}
                      className="w-full px-4 py-4 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 text-center font-semibold"
                      required
                    />
                    <input
                      type="time"
                      value={slot.end}
                      onChange={(e) => updateTimeSlot(index, "end", e.target.value)}
                      className="w-full px-4 py-4 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 text-center font-semibold"
                      required
                    />
                  </div>
                  {timeSlots.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTimeSlot(index)}
                      className="px-4 py-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          {selectedTurfIds.size > 0 && timeSlots.filter(s => s.start && s.end).length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-3xl">📊</div>
                <div>
                  <h3 className="font-bold text-lg">Preview</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    This event will create voting options
                  </p>
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {selectedTurfIds.size} × {timeSlots.filter(s => s.start && s.end).length} = {selectedTurfIds.size * timeSlots.filter(s => s.start && s.end).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {selectedTurfIds.size} turf{selectedTurfIds.size !== 1 ? "s" : ""} × {timeSlots.filter(s => s.start && s.end).length} time slot{timeSlots.filter(s => s.start && s.end).length !== 1 ? "s" : ""} = {selectedTurfIds.size * timeSlots.filter(s => s.start && s.end).length} voting options
                </div>
              </div>
            </div>
          )}

          {/* Optional Details Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="font-bold text-lg mb-4">3. Optional Details</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Price per Player
                </label>
                <input
                  type="text"
                  value={pricePerPlayer}
                  onChange={(e) => setPricePerPlayer(e.target.value)}
                  placeholder="e.g., $25"
                  inputMode="numeric"
                  className="w-full px-4 py-3 text-base border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Notes (What to bring, rules, etc.)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Bring shin guards, studs recommended"
                  rows={4}
                  className="w-full px-4 py-3 text-base border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-primary hover:bg-green-600 text-white font-bold py-5 px-6 rounded-xl text-lg transition-colors shadow-lg active:shadow-md active:scale-[0.98]"
          >
            Create Event →
          </button>
        </form>
      </div>
    </div>
  );
}
