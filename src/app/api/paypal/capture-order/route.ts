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

    const { orderID } = await request.json()

    if (!orderID) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken()
    const paypalApiUrl = getPayPalApiUrl()

    // Capture PayPal payment
    const paypalResponse = await fetch(`${paypalApiUrl}/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    const paypalData = await paypalResponse.json()

    if (!paypalResponse.ok) {
      console.error('PayPal capture error:', paypalData)
      return NextResponse.json(
        { error: 'Failed to capture payment' },
        { status: 500 }
      )
    }

    // Check if payment was successful
    if (paypalData.status === 'COMPLETED') {
      return NextResponse.json({
        success: true,
        paymentID: paypalData.purchase_units[0]?.payments?.captures[0]?.id,
        status: paypalData.status,
        amount: paypalData.purchase_units[0]?.payments?.captures[0]?.amount?.value,
        currency: paypalData.purchase_units[0]?.payments?.captures[0]?.amount?.currency_code,
      })
    } else {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('PayPal capture error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 