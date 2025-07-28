import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      )
    }

    // Return local storage configuration
    return NextResponse.json({
      success: true,
      data: {
        bucketName: 'Local Storage',
        region: 'Local',
        cdnDomain: undefined,
        bucketConfigured: true,
        accessKeyConfigured: true,
        secretKeyConfigured: true,
        uploadDir: 'public/uploads',
        productImagesDir: 'public/images/products'
      }
    })

  } catch (error) {
    console.error('Error fetching local storage config:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch local storage config' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      )
    }

    // For local storage, we don't need to save any configuration
    // Just return success
    return NextResponse.json({
      success: true,
      message: 'Local storage configuration updated successfully'
    })

  } catch (error) {
    console.error('Error updating local storage config:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update local storage config' },
      { status: 500 }
    )
  }
} 