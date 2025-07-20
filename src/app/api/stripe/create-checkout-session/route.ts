import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession } from '@/lib/stripe'
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

    const {
      lineItems,
      mode = 'payment',
      successUrl,
      cancelUrl,
      customerEmail,
      metadata = {},
    } = await request.json()

    if (!lineItems || !Array.isArray(lineItems) || lineItems.length === 0) {
      return NextResponse.json(
        { error: 'Invalid line items' },
        { status: 400 }
      )
    }

    if (!successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: 'Success and cancel URLs are required' },
        { status: 400 }
      )
    }

    // Add user metadata
    const userMetadata = {
      ...metadata,
      userId: session.user.id,
      userEmail: session.user.email,
    }

    const result = await createCheckoutSession({
      lineItems,
      mode,
      successUrl,
      cancelUrl,
      customerEmail: customerEmail || session.user.email,
      metadata: userMetadata,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      sessionId: result.sessionId,
      url: result.url,
    })

  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 