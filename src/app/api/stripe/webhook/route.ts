import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import connectDB from '@/lib/mongoose'
import Order from '@/models/Order'
import Product from '@/models/Product'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    )
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  try {
    await connectDB()

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object)
        break

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutSessionCompleted(session: any) {
  console.log('Processing checkout session completed:', session.id)

  const orderId = session.metadata?.orderId
  if (!orderId) {
    console.error('No order ID in session metadata')
    return
  }

  try {
    const order = await Order.findById(orderId)
    if (!order) {
      console.error('Order not found:', orderId)
      return
    }

    // Update order with payment result
    order.isPaid = true
    order.paidAt = new Date()
    order.paymentResult = {
      id: session.payment_intent || session.id,
      status: session.payment_status,
      email_address: session.customer_details?.email,
    }

    await order.save()

    // Update product stock
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      })
    }

    console.log('Order updated successfully:', orderId)
  } catch (error) {
    console.error('Error updating order:', error)
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: any) {
  console.log('Processing payment intent succeeded:', paymentIntent.id)

  // Find order by payment intent ID
  const order = await Order.findOne({
    'paymentResult.id': paymentIntent.id
  })

  if (order && !order.isPaid) {
    order.isPaid = true
    order.paidAt = new Date()
    order.paymentResult = {
      ...order.paymentResult,
      status: paymentIntent.status,
    }

    await order.save()
    console.log('Order marked as paid:', order._id)
  }
}

async function handlePaymentIntentFailed(paymentIntent: any) {
  console.log('Processing payment intent failed:', paymentIntent.id)

  // Find order by payment intent ID
  const order = await Order.findOne({
    'paymentResult.id': paymentIntent.id
  })

  if (order) {
    // You might want to update order status or send notification
    console.log('Payment failed for order:', order._id)
  }
} 