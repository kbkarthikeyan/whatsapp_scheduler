import { NextRequest, NextResponse } from 'next/server';
import { sendConfirmationMessage, sendDeclineMessage } from '@/lib/twilio';

interface ConfirmationRequest {
  eventId: string;
  eventName: string;
  eventDate: string;
  sport: string;
  selectedOption: {
    turfName: string;
    startTime: string;
    endTime: string;
  };
  confirmedPlayers: Array<{
    name: string;
    phoneNumber: string;
  }>;
  declinedPlayers: Array<{
    name: string;
    phoneNumber: string;
    reason: 'different-time' | 'full';
  }>;
  pricePerPlayer?: string;
  notes?: string;
}

/**
 * POST /api/whatsapp/send-confirmations
 *
 * Sends WhatsApp confirmation/decline messages when organizer closes the poll
 */
export async function POST(req: NextRequest) {
  try {
    const data: ConfirmationRequest = await req.json();

    const {
      eventName,
      eventDate,
      selectedOption,
      confirmedPlayers,
      declinedPlayers,
      pricePerPlayer,
      notes,
    } = data;

    const results = {
      confirmations: [] as any[],
      declines: [] as any[],
      errors: [] as any[],
    };

    // Send confirmation messages
    for (const player of confirmedPlayers) {
      try {
        const result = await sendConfirmationMessage(
          player.phoneNumber,
          eventName,
          eventDate,
          selectedOption.turfName,
          selectedOption.startTime,
          selectedOption.endTime,
          notes,
          pricePerPlayer
        );

        if (result.success) {
          results.confirmations.push({
            name: player.name,
            phone: player.phoneNumber,
            sid: result.sid,
          });
        } else {
          results.errors.push({
            name: player.name,
            phone: player.phoneNumber,
            error: result.error,
          });
        }
      } catch (error) {
        results.errors.push({
          name: player.name,
          phone: player.phoneNumber,
          error: String(error),
        });
      }

      // Rate limit: Wait 100ms between messages to avoid Twilio rate limits
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Send decline messages
    for (const player of declinedPlayers) {
      try {
        const result = await sendDeclineMessage(
          player.phoneNumber,
          eventName,
          player.reason
        );

        if (result.success) {
          results.declines.push({
            name: player.name,
            phone: player.phoneNumber,
            sid: result.sid,
          });
        } else {
          results.errors.push({
            name: player.name,
            phone: player.phoneNumber,
            error: result.error,
          });
        }
      } catch (error) {
        results.errors.push({
          name: player.name,
          phone: player.phoneNumber,
          error: String(error),
        });
      }

      // Rate limit
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log('✅ Confirmations sent:', {
      confirmed: results.confirmations.length,
      declined: results.declines.length,
      errors: results.errors.length,
    });

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error('Error sending confirmations:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send confirmations',
        details: String(error),
      },
      { status: 500 }
    );
  }
}
