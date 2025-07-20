import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import connectDB from '@/lib/mongoose'
import { authOptions } from '@/lib/auth'
import { Order } from '@/models'
import { ApiResponse } from '@/types'

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<any>>> {
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

    // Connect to database
    await connectDB()

    // Get recent orders with customer information
    const recentOrders = await Order.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'customer'
        }
      },
      {
        $unwind: '$customer'
      },
      {
        $project: {
          _id: 1,
          orderNumber: 1,
          total: 1,
          status: 1,
          createdAt: 1,
          customer: {
            name: { $concat: ['$customer.firstName', ' ', '$customer.lastName'] },
            email: '$customer.email'
          }
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $limit: 5
      }
    ])

    return NextResponse.json(
      {
        success: true,
        message: 'Recent orders fetched successfully',
        data: recentOrders,
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error fetching recent orders:', error)
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch recent orders',
        error: 'SERVER_ERROR',
      },
      { status: 500 }
    )
  }
} 