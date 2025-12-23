# 🚀 WhatsApp Quick Start (5 Minutes)

Test WhatsApp voting **right now** without any production setup!

---

## Step 1: Get Twilio Credentials (2 minutes)

1. **Sign up:** https://www.twilio.com/try-twilio
   - Free trial gives $15 USD credit
   - No credit card required initially

2. **Find your credentials:**
   - Go to Twilio Console homepage
   - Copy **Account SID** (starts with "AC...")
   - Copy **Auth Token** (click to reveal)

3. **Get WhatsApp Sandbox Number:**
   - Console → **Messaging** → **Try it out** → **Send a WhatsApp message**
   - You'll see a sandbox number like: **+1 415 523 8886**
   - You'll see a join code like: **join abc-123**

4. **Join the sandbox on your phone:**
   - Open WhatsApp
   - Send to `+1 415 523 8886`:
     ```
     join abc-123
     ```
   - Wait for confirmation: "You are all set!"

---

## Step 2: Configure Your App (1 minute)

Create `.env.local` file in project root:

```bash
# Paste your credentials here:
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...

# Sandbox number (same for everyone during testing):
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Your app URL (localhost for now):
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Where to find these:**
- Account SID & Auth Token: Twilio Console → Home
- WhatsApp Number: Console → Messaging → Try WhatsApp

---

## Step 3: Expose Localhost with ngrok (1 minute)

Twilio needs a **public URL** to send webhooks to your local machine.

```bash
# Terminal 1: Start your app
npm run dev

# Terminal 2: Expose localhost
npx ngrok http 3000
```

**ngrok will show:**
```
Forwarding   https://abc123.ngrok.io -> http://localhost:3000
```

**Copy that URL!** (e.g., `https://abc123.ngrok.io`)

---

## Step 4: Set Webhook in Twilio (1 minute)

1. Go to **Console → Messaging → Settings → WhatsApp Sandbox Settings**

2. Under **"When a message comes in"**, paste:
   ```
   https://abc123.ngrok.io/api/whatsapp/webhook
   ```
   _(Replace `abc123` with your ngrok subdomain)_

3. **Method:** POST

4. Click **Save**

---

## Step 5: Test! 🎉

### Test 1: Valid Vote

Send to the WhatsApp sandbox number:
```
1
```

**Expected response:**
```
✅ Vote recorded for option 1!

You'll get a confirmation message when the organizer closes the poll.

🔒 Your vote is private and will be deleted 7 days after the event.
```

### Test 2: Invalid Vote

Send:
```
hello
```

**Expected response:**
```
❓ To vote, reply with the option number (1, 2, 3, or 4).

Example: Reply "2" to vote for option 2.

Need help? Visit http://localhost:3000 to see all events.
```

### Test 3: Check Logs

In your terminal (where `npm run dev` is running), you should see:
```
📱 WhatsApp message received from whatsapp:+61... : "1"
```

In ngrok terminal, you should see:
```
POST /api/whatsapp/webhook   200 OK
```

---

## ✅ Success Checklist

- [ ] Joined Twilio WhatsApp sandbox
- [ ] Created `.env.local` with credentials
- [ ] Started app with `npm run dev`
- [ ] Started ngrok with `npx ngrok http 3000`
- [ ] Set webhook URL in Twilio
- [ ] Sent "1" to WhatsApp → Got confirmation
- [ ] Sent "hello" to WhatsApp → Got help message
- [ ] Saw webhook request in ngrok logs

---

## 🐛 Troubleshooting

### "No response from WhatsApp bot"

**Check:**
1. Did you join the sandbox? (Send `join abc-123` first)
2. Is ngrok running? (Check Terminal 2)
3. Is the webhook URL correct in Twilio? (Should be your ngrok URL + `/api/whatsapp/webhook`)
4. Check Twilio logs: Console → Monitor → Logs

### "Webhook returns 404"

**Fix:** Make sure the URL is exactly:
```
https://YOUR-NGROK-URL.ngrok.io/api/whatsapp/webhook
```

Not:
- ❌ `http://` (must be `https://`)
- ❌ Missing `/api/whatsapp/webhook`
- ❌ Trailing slash

### "ngrok URL changed"

ngrok gives you a **new URL every time** you restart it (free tier). You'll need to:
1. Copy the new ngrok URL
2. Update webhook in Twilio
3. Test again

**Pro tip:** Get a permanent URL with `ngrok http 3000 --domain=yourname.ngrok.io` (paid tier)

### "Invalid Twilio signature"

**Fix:** The signature validation is **disabled in dev mode** (see webhook code). If you're still getting this error, check:
1. `TWILIO_AUTH_TOKEN` is correct in `.env.local`
2. Restart your dev server after adding `.env.local`

---

## 🎯 Next Steps

Once testing works:

1. **Set up database** (Supabase) to persist votes
2. **Deploy to Vercel** for production
3. **Get real WhatsApp number** (costs ~$1/month)
4. **Apply for WhatsApp Business** approval

---

## 📱 Production Flow (Coming Soon)

When you're ready for real users:

```
1. User creates event on web app
2. System generates unique code: "JOIN abc123"
3. User shares in WhatsApp group:
   "Vote for Friday football! Send 'JOIN abc123' to +61..."
4. Players send "JOIN abc123" to your WhatsApp number
5. Bot replies with voting options
6. Players reply with "1", "2", "3", or "4"
7. Bot confirms vote
8. Organizer closes poll on web app
9. Bot sends confirmations/declines automatically
```

---

## 💰 Cost Estimate

### Testing (Sandbox):
- ✅ **FREE** (uses Twilio trial credit)

### Production:
- **WhatsApp number:** ~$1-2 AUD/month
- **Incoming messages:** FREE
- **Outgoing messages:** ~$0.005-0.01 AUD each

**Example:** 100 events/month, 20 players each:
- 2,000 outgoing messages = ~$10-20 AUD/month

---

## 🆘 Need Help?

- **Twilio docs:** https://www.twilio.com/docs/whatsapp/quickstart
- **ngrok docs:** https://ngrok.com/docs
- **Your webhook URL:** Check in ngrok terminal
- **Twilio logs:** Console → Monitor → Logs

---

**Ready to test? Start from Step 1!** ☝️
