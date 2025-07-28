import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getStorageStats } from '@/lib/local-storage'

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

    // Get local storage stats
    const stats = await getStorageStats()

    return NextResponse.json({
      success: true,
      data: {
        totalFiles: stats.totalFiles,
        totalSize: stats.totalSize,
        bucketName: 'Local Storage',
        region: 'Local',
        cdnEnabled: false,
        cdnDomain: undefined,
        uploadDir: 'public/uploads',
        productImagesDir: 'public/images/products'
      }
    })

  } catch (error) {
    console.error('Error fetching local storage stats:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch local storage stats' },
      { status: 500 }
    )
  }
} 