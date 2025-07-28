import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import connectDB from '@/lib/mongoose'
import { authOptions } from '@/lib/auth'
import { Product } from '@/models'
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

    // Get all products with admin-specific fields
    const products = await Product.find({})
      .select('_id name description price stock image images featured createdAt')
      .sort({ createdAt: -1 })
      .lean()

    console.log('Admin products API - Products fetched:', products.length)
    console.log('Sample product:', {
      id: products[0]?._id,
      name: products[0]?.name,
      image: products[0]?.image,
      images: products[0]?.images,
      hasImages: !!products[0]?.images,
      imageType: typeof products[0]?.image
    })
    
    // Log all products' image fields
    products.forEach((product, index) => {
      console.log(`Product ${index + 1}:`, {
        name: product.name,
        image: product.image,
        imageLength: product.image?.length,
        imageStartsWithHttp: product.image?.startsWith('http')
      })
    })

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