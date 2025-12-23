"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

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
    voterId: string;
    playerName: string;
    optionId: string;
    votedAt: string;
  }>;
  status: string;
  createdAt: string;
  closedAt?: string;
  selectedOptionId?: string;
  confirmedPlayers?: string[];
  declinedPlayers?: string[];
}

export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<EventData | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadEvent = () => {
    const events = JSON.parse(localStorage.getItem("events") || "[]");
    const foundEvent = events.find((e: EventData) => e.id === params.id);
    if (foundEvent) {
      setEvent(foundEvent);
    }
  };

  useEffect(() => {
    loadEvent();
    // Auto-refresh every 3 seconds to show new votes
    const interval = setInterval(() => {
      loadEvent();
      setRefreshKey((k) => k + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, [params.id]);

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
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

  const totalVotes = event.votes?.length || 0;

  // Calculate votes per option
  const votesByOption = event.options.map((option) => {
    const votes = event.votes?.filter((v) => v.optionId === option.id) || [];
    return {
      option,
      votes,
      count: votes.length,
    };
  });

  // Find winning option (most votes)
  const winningOption = votesByOption.reduce((max, current) =>
    current.count > max.count ? current : max
  );

  const handleClosePoll = () => {
    const confirmed = window.confirm(
      "Close the poll and send confirmations?\n\n" +
        `Winning option: ${winningOption.option.turfName} (${winningOption.option.startTime}–${winningOption.option.endTime})\n` +
        `${winningOption.count} players will be confirmed`
    );

    if (!confirmed) return;

    // Update event status
    const events = JSON.parse(localStorage.getItem("events") || "[]");
    const eventIndex = events.findIndex((e: EventData) => e.id === params.id);

    if (eventIndex !== -1) {
      // Determine confirmed and declined players
      const confirmedPlayers = winningOption.votes
        .slice(0, winningOption.option.maxPlayers)
        .map((v) => v.playerName);

      const waitlistPlayers = winningOption.votes
        .slice(winningOption.option.maxPlayers)
        .map((v) => v.playerName);

      const declinedPlayers = event.votes
        ?.filter((v) => v.optionId !== winningOption.option.id)
        .map((v) => v.playerName) || [];

      events[eventIndex].status = "closed";
      events[eventIndex].closedAt = new Date().toISOString();
      events[eventIndex].selectedOptionId = winningOption.option.id;
      events[eventIndex].confirmedPlayers = confirmedPlayers;
      events[eventIndex].declinedPlayers = [
        ...declinedPlayers,
        ...waitlistPlayers,
      ];

      localStorage.setItem("events", JSON.stringify(events));

      // Reload and show results
      loadEvent();
      alert(
        `Poll closed!\n\n✅ ${confirmedPlayers.length} confirmed\n❌ ${declinedPlayers.length + waitlistPlayers.length} declined\n\nIn a real app, SMS/WhatsApp messages would be sent now.`
      );
    }
  };

  const handleReopen = () => {
    const events = JSON.parse(localStorage.getItem("events") || "[]");
    const eventIndex = events.findIndex((e: EventData) => e.id === params.id);

    if (eventIndex !== -1) {
      events[eventIndex].status = "active";
      delete events[eventIndex].closedAt;
      delete events[eventIndex].selectedOptionId;
      delete events[eventIndex].confirmedPlayers;
      delete events[eventIndex].declinedPlayers;

      localStorage.setItem("events", JSON.stringify(events));
      loadEvent();
    }
  };

  const handleExport = () => {
    if (event.status === "closed" && event.confirmedPlayers) {
      const csv = event.confirmedPlayers.join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${event.eventName}-confirmed.txt`;
      a.click();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/" className="text-primary hover:underline text-sm mb-2 inline-block">
            ← Back to Home
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1">
                {sportEmoji} {event.eventName}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {formattedDate} · {event.status === "active" ? "🟢 Live" : "🔒 Closed"}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{totalVotes}</div>
              <div className="text-sm text-gray-500">total votes</div>
            </div>
          </div>
        </div>

        {/* Closed State - Show Results */}
        {event.status === "closed" && event.selectedOptionId && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-6">
            <h2 className="font-bold text-lg mb-4 text-green-800 dark:text-green-200">
              ✅ Poll Closed
            </h2>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-500 mb-2">Selected Time:</p>
              <p className="font-bold text-xl">
                {
                  event.options.find((o) => o.id === event.selectedOptionId)
                    ?.turfName
                }
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                {
                  event.options.find((o) => o.id === event.selectedOptionId)
                    ?.startTime
                }{" "}
                –{" "}
                {
                  event.options.find((o) => o.id === event.selectedOptionId)
                    ?.endTime
                }
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-2">
                  ✅ Confirmed ({event.confirmedPlayers?.length || 0})
                </div>
                <div className="space-y-1">
                  {event.confirmedPlayers?.map((name, i) => (
                    <div key={i} className="text-sm font-medium">
                      {i + 1}. {name}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-2">
                  ❌ Declined ({event.declinedPlayers?.length || 0})
                </div>
                <div className="space-y-1">
                  {event.declinedPlayers?.slice(0, 5).map((name, i) => (
                    <div key={i} className="text-sm text-gray-600 dark:text-gray-400">
                      {name}
                    </div>
                  ))}
                  {(event.declinedPlayers?.length || 0) > 5 && (
                    <div className="text-sm text-gray-500">
                      +{event.declinedPlayers!.length - 5} more
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleExport}
                className="flex-1 bg-primary hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Export List
              </button>
              <button
                onClick={handleReopen}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Reopen Poll
              </button>
            </div>
          </div>
        )}

        {/* Active State - Vote Counts */}
        {event.status === "active" && (
          <>
            {/* Vote Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
              <h2 className="font-bold text-lg mb-4">Live Votes</h2>

              <div className="space-y-4">
                {votesByOption.map((item, index) => {
                  const optionEmojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣"];
                  const percentage =
                    totalVotes > 0 ? (item.count / totalVotes) * 100 : 0;
                  const meetsMin = item.count >= item.option.minPlayers;
                  const exceedsMax = item.count > item.option.maxPlayers;

                  return (
                    <div key={item.option.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl">{optionEmojis[index]}</span>
                            <span className="font-bold">
                              {item.option.turfName}
                            </span>
                            {item === winningOption && item.count > 0 && (
                              <span className="text-xs bg-primary text-white px-2 py-1 rounded">
                                Leading
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {item.option.startTime} – {item.option.endTime}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            {item.count}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.option.minPlayers}–{item.option.maxPlayers}
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                        <div
                          className={`h-2 rounded-full ${
                            meetsMin
                              ? "bg-primary"
                              : "bg-gray-400 dark:bg-gray-600"
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>

                      {/* Status */}
                      <div className="flex items-center gap-2 text-xs">
                        {item.count === 0 && (
                          <span className="text-gray-500">No votes yet</span>
                        )}
                        {item.count > 0 && !meetsMin && (
                          <span className="text-orange-500">
                            Need {item.option.minPlayers - item.count} more
                          </span>
                        )}
                        {meetsMin && !exceedsMax && (
                          <span className="text-green-600">✅ Ready</span>
                        )}
                        {exceedsMax && (
                          <span className="text-red-500">
                            ⚠️ Over capacity by {item.count - item.option.maxPlayers}
                          </span>
                        )}
                      </div>

                      {/* Player Names */}
                      {item.votes.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {item.votes.slice(0, item.option.maxPlayers).map((vote, i) => (
                            <span
                              key={i}
                              className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded"
                            >
                              {vote.playerName}
                            </span>
                          ))}
                          {item.votes.length > item.option.maxPlayers && (
                            <span className="text-xs text-gray-500 px-2 py-1">
                              +{item.votes.length - item.option.maxPlayers} waitlist
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
              <h2 className="font-bold text-lg mb-4">Actions</h2>

              <div className="space-y-3">
                <button
                  onClick={handleClosePoll}
                  disabled={totalVotes === 0}
                  className="w-full bg-primary hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-colors"
                >
                  Close Poll & Send Confirmations
                </button>

                <Link
                  href={`/vote/${event.id}`}
                  className="block w-full bg-secondary hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-center transition-colors"
                >
                  Preview Voting Page
                </Link>

                <Link
                  href={`/event/${event.id}/share`}
                  className="block w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg text-center transition-colors"
                >
                  View Share Link
                </Link>
              </div>
            </div>
          </>
        )}

        {/* Privacy Note */}
        <div className="text-center text-sm text-gray-500">
          <p>🔒 Auto-refresh every 3 seconds · Data deleted 7 days after event</p>
        </div>
      </div>
    </div>
  );
}
