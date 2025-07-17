import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import connectDB from '../../../lib/mongoose'
import { authOptions } from '../../../lib/auth'
import { Order, Product, User } from '../../../models'
import { CreateOrderInput, ApiResponse, IOrder, IOrderItem } from '../../../types'

interface OrderQueryParams {
  page?: string
  limit?: string
  status?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

interface CreateOrderRequestBody extends CreateOrderInput {
  // Additional fields that might come from the frontend
}

// GET /api/orders - Fetch user orders
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<IOrder[]>>> {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication required',
          error: 'UNAUTHORIZED',
        },
        { status: 401 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const queryParams: OrderQueryParams = {
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
      status: searchParams.get('status') || undefined,
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    }

    // Validate query parameters
    const page = Math.max(1, parseInt(queryParams.page))
    const limit = Math.min(50, Math.max(1, parseInt(queryParams.limit))) // Max 50 orders per page
    const skip = (page - 1) * limit

    // Connect to database
    await connectDB()

    // Build query filter
    const filter: any = { user: session.user.id }
    
    if (queryParams.status) {
      switch (queryParams.status) {
        case 'pending':
          filter.isPaid = false
          break
        case 'paid':
          filter.isPaid = true
          filter.isDelivered = false
          break
        case 'delivered':
          filter.isDelivered = true
          break
        default:
          // Invalid status, ignore filter
          break
      }
    }

    // Build sort object
    const sort: any = {}
    sort[queryParams.sortBy] = queryParams.sortOrder === 'asc' ? 1 : -1

    // Fetch orders with pagination
    const [orders, totalOrders] = await Promise.all([
      Order.find(filter)
        .populate({
          path: 'orderItems.product',
          select: 'name price image category',
        })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
    ])

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalOrders / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json(
      {
        success: true,
        message: 'Orders fetched successfully',
        data: orders,
        pagination: {
          currentPage: page,
          totalPages,
          totalOrders,
          hasNextPage,
          hasPrevPage,
          limit,
        },
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error fetching orders:', error)
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch orders',
        error: 'SERVER_ERROR',
      },
      { status: 500 }
    )
  }
}

// POST /api/orders - Create new order
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<IOrder>>> {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication required',
          error: 'UNAUTHORIZED',
        },
        { status: 401 }
      )
    }

    // Parse request body
    const body: CreateOrderRequestBody = await request.json()

    // Validate required fields
    const validationErrors = validateOrderData(body)
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          error: 'VALIDATION_ERROR',
          data: { validationErrors },
        },
        { status: 400 }
      )
    }

    // Connect to database
    await connectDB()

    // Validate order items and check stock
    const validatedOrderItems = await validateOrderItems(body.orderItems)
    if (!validatedOrderItems.isValid) {
      return NextResponse.json(
        {
          success: false,
          message: validatedOrderItems.message,
          error: 'INVALID_ORDER_ITEMS',
        },
        { status: 400 }
      )
    }

    // Calculate order totals
    const calculations = calculateOrderTotals(validatedOrderItems.items)
    
    // Verify client-provided totals match server calculations
    if (!verifyOrderTotals(body, calculations)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Order total mismatch. Please refresh and try again.',
          error: 'TOTAL_MISMATCH',
        },
        { status: 400 }
      )
    }

    // Create order data
    const orderData = {
      user: session.user.id,
      orderItems: validatedOrderItems.items,
      shippingAddress: body.shippingAddress,
      paymentMethod: body.paymentMethod,
      itemsPrice: calculations.itemsPrice,
      shippingPrice: calculations.shippingPrice,
      taxPrice: calculations.taxPrice,
      totalPrice: calculations.totalPrice,
      isPaid: false,
      isDelivered: false,
    }

    // Create order
    const newOrder = await Order.create(orderData)

    // Update product stock
    await updateProductStock(validatedOrderItems.items)

    // Populate the order with product details
    const populatedOrder = await Order.findById(newOrder._id)
      .populate({
        path: 'orderItems.product',
        select: 'name price image category',
      })
      .populate({
        path: 'user',
        select: 'name email',
      })

    // Log order creation
    console.log(`New order created: ${newOrder._id} for user: ${session.user.email}`)

    // Send order confirmation email (in a real app)
    // await sendOrderConfirmationEmail(populatedOrder)

    // Process payment (if immediate payment)
    // await processPayment(newOrder, body.paymentDetails)

    return NextResponse.json(
      {
        success: true,
        message: 'Order created successfully',
        data: populatedOrder,
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error creating order:', error)

    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => ({
        field: err.path,
        message: err.message,
      }))

      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          error: 'VALIDATION_ERROR',
          data: { validationErrors },
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create order',
        error: 'SERVER_ERROR',
      },
      { status: 500 }
    )
  }
}

// Validation helper functions
function validateOrderData(data: CreateOrderRequestBody): Array<{ field: string; message: string }> {
  const errors: Array<{ field: string; message: string }> = []

  // Validate order items
  if (!data.orderItems || !Array.isArray(data.orderItems) || data.orderItems.length === 0) {
    errors.push({ field: 'orderItems', message: 'Order must contain at least one item' })
  }

  // Validate shipping address
  if (!data.shippingAddress) {
    errors.push({ field: 'shippingAddress', message: 'Shipping address is required' })
  } else {
    const requiredAddressFields = ['street', 'city', 'state', 'zipCode', 'country']
    for (const field of requiredAddressFields) {
      if (!data.shippingAddress[field]) {
        errors.push({ field: `shippingAddress.${field}`, message: `${field} is required` })
      }
    }
  }

  // Validate payment method
  if (!data.paymentMethod) {
    errors.push({ field: 'paymentMethod', message: 'Payment method is required' })
  } else if (!['card', 'paypal', 'bank_transfer'].includes(data.paymentMethod)) {
    errors.push({ field: 'paymentMethod', message: 'Invalid payment method' })
  }

  // Validate pricing
  if (typeof data.itemsPrice !== 'number' || data.itemsPrice < 0) {
    errors.push({ field: 'itemsPrice', message: 'Invalid items price' })
  }

  if (typeof data.shippingPrice !== 'number' || data.shippingPrice < 0) {
    errors.push({ field: 'shippingPrice', message: 'Invalid shipping price' })
  }

  if (typeof data.taxPrice !== 'number' || data.taxPrice < 0) {
    errors.push({ field: 'taxPrice', message: 'Invalid tax price' })
  }

  if (typeof data.totalPrice !== 'number' || data.totalPrice <= 0) {
    errors.push({ field: 'totalPrice', message: 'Invalid total price' })
  }

  return errors
}

interface ValidatedOrderItems {
  isValid: boolean
  message: string
  items: IOrderItem[]
}

async function validateOrderItems(orderItems: IOrderItem[]): Promise<ValidatedOrderItems> {
  try {
    const validatedItems: IOrderItem[] = []

    for (const item of orderItems) {
      // Validate item structure
      if (!item.product || !item.quantity || !item.price) {
        return {
          isValid: false,
          message: 'Invalid order item structure',
          items: [],
        }
      }

      // Fetch product from database
      const product = await Product.findById(item.product)
      if (!product) {
        return {
          isValid: false,
          message: `Product ${item.product} not found`,
          items: [],
        }
      }

      // Check stock availability
      if (product.stock < item.quantity) {
        return {
          isValid: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
          items: [],
        }
      }

      // Verify price hasn't changed
      if (Math.abs(product.price - item.price) > 0.01) {
        return {
          isValid: false,
          message: `Price mismatch for ${product.name}. Current price: $${product.price}, Order price: $${item.price}`,
          items: [],
        }
      }

      validatedItems.push({
        product: item.product,
        quantity: item.quantity,
        price: product.price, // Use current price from database
      })
    }

    return {
      isValid: true,
      message: 'All items validated successfully',
      items: validatedItems,
    }

  } catch (error) {
    console.error('Error validating order items:', error)
    return {
      isValid: false,
      message: 'Error validating order items',
      items: [],
    }
  }
}

interface OrderCalculations {
  itemsPrice: number
  shippingPrice: number
  taxPrice: number
  totalPrice: number
}

function calculateOrderTotals(orderItems: IOrderItem[]): OrderCalculations {
  // Calculate items total
  const itemsPrice = orderItems.reduce((total, item) => {
    return total + (item.price * item.quantity)
  }, 0)

  // Calculate shipping (free shipping over $100)
  const shippingPrice = itemsPrice >= 100 ? 0 : 10

  // Calculate tax (10% tax rate)
  const taxRate = 0.10
  const taxPrice = itemsPrice * taxRate

  // Calculate total
  const totalPrice = itemsPrice + shippingPrice + taxPrice

  return {
    itemsPrice: Math.round(itemsPrice * 100) / 100,
    shippingPrice: Math.round(shippingPrice * 100) / 100,
    taxPrice: Math.round(taxPrice * 100) / 100,
    totalPrice: Math.round(totalPrice * 100) / 100,
  }
}

function verifyOrderTotals(clientData: CreateOrderRequestBody, serverCalculations: OrderCalculations): boolean {
  const tolerance = 0.01 // Allow 1 cent tolerance for floating point differences

  return (
    Math.abs(clientData.itemsPrice - serverCalculations.itemsPrice) <= tolerance &&
    Math.abs(clientData.shippingPrice - serverCalculations.shippingPrice) <= tolerance &&
    Math.abs(clientData.taxPrice - serverCalculations.taxPrice) <= tolerance &&
    Math.abs(clientData.totalPrice - serverCalculations.totalPrice) <= tolerance
  )
}

async function updateProductStock(orderItems: IOrderItem[]): Promise<void> {
  try {
    const stockUpdates = orderItems.map(item => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { stock: -item.quantity } },
      },
    }))

    await Product.bulkWrite(stockUpdates)
    console.log('Product stock updated successfully')

  } catch (error) {
    console.error('Error updating product stock:', error)
    // Log error but don't fail the order creation
    // In a production app, you might want to implement compensation logic
  }
}

// Email notification helper (placeholder)
async function sendOrderConfirmationEmail(order: IOrder): Promise<void> {
  try {
    console.log(`Sending order confirmation email for order: ${order._id}`)
    
    // In a real application, integrate with email service
    // await emailService.send({
    //   to: order.user.email,
    //   subject: `Order Confirmation - #${order._id.slice(-8)}`,
    //   template: 'order-confirmation',
    //   data: { order }
    // })

  } catch (error) {
    console.error('Failed to send order confirmation email:', error)
  }
}

// Payment processing helper (placeholder)
async function processPayment(order: IOrder, paymentDetails: any): Promise<void> {
  try {
    console.log(`Processing payment for order: ${order._id}`)
    
    // In a real application, integrate with payment processor
    // const paymentResult = await paymentProcessor.charge({
    //   amount: order.totalPrice,
    //   currency: 'USD',
    //   source: paymentDetails.token,
    //   description: `Order #${order._id.slice(-8)}`
    // })

    // if (paymentResult.success) {
    //   await Order.findByIdAndUpdate(order._id, {
    //     isPaid: true,
    //     paidAt: new Date(),
    //     paymentResult: {
    //       id: paymentResult.id,
    //       status: paymentResult.status,
    //       email_address: paymentResult.email
    //     }
    //   })
    // }

  } catch (error) {
    console.error('Payment processing failed:', error)
    throw error
  }
}
