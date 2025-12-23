"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface EventData {
  id: string;
  eventName: string;
  sport: string;
  eventDate: string;
  pricePerPlayer: string;
  notes: string;
  options: Array<{
    id: string;
    turfName: string;
    startTime: string;
    endTime: string;
    minPlayers: number;
    maxPlayers: number;
  }>;
  votes: Array<{
    playerName: string;
    optionId: string;
    votedAt: string;
  }>;
  status: string;
}

export default function VotePage() {
  const params = useParams();
  const [event, setEvent] = useState<EventData | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);
  const [existingVote, setExistingVote] = useState<string | null>(null);

  useEffect(() => {
    // Load event from localStorage
    const events = JSON.parse(localStorage.getItem("events") || "[]");
    const foundEvent = events.find((e: EventData) => e.id === params.id);

    if (foundEvent) {
      setEvent(foundEvent);

      // Check if user already voted (using localStorage for demo)
      const voterId = localStorage.getItem("voterId");
      if (voterId && foundEvent.votes) {
        const userVote = foundEvent.votes.find(
          (v: any) => v.voterId === voterId
        );
        if (userVote) {
          setExistingVote(userVote.optionId);
          setSelectedOption(userVote.optionId);
          setPlayerName(userVote.playerName);
        }
      }
    }
  }, [params.id]);

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-lg font-medium">Event not found</p>
          <p className="text-sm text-gray-500 mt-2">
            This event may have expired or the link is invalid
          </p>
        </div>
      </div>
    );
  }

  if (event.status === "closed") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold mb-2">Voting Closed</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            The organizer has finalized this event.
          </p>
          <p className="text-sm text-gray-500">
            Check your messages for confirmation!
          </p>
        </div>
      </div>
    );
  }

  const sportEmojis: Record<string, string> = {
    football: "⚽",
    cricket: "🏏",
    badminton: "🏸",
    bowling: "🎳",
    other: "🎯",
  };

  const sportEmoji = sportEmojis[event.sport] || "🎯";
  const formattedDate = new Date(event.eventDate).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!playerName.trim() || !selectedOption) {
      alert("Please enter your name and select an option");
      return;
    }

    // Generate or get voter ID
    let voterId = localStorage.getItem("voterId");
    if (!voterId) {
      voterId = `voter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("voterId", voterId);
    }

    // Load events and update
    const events = JSON.parse(localStorage.getItem("events") || "[]");
    const eventIndex = events.findIndex((e: EventData) => e.id === params.id);

    if (eventIndex !== -1) {
      if (!events[eventIndex].votes) {
        events[eventIndex].votes = [];
      }

      // Remove existing vote if any
      events[eventIndex].votes = events[eventIndex].votes.filter(
        (v: any) => v.voterId !== voterId
      );

      // Add new vote
      events[eventIndex].votes.push({
        voterId,
        playerName: playerName.trim(),
        optionId: selectedOption,
        votedAt: new Date().toISOString(),
      });

      localStorage.setItem("events", JSON.stringify(events));
      setSubmitted(true);
      setEvent(events[eventIndex]);
    }
  };

  if (submitted && !existingVote) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-md text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold mb-2">Vote Recorded!</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            You'll get a confirmation message when the organizer closes the poll.
          </p>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 text-left">
            <p className="text-sm text-gray-500 mb-2">Your vote:</p>
            <p className="font-bold text-lg">
              {event.options.find((o) => o.id === selectedOption)?.turfName}
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              {event.options.find((o) => o.id === selectedOption)?.startTime} –{" "}
              {event.options.find((o) => o.id === selectedOption)?.endTime}
            </p>
          </div>

          <p className="text-sm text-gray-500">
            🔒 Your vote is private. Data deleted 7 days after the event.
          </p>
        </div>
      </div>
    );
  }

  const optionEmojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣"];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Event Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">{sportEmoji}</div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              {event.eventName}
            </h1>
            <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300">
              <span>📅 {formattedDate}</span>
              {event.pricePerPlayer && (
                <>
                  <span>·</span>
                  <span>💰 {event.pricePerPlayer}</span>
                </>
              )}
            </div>
          </div>

          {event.notes && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm">
              <p className="text-gray-700 dark:text-gray-300">ℹ️ {event.notes}</p>
            </div>
          )}
        </div>

        {existingVote && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
            <p className="font-medium text-green-800 dark:text-green-200 mb-1">
              ✓ You already voted
            </p>
            <p className="text-sm text-green-700 dark:text-green-300">
              You can change your vote below
            </p>
          </div>
        )}

        {/* Voting Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Player Name */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <label className="block text-sm font-medium mb-2">
              Your Name *
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your first name"
              className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700"
              required
              disabled={!!existingVote}
            />
          </div>

          {/* Time Options */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="font-bold text-lg mb-4">
              Choose your preferred turf and time:
            </h2>

            <div className="space-y-3">
              {event.options.map((option, index) => {
                const voteCount =
                  event.votes?.filter((v) => v.optionId === option.id).length ||
                  0;

                return (
                  <label
                    key={option.id}
                    className={`block border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedOption === option.id
                        ? "border-primary bg-green-50 dark:bg-green-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-primary"
                    }`}
                  >
                    <input
                      type="radio"
                      name="option"
                      value={option.id}
                      checked={selectedOption === option.id}
                      onChange={(e) => setSelectedOption(e.target.value)}
                      className="sr-only"
                      required
                    />

                    <div className="flex items-start gap-3">
                      <div className="text-2xl flex-shrink-0">
                        {optionEmojis[index]}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-lg">
                          {option.turfName}
                        </div>
                        <div className="text-gray-600 dark:text-gray-300">
                          {option.startTime} – {option.endTime}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {option.minPlayers}–{option.maxPlayers} players
                          {voteCount > 0 && (
                            <span className="ml-2 text-primary font-medium">
                              · {voteCount} vote{voteCount !== 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-primary hover:bg-green-600 text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors shadow-md"
          >
            {existingVote ? "Update Vote" : "Submit Vote"} →
          </button>

          {/* Privacy Note */}
          <p className="text-center text-sm text-gray-500">
            🔒 We only store your first name and vote. Deleted 7 days after the
            event.
          </p>
        </form>
      </div>
    </div>
  );
}
