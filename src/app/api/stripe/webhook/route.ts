import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature, stripe } from '@/lib/stripe'
import clientPromise from '@/lib/mongodb'
import Order from '@/models/Order'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      )
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!
    const result = verifyWebhookSignature(body, signature, webhookSecret)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    const event = result.event
    if (!event) {
      return NextResponse.json(
        { error: 'Invalid event' },
        { status: 400 }
      )
    }

    await clientPromise

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object)
        break

      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object)
        break

      case 'checkout.session.expired':
        await handleCheckoutSessionExpired(event.data.object)
        break

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: any) {
  try {
    const orderId = paymentIntent.metadata?.orderId
    
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        status: 'paid',
        paymentStatus: 'succeeded',
        paymentIntentId: paymentIntent.id,
        paidAt: new Date(),
      })
      
      console.log(`Order ${orderId} marked as paid`)
    }
  } catch (error) {
    console.error('Error handling payment intent succeeded:', error)
  }
}

async function handlePaymentIntentFailed(paymentIntent: any) {
  try {
    const orderId = paymentIntent.metadata?.orderId
    
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        status: 'payment_failed',
        paymentStatus: 'failed',
        paymentIntentId: paymentIntent.id,
      })
      
      console.log(`Order ${orderId} payment failed`)
    }
  } catch (error) {
    console.error('Error handling payment intent failed:', error)
  }
}

async function handleCheckoutSessionCompleted(session: any) {
  try {
    const orderId = session.metadata?.orderId
    
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        status: 'processing',
        paymentStatus: 'succeeded',
        checkoutSessionId: session.id,
        customerId: session.customer,
        shippingAddress: session.shipping?.address,
        shippingName: session.shipping?.name,
      })
      
      console.log(`Order ${orderId} checkout completed`)
    }
  } catch (error) {
    console.error('Error handling checkout session completed:', error)
  }
}

async function handleCheckoutSessionExpired(session: any) {
  try {
    const orderId = session.metadata?.orderId
    
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        status: 'expired',
        paymentStatus: 'pending',
      })
      
      console.log(`Order ${orderId} checkout expired`)
    }
  } catch (error) {
    console.error('Error handling checkout session expired:', error)
  }
}

async function handleSubscriptionCreated(subscription: any) {
  try {
    console.log(`Subscription ${subscription.id} created`)
    // Handle subscription creation logic here
  } catch (error) {
    console.error('Error handling subscription created:', error)
  }
}

async function handleSubscriptionUpdated(subscription: any) {
  try {
    console.log(`Subscription ${subscription.id} updated`)
    // Handle subscription update logic here
  } catch (error) {
    console.error('Error handling subscription updated:', error)
  }
}

async function handleSubscriptionDeleted(subscription: any) {
  try {
    console.log(`Subscription ${subscription.id} deleted`)
    // Handle subscription deletion logic here
  } catch (error) {
    console.error('Error handling subscription deleted:', error)
  }
} 