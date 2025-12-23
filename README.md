# TurfMatcher - Sports Event Scheduler

Fill your turf slots and organize sports events via WhatsApp & Telegram.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Mobile Testing

**On same WiFi network:**
- http://192.168.0.224:3000 (your actual local IP)

**How to find your local IP:**
```bash
# macOS/Linux
ifconfig | grep "inet "

# Windows
ipconfig
```

## ✅ Testing the Full Flow

### 1. Create an Event (Organizer)
- Go to http://localhost:3000/create
- Fill in event details (name, sport, date)
- Add 2-3 turf/time options
- Click "Create Event"

### 2. Share the Event
- Copy the generated message
- Note the voting URL (e.g., `/vote/123456789`)

### 3. Vote (Player - test on mobile!)
- Open the voting URL on your phone
- Enter your name
- Select a time option
- Submit vote

### 4. Track Votes (Organizer)
- Go to Dashboard: http://localhost:3000/dashboard
- Click on your event
- See live vote counts (auto-refreshes every 3 seconds)

### 5. Close Poll
- Click "Close Poll & Send Confirmations"
- See confirmed and declined players
- Export the list

## 🏗️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS v4
- **Language:** TypeScript
- **Storage:** localStorage (will be replaced with Supabase)
- **Deployment:** Ready for Vercel

## 📁 Project Structure

```
turf-matcher/
├── app/
│   ├── page.tsx              # Home page
│   ├── create/               # Event creation form
│   ├── dashboard/            # All events list
│   ├── event/[id]/
│   │   ├── dashboard/        # Live vote tracking
│   │   └── share/            # Share event page
│   └── vote/[id]/            # Player voting page
├── components/               # Reusable components (future)
└── lib/                      # Utilities (future)
```

## 🌍 Region Settings

**Current:** Australia (AUD currency)
- Update currency examples in code if needed
- Timezone: AEDT/AEST (Australian Eastern)

## 📱 WhatsApp Integration

**Status:** ✅ Backend ready, needs Twilio setup

### Quick Setup (5 minutes):

1. **Read the full guide:** [WHATSAPP_SETUP.md](./WHATSAPP_SETUP.md)

2. **Quick start for testing:**
   ```bash
   # Sign up at https://www.twilio.com/try-twilio
   # Join WhatsApp sandbox (free)
   # Copy credentials to .env.local:

   TWILIO_ACCOUNT_SID=AC...
   TWILIO_AUTH_TOKEN=...
   TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Test locally with ngrok:**
   ```bash
   npm run dev          # Terminal 1
   npx ngrok http 3000  # Terminal 2

   # Set webhook in Twilio: https://abc123.ngrok.io/api/whatsapp/webhook
   ```

4. **Send "1" to Twilio's WhatsApp number → Get confirmation!**

### Features Implemented:

- ✅ `/api/whatsapp/webhook` - Receives votes via WhatsApp (reply "1", "2", "3", or "4")
- ✅ `/api/whatsapp/send-confirmations` - Sends confirmation/decline messages
- ✅ Twilio utility functions for sending messages
- ✅ Phone number formatting (Australian +61)
- ⏳ Database integration (currently simulated)

**See [WHATSAPP_SETUP.md](./WHATSAPP_SETUP.md) for full instructions.**

---

## 🔒 Privacy

- Only stores: first name + vote choice
- Auto-deletes 7 days after event
- No tracking, no third-party analytics
- WhatsApp messages are end-to-end encrypted

## 📝 TODO

- [x] Event creation
- [x] Voting page (mobile-first)
- [x] Live dashboard
- [x] Poll closing logic
- [x] WhatsApp webhook integration (backend)
- [ ] Replace localStorage with Supabase (database)
- [ ] Telegram bot integration
- [ ] PWA support (installable on home screen)
- [ ] Complete WhatsApp flow with database

## 🚢 Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

Deploy to Vercel with one click:
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## 📄 License

MIT
