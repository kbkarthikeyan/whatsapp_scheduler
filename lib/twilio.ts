import twilio from 'twilio';

// Initialize Twilio client
let twilioClient: ReturnType<typeof twilio> | null = null;

export function getTwilioClient() {
  if (!twilioClient) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      console.warn('Twilio credentials not configured. WhatsApp messaging disabled.');
      return null;
    }

    twilioClient = twilio(accountSid, authToken);
  }

  return twilioClient;
}

/**
 * Send a WhatsApp message via Twilio
 */
export async function sendWhatsAppMessage(to: string, message: string) {
  const client = getTwilioClient();

  if (!client) {
    console.error('Twilio client not initialized');
    return { success: false, error: 'Twilio not configured' };
  }

  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

  if (!fromNumber) {
    console.error('TWILIO_WHATSAPP_NUMBER not configured');
    return { success: false, error: 'WhatsApp number not configured' };
  }

  try {
    // Ensure 'to' is in WhatsApp format
    const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

    const result = await client.messages.create({
      body: message,
      from: fromNumber,
      to: formattedTo,
    });

    console.log(`WhatsApp message sent: ${result.sid}`);
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Send confirmation message to confirmed players
 */
export async function sendConfirmationMessage(
  phoneNumber: string,
  eventName: string,
  eventDate: string,
  turfName: string,
  startTime: string,
  endTime: string,
  notes?: string,
  pricePerPlayer?: string
) {
  let message = `✅ You're confirmed for ${eventName}!\n\n`;
  message += `📅 ${eventDate}\n`;
  message += `⏰ ${startTime} – ${endTime}\n`;
  message += `📍 ${turfName}\n`;

  if (pricePerPlayer) {
    message += `💰 ${pricePerPlayer} per player\n`;
  }

  if (notes) {
    message += `\nℹ️ ${notes}\n`;
  }

  message += `\nSee you there! 🎉`;

  return await sendWhatsAppMessage(phoneNumber, message);
}

/**
 * Send decline message to players who voted for non-winning slots
 */
export async function sendDeclineMessage(
  phoneNumber: string,
  eventName: string,
  reason: 'different-time' | 'full'
) {
  let message = `Thanks for voting for ${eventName}!\n\n`;

  if (reason === 'different-time') {
    message += `Unfortunately, the group chose a different time slot.\n\n`;
  } else {
    message += `Unfortunately, your time slot filled up quickly.\n\n`;
  }

  message += `Hope to see you next time! ⚽`;

  return await sendWhatsAppMessage(phoneNumber, message);
}

/**
 * Send voting instructions when event is shared
 */
export async function sendVotingInstructions(
  phoneNumber: string,
  eventName: string,
  eventDate: string,
  sport: string,
  options: Array<{ number: number; turfName: string; startTime: string; endTime: string }>,
  pricePerPlayer?: string,
  notes?: string
) {
  const sportEmojis: Record<string, string> = {
    football: '⚽',
    cricket: '🏏',
    badminton: '🏸',
    bowling: '🎳',
    other: '🎯',
  };

  const emoji = sportEmojis[sport] || '🎯';

  let message = `${emoji} ${eventName}\n`;
  message += `${eventDate}`;

  if (pricePerPlayer) {
    message += ` · ${pricePerPlayer}`;
  }

  message += `\n\n`;
  message += `Vote for your preferred turf and time by replying with the number:\n\n`;

  const numberEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣'];

  options.forEach((opt, index) => {
    message += `${numberEmojis[index]} ${opt.turfName} · ${opt.startTime}–${opt.endTime}\n`;
  });

  if (notes) {
    message += `\nℹ️ ${notes}`;
  }

  return await sendWhatsAppMessage(phoneNumber, message);
}

/**
 * Format phone number to E.164 format (required by Twilio)
 * Example: "0412345678" (Australian) -> "+61412345678"
 */
export function formatPhoneNumber(phone: string, countryCode: string = '+61'): string {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');

  // If starts with 0, remove it (Australian mobile format)
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }

  // Add country code if not present
  if (!cleaned.startsWith(countryCode.replace('+', ''))) {
    cleaned = countryCode.replace('+', '') + cleaned;
  }

  return '+' + cleaned;
}
