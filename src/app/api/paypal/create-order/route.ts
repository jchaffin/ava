import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getPayPalAccessToken, getPayPalApiUrl } from '@/lib/paypal'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { amount, currency } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }

    if (!currency) {
      return NextResponse.json(
        { error: 'Currency is required' },
        { status: 400 }
      )
    }

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken()
    const paypalApiUrl = getPayPalApiUrl()

    // Create PayPal order
    const paypalResponse = await fetch(`${paypalApiUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: currency.toUpperCase(),
              value: amount.toFixed(2),
            },
          },
        ],
        application_context: {
          return_url: `${process.env.NEXTAUTH_URL}/orders/success`,
          cancel_url: `${process.env.NEXTAUTH_URL}/cart`,
        },
      }),
    })

    const paypalData = await paypalResponse.json()

    if (!paypalResponse.ok) {
      console.error('PayPal API error:', paypalData)
      return NextResponse.json(
        { error: 'Failed to create PayPal order' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      orderID: paypalData.id,
    })

  } catch (error) {
    console.error('PayPal create order error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 