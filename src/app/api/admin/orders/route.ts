import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import connectDB from '@/lib/mongoose'
import { authOptions } from '@/lib/auth'
import { Order } from '@/models'
import { ApiResponse } from '@/types'

export async function GET(): Promise<NextResponse<ApiResponse<any>>> {
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

    // Get all orders with user and product information
    const orders = await Order.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $lookup: {
          from: 'products',
          localField: 'orderItems.product',
          foreignField: '_id',
          as: 'products'
        }
      },
      {
        $addFields: {
          orderItems: {
            $map: {
              input: '$orderItems',
              as: 'item',
              in: {
                $mergeObjects: [
                  '$$item',
                  {
                    product: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: '$products',
                            cond: { $eq: ['$$this._id', '$$item.product'] }
                          }
                        },
                        0
                      ]
                    }
                  }
                ]
              }
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          orderNumber: 1,
          total: 1,
          status: 1,
          shippingAddress: 1,
          createdAt: 1,
          updatedAt: 1,
          orderItems: {
            product: {
              _id: 1,
              name: 1,
              image: 1,
              price: 1
            },
            quantity: 1,
            price: 1
          },
          user: {
            _id: 1,
            firstName: 1,
            lastName: 1,
            email: 1
          }
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ])

    return NextResponse.json(
      {
        success: true,
        message: 'Orders fetched successfully',
        data: orders,
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