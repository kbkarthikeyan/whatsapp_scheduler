import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8">
      <main className="max-w-4xl w-full">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-6xl font-bold mb-4 text-primary">
            ⚽ TurfMatcher
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8">
            Fill your turf slots and organize sports events via WhatsApp & Telegram
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="grid sm:grid-cols-3 gap-4 mb-12">
          <Link
            href="/admin/settings"
            className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-4 px-6 rounded-lg text-center transition-colors"
          >
            ⚙️ Admin Settings
          </Link>
          <Link
            href="/dashboard"
            className="bg-primary hover:bg-green-600 text-white font-bold py-4 px-6 rounded-lg text-center transition-colors"
          >
            📊 Dashboard
          </Link>
          <Link
            href="/create"
            className="bg-secondary hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-lg text-center transition-colors"
          >
            ➕ Create Event
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid sm:grid-cols-3 gap-6 text-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-3">🗳️</div>
            <h3 className="font-bold mb-2">Easy Voting</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Players vote on time slots with one tap
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-3">✅</div>
            <h3 className="font-bold mb-2">Auto Confirm</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Automatic confirmations & polite declines
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="font-bold mb-2">Privacy First</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Data deleted 7 days after event
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 text-center text-sm text-gray-500">
        <p>Built for sports groups & turf managers</p>
      </footer>
    </div>
  );
}
