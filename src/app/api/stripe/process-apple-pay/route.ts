import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { paymentIntentId, token } = await request.json()

    if (!paymentIntentId || !token) {
      return NextResponse.json(
        { error: 'Payment intent ID and token are required' },
        { status: 400 }
      )
    }

    // Retrieve the payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (!paymentIntent) {
      return NextResponse.json(
        { error: 'Payment intent not found' },
        { status: 404 }
      )
    }

    // Confirm the payment intent with Apple Pay token
    const confirmedPaymentIntent = await stripe.paymentIntents.confirm(
      paymentIntentId,
      {
        payment_method: 'pm_card_visa', // Use a test payment method for now
        return_url: `${process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost:3000'}/orders/success`,
      }
    )

    if (confirmedPaymentIntent.status === 'succeeded') {
      return NextResponse.json({
        success: true,
        paymentIntent: confirmedPaymentIntent,
      })
    } else if (confirmedPaymentIntent.status === 'requires_action') {
      return NextResponse.json({
        success: true,
        requiresAction: true,
        paymentIntent: confirmedPaymentIntent,
      })
    } else {
      return NextResponse.json(
        { error: 'Payment failed' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Apple Pay processing error:', error)
    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    )
  }
} 