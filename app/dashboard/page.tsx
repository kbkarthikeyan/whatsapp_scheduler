"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface EventData {
  id: string;
  eventName: string;
  sport: string;
  eventDate: string;
  status: string;
  createdAt: string;
  votes?: any[];
}

export default function DashboardPage() {
  const [events, setEvents] = useState<EventData[]>([]);

  useEffect(() => {
    const loadEvents = () => {
      const storedEvents = JSON.parse(localStorage.getItem("events") || "[]");
      // Sort by created date (newest first)
      storedEvents.sort(
        (a: EventData, b: EventData) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setEvents(storedEvents);
    };

    loadEvents();

    // Auto-refresh every 5 seconds
    const interval = setInterval(loadEvents, 5000);
    return () => clearInterval(interval);
  }, []);

  const sportEmojis: Record<string, string> = {
    football: "⚽",
    cricket: "🏏",
    badminton: "🏸",
    bowling: "🎳",
    other: "🎯",
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
            <h1 className="text-3xl font-bold">Organizer Dashboard</h1>
            <Link
              href="/create"
              className="bg-primary hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors"
            >
              + New Event
            </Link>
          </div>
        </div>

        {/* Events List */}
        {events.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📅</div>
            <h2 className="text-xl font-bold mb-2">No events yet</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Create your first event to start organizing sports sessions
            </p>
            <Link
              href="/create"
              className="inline-block bg-primary hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Create Event
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-gray-500 mb-4">
              {events.length} event{events.length !== 1 ? "s" : ""} · Auto-refresh every 5s
            </div>

            {events.map((event) => {
              const sportEmoji = sportEmojis[event.sport] || "🎯";
              const formattedDate = new Date(event.eventDate).toLocaleDateString(
                "en-US",
                { weekday: "short", month: "short", day: "numeric" }
              );
              const voteCount = event.votes?.length || 0;
              const isActive = event.status === "active";

              return (
                <Link
                  key={event.id}
                  href={`/event/${event.id}/dashboard`}
                  className="block bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{sportEmoji}</span>
                        <h3 className="text-xl font-bold">{event.eventName}</h3>
                        {isActive ? (
                          <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200 px-2 py-1 rounded">
                            🟢 Live
                          </span>
                        ) : (
                          <span className="text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 px-2 py-1 rounded">
                            🔒 Closed
                          </span>
                        )}
                      </div>

                      <div className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                        📅 {formattedDate}
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-primary text-lg">
                            {voteCount}
                          </span>
                          <span className="text-gray-500">
                            vote{voteCount !== 1 ? "s" : ""}
                          </span>
                        </div>

                        <div className="text-gray-500">
                          Created{" "}
                          {new Date(event.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="text-primary text-xl">→</div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
