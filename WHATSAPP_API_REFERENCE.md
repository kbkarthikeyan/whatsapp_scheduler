# 📡 WhatsApp API Reference

## Overview

Your app now has **3 WhatsApp API endpoints** ready to use:

---

## 1. Webhook (Receive Votes)

**`POST /api/whatsapp/webhook`**

Receives incoming WhatsApp messages from Twilio.

### How It Works:

```
User sends WhatsApp message
       ↓
Twilio receives it
       ↓
Twilio sends webhook to your app
       ↓
Your app processes vote
       ↓
Your app responds via Twilio XML
       ↓
User receives confirmation
```

### Example Request (from Twilio):

```
POST /api/whatsapp/webhook
Content-Type: application/x-www-form-urlencoded

From=whatsapp:+61412345678
Body=1
ProfileName=John Smith
MessageSid=SM...
```

### Example Response (to Twilio):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>✅ Vote recorded for option 1!</Message>
</Response>
```

### User Receives:

```
✅ Vote recorded for option 1!

You'll get a confirmation message when the organizer closes the poll.

🔒 Your vote is private and will be deleted 7 days after the event.
```

### Supported Commands:

| User Sends | Response |
|------------|----------|
| `1` | ✅ Vote recorded for option 1 |
| `2` | ✅ Vote recorded for option 2 |
| `3` | ✅ Vote recorded for option 3 |
| `4` | ✅ Vote recorded for option 4 |
| Anything else | ❓ Help message with instructions |

---

## 2. Send Confirmations

**`POST /api/whatsapp/send-confirmations`**

Sends confirmation/decline messages when organizer closes poll.

### Example Request:

```json
POST /api/whatsapp/send-confirmations
Content-Type: application/json

{
  "eventId": "1735012345678",
  "eventName": "Friday Night Football",
  "eventDate": "Fri, Dec 27",
  "sport": "football",
  "selectedOption": {
    "turfName": "Main Pitch",
    "startTime": "19:00",
    "endTime": "20:00"
  },
  "confirmedPlayers": [
    {
      "name": "Alex",
      "phoneNumber": "+61412345678"
    },
    {
      "name": "Sam",
      "phoneNumber": "+61423456789"
    }
  ],
  "declinedPlayers": [
    {
      "name": "Jordan",
      "phoneNumber": "+61434567890",
      "reason": "different-time"
    }
  ],
  "pricePerPlayer": "$25",
  "notes": "Bring shin guards"
}
```

### Example Response:

```json
{
  "success": true,
  "results": {
    "confirmations": [
      {
        "name": "Alex",
        "phone": "+61412345678",
        "sid": "SM..."
      },
      {
        "name": "Sam",
        "phone": "+61423456789",
        "sid": "SM..."
      }
    ],
    "declines": [
      {
        "name": "Jordan",
        "phone": "+61434567890",
        "sid": "SM..."
      }
    ],
    "errors": []
  }
}
```

### Messages Sent:

**Confirmed players receive:**
```
✅ You're confirmed for Friday Night Football!

📅 Fri, Dec 27
⏰ 19:00 – 20:00
📍 Main Pitch
💰 $25 per player

ℹ️ Bring shin guards

See you there! 🎉
```

**Declined players receive:**
```
Thanks for voting for Friday Night Football!

Unfortunately, the group chose a different time slot.

Hope to see you next time! ⚽
```

---

## 3. Webhook Verification

**`GET /api/whatsapp/webhook`**

Used by Twilio to verify the webhook URL is active.

### Example Request:

```
GET /api/whatsapp/webhook
```

### Example Response:

```
WhatsApp webhook is active
```

---

## 🔐 Security

### Signature Validation:

In **production**, the webhook validates Twilio's signature:

```typescript
const twilioSignature = req.headers.get('x-twilio-signature');
const isValid = twilio.validateRequest(
  process.env.TWILIO_AUTH_TOKEN,
  twilioSignature,
  webhookUrl,
  params
);

if (!isValid) {
  return new NextResponse('Forbidden', { status: 403 });
}
```

In **development**, validation is **disabled** for easier testing with ngrok.

---

## 📱 Utility Functions

Located in `lib/twilio.ts`:

### `sendWhatsAppMessage(to, message)`

Send a WhatsApp message.

```typescript
import { sendWhatsAppMessage } from '@/lib/twilio';

await sendWhatsAppMessage(
  '+61412345678',
  'Hello from TurfMatcher!'
);
```

### `sendConfirmationMessage(...)`

Send a formatted confirmation message.

```typescript
import { sendConfirmationMessage } from '@/lib/twilio';

await sendConfirmationMessage(
  '+61412345678',
  'Friday Football',
  'Dec 27',
  'Main Pitch',
  '19:00',
  '20:00',
  'Bring shin guards',
  '$25'
);
```

### `sendDeclineMessage(phoneNumber, eventName, reason)`

Send a polite decline message.

```typescript
import { sendDeclineMessage } from '@/lib/twilio';

await sendDeclineMessage(
  '+61412345678',
  'Friday Football',
  'different-time' // or 'full'
);
```

### `formatPhoneNumber(phone, countryCode)`

Format Australian phone numbers to E.164 format.

```typescript
import { formatPhoneNumber } from '@/lib/twilio';

formatPhoneNumber('0412345678')
// Returns: "+61412345678"

formatPhoneNumber('412345678', '+61')
// Returns: "+61412345678"
```

---

## 🧪 Testing with cURL

### Test Webhook (simulate Twilio):

```bash
curl -X POST http://localhost:3000/api/whatsapp/webhook \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "From=whatsapp:+61412345678" \
  -d "Body=1" \
  -d "ProfileName=Test User" \
  -d "MessageSid=SM12345"
```

### Test Send Confirmations:

```bash
curl -X POST http://localhost:3000/api/whatsapp/send-confirmations \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "123",
    "eventName": "Test Event",
    "eventDate": "Dec 27",
    "sport": "football",
    "selectedOption": {
      "turfName": "Main Pitch",
      "startTime": "19:00",
      "endTime": "20:00"
    },
    "confirmedPlayers": [
      {
        "name": "Test User",
        "phoneNumber": "+61412345678"
      }
    ],
    "declinedPlayers": [],
    "pricePerPlayer": "$25"
  }'
```

---

## 🔗 Environment Variables Required

```bash
# Required for all WhatsApp features
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Required for webhook validation
TWILIO_WEBHOOK_URL=https://your-app.vercel.app/api/whatsapp/webhook

# Required for links in messages
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

---

## 📊 Rate Limits

Twilio rate limits (to prevent spam):

- **1 message/second** per recipient
- **100 messages/second** total (varies by account)

The `/send-confirmations` endpoint handles this automatically with **100ms delays** between messages.

---

## 🚧 Current Limitations

1. **Database integration pending:**
   - Votes are acknowledged but not yet persisted
   - Need to add Supabase/PostgreSQL to link votes to events

2. **Event-to-phone mapping:**
   - Currently, bot doesn't know which event a user is voting for
   - Need to implement event codes (e.g., "JOIN abc123")

3. **Sandbox restrictions:**
   - Users must join sandbox first
   - Limited to your Twilio sandbox number
   - Production requires approved WhatsApp Business profile

---

## 🎯 Next Implementation Steps

1. **Set up Supabase:**
   - Create `events` table
   - Create `votes` table with `phoneNumber` field
   - Add `source: 'web' | 'whatsapp'` field

2. **Implement event codes:**
   - Generate unique code per event (e.g., "abc123")
   - User sends "JOIN abc123" to subscribe
   - Bot remembers which event they're voting for

3. **Link webhook to database:**
   - When vote is received, lookup active event for that phone number
   - Store vote in database
   - Send confirmation

4. **Integrate with dashboard:**
   - Dashboard shows votes from both web and WhatsApp
   - "Close Poll" button triggers `/api/whatsapp/send-confirmations`

---

## 📚 Resources

- **Twilio WhatsApp API:** https://www.twilio.com/docs/whatsapp/api
- **Twilio Webhook Signature:** https://www.twilio.com/docs/usage/security#validating-requests
- **E.164 Phone Format:** https://en.wikipedia.org/wiki/E.164

---

**Ready to test?** See [QUICKSTART_WHATSAPP.md](./QUICKSTART_WHATSAPP.md)
