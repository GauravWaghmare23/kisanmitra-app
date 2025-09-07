import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = 'usd', cropId, fromUserId, toUserId } = await request.json();

    if (!amount || !cropId || !fromUserId || !toUserId) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        cropId,
        fromUserId,
        toUserId,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      },
    });

  } catch (error: any) {
    console.error('Create payment intent error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to create payment intent',
        error: error.message,
      },
      { status: 500 }
    );
  }
}