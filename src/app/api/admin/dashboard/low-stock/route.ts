import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import connectDB from '@/lib/mongoose'
import { authOptions } from '@/lib/auth'
import { Product } from '@/models'
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

    // Get products with low stock (5 or fewer items)
    const lowStockProducts = await Product.find({
      stock: { $lte: 5, $gt: 0 } // Between 1 and 5 items
    })
    .select('_id name stock price image')
    .sort({ stock: 1 })
    .limit(5)
    .lean()

    return NextResponse.json(
      {
        success: true,
        message: 'Low stock products fetched successfully',
        data: lowStockProducts,
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error fetching low stock products:', error)
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch low stock products',
        error: 'SERVER_ERROR',
      },
      { status: 500 }
    )
  }
} 