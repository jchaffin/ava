import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import connectDB from '@/lib/mongoose'
import { authOptions } from '@/lib/auth'
import { ApiResponse } from '@/types'

interface CheckWishlistResponse {
  isWishlisted: boolean
}

// GET /api/wishlist/check/[productId] - Check if product is in user's wishlist
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
): Promise<NextResponse<ApiResponse<CheckWishlistResponse>>> {
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

    const { productId } = await params

    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Product ID is required',
          error: 'MISSING_PRODUCT_ID',
        },
        { status: 400 }
      )
    }

    // Connect to database
    await connectDB()

    // In a real app, you would check the database to see if this product
    // is in the user's wishlist. For now, we'll use mock data.
    // This would typically involve querying a Wishlist collection/table
    // where you store user_id and product_id pairs.

    // Mock implementation - in a real app, this would be:
    // const wishlistItem = await Wishlist.findOne({ 
    //   userId: session.user.id, 
    //   productId: productId 
    // })
    // const isWishlisted = !!wishlistItem

    // For demo purposes, we'll randomly return true/false
    // In production, replace this with actual database query
    const isWishlisted = Math.random() > 0.5

    return NextResponse.json(
      {
        success: true,
        message: 'Wishlist status checked successfully',
        data: {
          isWishlisted,
        },
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error checking wishlist status:', error)
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to check wishlist status',
        error: 'SERVER_ERROR',
      },
      { status: 500 }
    )
  }
} 