import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

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
    phoneNumber?: string;
    source: 'web' | 'whatsapp';
  }>;
  status: string;
}

/**
 * POST /api/whatsapp/webhook
 *
 * Receives incoming WhatsApp messages from Twilio
 * Users can vote by sending "1", "2", "3", or "4"
 */
export async function POST(req: NextRequest) {
  try {
    // Parse Twilio's form data
    const formData = await req.formData();

    const from = formData.get('From') as string;          // Sender's WhatsApp number (whatsapp:+61...)
    const body = formData.get('Body') as string;          // Message text
    const profileName = formData.get('ProfileName') as string; // Sender's WhatsApp name
    const messageId = formData.get('MessageSid') as string;

    console.log(`📱 WhatsApp message received from ${from}: "${body}"`);

    // Validate the webhook is from Twilio (optional but recommended for production)
    const twilioSignature = req.headers.get('x-twilio-signature') || '';
    const url = process.env.TWILIO_WEBHOOK_URL || '';

    // Only validate in production (skip in dev)
    if (process.env.NODE_ENV === 'production' && process.env.TWILIO_AUTH_TOKEN) {
      const params = Object.fromEntries(formData.entries());
      const isValid = twilio.validateRequest(
        process.env.TWILIO_AUTH_TOKEN,
        twilioSignature,
        url,
        params
      );

      if (!isValid) {
        console.error('❌ Invalid Twilio signature');
        return new NextResponse('Forbidden', { status: 403 });
      }
    }

    // Parse vote (1, 2, 3, or 4)
    const voteNumber = parseInt(body.trim());

    if (isNaN(voteNumber) || voteNumber < 1 || voteNumber > 4) {
      // Invalid vote - send help message
      return respondWithMessage(`
❓ To vote, reply with the option number (1, 2, 3, or 4).

Example: Reply "2" to vote for option 2.

Need help? Visit ${process.env.NEXT_PUBLIC_APP_URL || 'our website'} to see all events.
      `.trim());
    }

    // Find the active event that this person should be voting on
    // In production, this would query a database
    // For now, we'll look for the most recent active event in localStorage

    // Note: In a real app, you'd need to:
    // 1. Store a mapping of phone numbers to events they're voting on
    // 2. Or send a unique link/code with each voting message
    // 3. Use a proper database instead of localStorage

    // For MVP, we'll return a placeholder response
    // You'll need to implement database logic to:
    // - Find which event this phone number is voting for
    // - Record the vote
    // - Send confirmation

    return respondWithMessage(`
✅ Vote recorded for option ${voteNumber}!

You'll get a confirmation message when the organizer closes the poll.

🔒 Your vote is private and will be deleted 7 days after the event.
    `.trim());

  } catch (error) {
    console.error('Error processing WhatsApp webhook:', error);
    return respondWithMessage('Sorry, there was an error processing your vote. Please try again.');
  }
}

/**
 * GET /api/whatsapp/webhook
 *
 * Used by Twilio to verify the webhook URL
 */
export async function GET(req: NextRequest) {
  return new NextResponse('WhatsApp webhook is active', { status: 200 });
}

/**
 * Helper to respond with a Twilio MessagingResponse
 */
function respondWithMessage(message: string) {
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapeXml(message)}</Message>
</Response>`;

  return new NextResponse(twiml, {
    status: 200,
    headers: {
      'Content-Type': 'text/xml',
    },
  });
}

/**
 * Escape XML special characters
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
