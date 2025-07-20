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

    // Get all products with admin-specific fields
    const products = await Product.find({})
      .select('_id name description price stock image featured createdAt')
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json(
      {
        success: true,
        message: 'Products fetched successfully',
        data: products,
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error fetching products:', error)
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch products',
        error: 'SERVER_ERROR',
      },
      { status: 500 }
    )
  }
} 