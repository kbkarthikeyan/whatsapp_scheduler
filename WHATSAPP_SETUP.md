# 📱 WhatsApp Integration Setup Guide

## Option 1: Quick Testing with Twilio Sandbox (FREE, 5 minutes)

Perfect for testing the WhatsApp integration before going live.

### Step 1: Create Twilio Account

1. Go to https://www.twilio.com/try-twilio
2. Sign up (free trial gives you $15 USD credit)
3. Verify your phone number

### Step 2: Access WhatsApp Sandbox

1. In Twilio Console, go to **Messaging** → **Try it out** → **Send a WhatsApp message**
2. You'll see instructions like:

   ```
   Join your sandbox by sending:
   join <code-word>

   to WhatsApp number:
   +1 415 523 8886
   ```

3. **On your phone:** Open WhatsApp and send that message
4. You'll get a confirmation: "You are all set!"

### Step 3: Configure Environment Variables

Create a `.env.local` file:

```bash
# Copy from Twilio Console
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...

# Sandbox WhatsApp number (from Twilio Console)
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Your app URL (will update when deployed)
TWILIO_WEBHOOK_URL=http://localhost:3000/api/whatsapp/webhook
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Where to find these:**
- **Account SID & Auth Token:** Twilio Console homepage
- **WhatsApp Number:** Console → Messaging → Try WhatsApp → Your sandbox number

### Step 4: Test Locally with ngrok

Twilio needs a **public URL** to send webhooks. Use ngrok to expose localhost:

```bash
# Terminal 1: Start your app
npm run dev

# Terminal 2: Expose to internet
npx ngrok http 3000
```

You'll get a URL like: `https://abc123.ngrok.io`

### Step 5: Set Webhook in Twilio

1. Go to **Console → Messaging → Settings → WhatsApp Sandbox Settings**
2. Under **"When a message comes in"**, paste:
   ```
   https://abc123.ngrok.io/api/whatsapp/webhook
   ```
3. Method: **POST**
4. Click **Save**

### Step 6: Test It!

Send a message to the Twilio WhatsApp number:

```
1
```

You should get back:

```
✅ Vote recorded for option 1!

You'll get a confirmation message when the organizer closes the poll.
```

---

## Option 2: Production Setup with Real WhatsApp Number

For real users (not just testing). Costs ~$0.01 AUD per message.

### Step 1: Upgrade Twilio Account

1. Add payment method to Twilio
2. Purchase a WhatsApp-enabled phone number:
   - **Console → Phone Numbers → Buy a number**
   - Filter by **"WhatsApp Capable"**
   - Choose an Australian number (+61) if available
   - Cost: ~$1-2 USD/month

### Step 2: Request WhatsApp Business Profile Approval

1. Go to **Console → Messaging → WhatsApp → Senders**
2. Click **Register WhatsApp sender**
3. Fill in:
   - **Business Name:** "TurfMatcher"
   - **Business Description:** "Sports event scheduling"
   - **Business Website:** Your website
   - **Contact Email**

4. Submit for approval (takes 1-3 business days)

### Step 3: Configure Production Webhook

1. Deploy your app to **Vercel** (instructions below)
2. In Twilio Console → Your WhatsApp Number → Configure
3. Set **"When a message comes in"**:
   ```
   https://your-app.vercel.app/api/whatsapp/webhook
   ```

### Step 4: Update Environment Variables

In `.env.local` (and in Vercel dashboard):

```bash
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...

# Your purchased WhatsApp number
TWILIO_WHATSAPP_NUMBER=whatsapp:+61412345678

# Production URL
TWILIO_WEBHOOK_URL=https://your-app.vercel.app/api/whatsapp/webhook
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

---

## Deploying to Vercel (Required for Webhooks)

Twilio webhooks need a public URL (localhost won't work in production).

### Quick Deploy:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: turf-matcher
# - Deploy? Yes
```

### Add Environment Variables in Vercel:

1. Go to https://vercel.com/dashboard
2. Select your project → **Settings → Environment Variables**
3. Add all variables from `.env.local`
4. Redeploy: `vercel --prod`

---

## How Users Will Vote via WhatsApp

### Current Flow:

1. **Organizer creates event** on your web app
2. **Organizer shares** the generated message in WhatsApp group
3. **Players click the voting link** → Opens web page → Vote
4. **Webhook receives vote** → Stores in database

### Enhanced Flow (After Database Setup):

1. Organizer creates event
2. Organizer gets a **unique event code** (e.g., "JOIN abc123")
3. Players send to your WhatsApp number:
   ```
   JOIN abc123
   ```
4. Bot replies with voting options:
   ```
   ⚽ Friday Night Football
   Vote by replying with the number:

   1️⃣ Main Pitch · 18:00–19:00
   2️⃣ Main Pitch · 19:00–20:00
   ```
5. Player replies: `2`
6. Bot confirms:
   ```
   ✅ Vote recorded for option 2!
   ```

---

## Testing Checklist

- [ ] Twilio account created
- [ ] WhatsApp sandbox joined
- [ ] Environment variables set
- [ ] ngrok running (for local testing)
- [ ] Webhook configured in Twilio
- [ ] Send "1" to WhatsApp number → Get confirmation
- [ ] Send "abc" to WhatsApp number → Get help message
- [ ] Check ngrok logs to see incoming webhook requests

---

## Costs (Australia)

### Free Tier (Sandbox):
- ✅ Unlimited incoming messages
- ✅ Unlimited outgoing messages (during trial)
- ❌ Only works with numbers that joined your sandbox

### Production:
- 💰 **Incoming messages:** Free
- 💰 **Outgoing messages:** ~$0.005-0.01 AUD each
- 💰 **WhatsApp number:** ~$1-2 AUD/month

**Example:** 100 events/month, 20 players each = 2,000 messages = ~$20 AUD/month

---

## Troubleshooting

### "Webhook returns 404"
- Check the URL is correct: `https://your-app.vercel.app/api/whatsapp/webhook`
- Verify the route file exists at `app/api/whatsapp/webhook/route.ts`

### "No response from bot"
- Check Twilio webhook logs: Console → Monitor → Logs → Errors
- Verify ngrok is running (for local dev)
- Check your app logs for errors

### "Invalid signature error"
- Verify `TWILIO_AUTH_TOKEN` is correct
- Check `TWILIO_WEBHOOK_URL` matches the URL Twilio is calling

### "Can't send messages to user"
- In sandbox mode: User must have joined your sandbox first
- In production: Your business profile must be approved

---

## Next Steps

1. ✅ Test the webhook with sandbox
2. ⏳ Set up database (Supabase) to store votes
3. ⏳ Implement event-to-phone mapping
4. ⏳ Add confirmation message sending when poll closes
5. ⏳ Deploy to Vercel for production use

---

## Alternative: 360dialog (If Twilio is too expensive)

360dialog is cheaper for high-volume messaging:

1. Go to https://www.360dialog.com/
2. Sign up for WhatsApp Business API
3. Similar webhook setup
4. ~30% cheaper per message

---

Need help? Check the Twilio docs:
- https://www.twilio.com/docs/whatsapp/quickstart
- https://www.twilio.com/docs/whatsapp/api
