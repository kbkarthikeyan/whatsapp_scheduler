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
  status: string;
  createdAt: string;
}

export default function ShareEventPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<EventData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Load event from localStorage
    const events = JSON.parse(localStorage.getItem("events") || "[]");
    const foundEvent = events.find((e: EventData) => e.id === params.id);

    if (!foundEvent) {
      router.push("/");
      return;
    }

    setEvent(foundEvent);
  }, [params.id, router]);

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
    month: "short",
    day: "numeric",
  });

  // Generate the shareable message
  const generateMessage = () => {
    let message = `${sportEmoji} ${event.eventName}\n`;
    message += `${formattedDate}`;
    if (event.pricePerPlayer) {
      message += ` · ${event.pricePerPlayer}`;
    }
    message += `\n\n`;
    message += `Vote for your preferred turf and time (reply with the number):\n\n`;

    event.options.forEach((opt, index) => {
      const number = index + 1;
      const emoji = ["1️⃣", "2️⃣", "3️⃣", "4️⃣"][index] || `${number}️⃣`;
      message += `${emoji} ${opt.turfName} · ${opt.startTime}–${opt.endTime}\n`;
      message += `   (${opt.minPlayers}–${opt.maxPlayers} players)\n\n`;
    });

    const voteUrl = `${window.location.origin}/vote/${event.id}`;
    message += `🔗 Vote here: ${voteUrl}`;

    if (event.notes) {
      message += `\n\nℹ️ ${event.notes}`;
    }

    return message;
  };

  const copyToClipboard = async () => {
    const message = generateMessage();
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert("Failed to copy. Please copy manually.");
    }
  };

  const shareViaWhatsApp = () => {
    const message = encodeURIComponent(generateMessage());
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  const shareViaTelegram = () => {
    const message = encodeURIComponent(generateMessage());
    window.open(`https://t.me/share/url?url=&text=${message}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold mb-2">Event Created!</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Share this message in your WhatsApp/Telegram groups
          </p>
        </div>

        {/* Message Preview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4 whitespace-pre-wrap font-mono text-sm">
            {generateMessage()}
          </div>

          {/* Share Buttons */}
          <div className="space-y-3">
            <button
              onClick={copyToClipboard}
              className="w-full bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              {copied ? "✓ Copied!" : "📋 Copy Message"}
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={shareViaWhatsApp}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                WhatsApp
              </button>
              <button
                onClick={shareViaTelegram}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Telegram
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="font-bold text-lg mb-4">What's Next?</h2>
          <div className="space-y-3">
            <Link
              href={`/event/${event.id}/dashboard`}
              className="block bg-primary hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-center transition-colors"
            >
              📊 View Dashboard (Track Votes)
            </Link>
            <Link
              href={`/vote/${event.id}`}
              className="block bg-secondary hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-center transition-colors"
            >
              🗳️ Preview Voting Page
            </Link>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="text-center text-sm text-gray-500 mb-6">
          <p>🔒 Event data will be auto-deleted 7 days after {formattedDate}</p>
        </div>

        <div className="text-center">
          <Link href="/" className="text-primary hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
