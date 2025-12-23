"use client";

import { useState } from "react";

interface TurfTimeOption {
  id: string;
  turfName: string;
  startTime: string;
  endTime: string;
  minPlayers: number;
  maxPlayers: number;
}

interface BulkTurfGeneratorProps {
  onGenerate: (options: Omit<TurfTimeOption, "id">[]) => void;
  onClose: () => void;
}

export default function BulkTurfGenerator({ onGenerate, onClose }: BulkTurfGeneratorProps) {
  const [turfs, setTurfs] = useState<string[]>([""]);
  const [timeSlots, setTimeSlots] = useState<Array<{ start: string; end: string }>>([
    { start: "", end: "" },
  ]);
  const [minPlayers, setMinPlayers] = useState(6);
  const [maxPlayers, setMaxPlayers] = useState(10);

  // Common preset turfs
  const presetTurfs = [
    ["Court 1", "Court 2", "Court 3", "Court 4", "Court 5"],
    ["Pitch A", "Pitch B", "Pitch C", "Pitch D"],
    ["Field 1", "Field 2", "Field 3"],
    ["Main Pitch", "Side Pitch"],
  ];

  // Common preset time slots
  const presetTimeSlots = [
    { label: "Morning (6am-12pm)", slots: ["06:00-08:00", "08:00-10:00", "10:00-12:00"] },
    { label: "Afternoon (12pm-6pm)", slots: ["12:00-14:00", "14:00-16:00", "16:00-18:00"] },
    { label: "Evening (6pm-10pm)", slots: ["18:00-19:00", "19:00-20:00", "20:00-21:00", "21:00-22:00"] },
    { label: "Full Day", slots: ["08:00-09:00", "09:00-10:00", "10:00-11:00", "11:00-12:00", "12:00-13:00", "13:00-14:00", "14:00-15:00", "15:00-16:00", "16:00-17:00", "17:00-18:00", "18:00-19:00", "19:00-20:00", "20:00-21:00", "21:00-22:00"] },
  ];

  const addTurf = () => setTurfs([...turfs, ""]);
  const removeTurf = (index: number) => setTurfs(turfs.filter((_, i) => i !== index));
  const updateTurf = (index: number, value: string) => {
    const newTurfs = [...turfs];
    newTurfs[index] = value;
    setTurfs(newTurfs);
  };

  const addTimeSlot = () => setTimeSlots([...timeSlots, { start: "", end: "" }]);
  const removeTimeSlot = (index: number) => setTimeSlots(timeSlots.filter((_, i) => i !== index));
  const updateTimeSlot = (index: number, field: "start" | "end", value: string) => {
    const newSlots = [...timeSlots];
    newSlots[index][field] = value;
    setTimeSlots(newSlots);
  };

  const applyPresetTurfs = (preset: string[]) => {
    setTurfs(preset);
  };

  const applyPresetTimeSlots = (slots: string[]) => {
    const parsed = slots.map((slot) => {
      const [start, end] = slot.split("-");
      return { start, end };
    });
    setTimeSlots(parsed);
  };

  const handleGenerate = () => {
    const validTurfs = turfs.filter((t) => t.trim());
    const validSlots = timeSlots.filter((s) => s.start && s.end);

    if (validTurfs.length === 0 || validSlots.length === 0) {
      alert("Please add at least one turf and one time slot");
      return;
    }

    // Generate all combinations
    const generated: Omit<TurfTimeOption, "id">[] = [];
    validTurfs.forEach((turf) => {
      validSlots.forEach((slot) => {
        generated.push({
          turfName: turf.trim(),
          startTime: slot.start,
          endTime: slot.end,
          minPlayers,
          maxPlayers,
        });
      });
    });

    if (generated.length > 50) {
      if (!confirm(`This will create ${generated.length} options. Continue?`)) {
        return;
      }
    }

    onGenerate(generated);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Bulk Generator</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
              ✕
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            Quickly create multiple turf/time combinations
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Turfs Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-lg">Turfs / Courts</h3>
              <button
                onClick={addTurf}
                className="text-primary hover:underline text-sm font-medium"
              >
                + Add Turf
              </button>
            </div>

            {/* Preset Turfs */}
            <div className="mb-4 flex flex-wrap gap-2">
              {presetTurfs.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => applyPresetTurfs(preset)}
                  className="text-xs bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  {preset.join(", ")}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {turfs.map((turf, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={turf}
                    onChange={(e) => updateTurf(idx, e.target.value)}
                    placeholder={`Turf ${idx + 1}`}
                    className="flex-1 px-4 py-3 text-base border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700"
                  />
                  {turfs.length > 1 && (
                    <button
                      onClick={() => removeTurf(idx)}
                      className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Time Slots Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-lg">Time Slots</h3>
              <button
                onClick={addTimeSlot}
                className="text-primary hover:underline text-sm font-medium"
              >
                + Add Time Slot
              </button>
            </div>

            {/* Preset Time Slots */}
            <div className="mb-4 space-y-2">
              {presetTimeSlots.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => applyPresetTimeSlots(preset.slots)}
                  className="text-xs bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 block w-full text-left"
                >
                  <span className="font-medium">{preset.label}</span>
                  <span className="text-gray-500 ml-2">({preset.slots.length} slots)</span>
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {timeSlots.map((slot, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="time"
                    value={slot.start}
                    onChange={(e) => updateTimeSlot(idx, "start", e.target.value)}
                    className="flex-1 px-4 py-3 text-base border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 text-center font-semibold"
                  />
                  <span className="flex items-center text-gray-500">–</span>
                  <input
                    type="time"
                    value={slot.end}
                    onChange={(e) => updateTimeSlot(idx, "end", e.target.value)}
                    className="flex-1 px-4 py-3 text-base border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 text-center font-semibold"
                  />
                  {timeSlots.length > 1 && (
                    <button
                      onClick={() => removeTimeSlot(idx)}
                      className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Player Capacity */}
          <div>
            <h3 className="font-bold text-lg mb-3">Player Capacity (Same for All)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Min Players</label>
                <input
                  type="number"
                  value={minPlayers}
                  onChange={(e) => setMinPlayers(parseInt(e.target.value) || 1)}
                  min="1"
                  inputMode="numeric"
                  className="w-full px-4 py-4 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 text-center font-semibold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Max Players</label>
                <input
                  type="number"
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(parseInt(e.target.value) || minPlayers)}
                  min={minPlayers}
                  inputMode="numeric"
                  className="w-full px-4 py-4 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 text-center font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Will create:{" "}
              <span className="text-xl font-bold">
                {turfs.filter((t) => t.trim()).length} turfs × {timeSlots.filter((s) => s.start && s.end).length} times ={" "}
                {turfs.filter((t) => t.trim()).length * timeSlots.filter((s) => s.start && s.end).length} options
              </span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-4 px-6 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            className="flex-1 bg-primary hover:bg-green-600 text-white font-bold py-4 px-6 rounded-lg transition-colors"
          >
            Generate Options →
          </button>
        </div>
      </div>
    </div>
  );
}
