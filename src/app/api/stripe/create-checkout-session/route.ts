import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession } from '@/lib/stripe'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongoose'
import Order from '@/models/Order'
import Product from '@/models/Product'

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
      shippingAddress,
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

    // Connect to database
    await connectDB()

    // Validate products and calculate totals
    let totalAmount = 0
    const validatedItems = []

    for (const item of lineItems) {
      const product = await Product.findById(item.productId)
      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 400 }
        )
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}` },
          { status: 400 }
        )
      }

      const itemTotal = product.price * item.quantity
      totalAmount += itemTotal

      validatedItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
      })
    }

    // Create order in database (pending payment)
    const orderData = {
      user: session.user.id,
      orderItems: validatedItems,
      shippingAddress: shippingAddress || {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'US',
      },
      paymentMethod: 'card',
      itemsPrice: totalAmount,
      shippingPrice: 0, // Free shipping for now
      taxPrice: 0, // No tax for now
      totalPrice: totalAmount,
      isPaid: false,
      isDelivered: false,
    }

    const newOrder = await Order.create(orderData)

    // Add user metadata
    const userMetadata = {
      ...metadata,
      userId: session.user.id,
      userEmail: session.user.email,
      orderId: newOrder._id.toString(),
    }

    const result = await createCheckoutSession({
      lineItems,
      mode,
      successUrl: `${successUrl}?orderId=${newOrder._id}`,
      cancelUrl: `${cancelUrl}?orderId=${newOrder._id}`,
      customerEmail: customerEmail || session.user.email,
      metadata: userMetadata,
    })

    if (!result.success) {
      // Delete the order if checkout session creation failed
      await Order.findByIdAndDelete(newOrder._id)
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      sessionId: result.sessionId,
      url: result.url,
      orderId: newOrder._id,
    })

  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 