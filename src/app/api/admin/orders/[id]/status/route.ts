import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import connectDB from '@/lib/mongoose'
import { authOptions } from '@/lib/auth'
import { Order } from '@/models'
import { ApiResponse } from '@/types'
import { isValidObjectId } from 'mongoose'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<{
  orderId: string
  previousStatus: string
  newStatus: string
}>>> {
  const { id } = await params
  try {

    // Check authentication and authorization
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

    // Check if user is admin
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          message: 'Admin access required',
          error: 'FORBIDDEN',
        },
        { status: 403 }
      )
    }

    // Validate MongoDB ObjectId
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid order ID format',
          error: 'INVALID_ID',
        },
        { status: 400 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { status: newStatus } = body

    // Validate status
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    if (!validStatuses.includes(newStatus)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid status value',
          error: 'INVALID_STATUS',
        },
        { status: 400 }
      )
    }

    // Connect to database
    await connectDB()

    // Check if order exists
    const existingOrder = await Order.findById(id)
    if (!existingOrder) {
      return NextResponse.json(
        {
          success: false,
          message: 'Order not found',
          error: 'ORDER_NOT_FOUND',
        },
        { status: 404 }
      )
    }

    // Update order status
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { 
        $set: { 
          status: newStatus,
          updatedAt: new Date()
        }
      },
      { new: true }
    )

    // Log status change
    console.log(`Order ${id} status updated from ${existingOrder.status} to ${newStatus} by admin: ${session.user.email}`)

    // In a real app, you might want to:
    // - Send email notifications to customers
    // - Update inventory if order is cancelled
    // - Trigger shipping notifications
    // - Update analytics

    return NextResponse.json(
      {
        success: true,
        message: 'Order status updated successfully',
        data: {
          orderId: id,
          previousStatus: existingOrder.status,
          newStatus: updatedOrder.status,
        },
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error updating order status:', error)
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update order status',
        error: 'SERVER_ERROR',
      },
      { status: 500 }
    )
  }
} 