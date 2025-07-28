import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { listFiles } from '@/lib/local-storage'

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

    // Get folder from query params
    const url = new URL(request.url)
    const { searchParams } = url
    const folder = searchParams.get('folder') || ''

    // List local files
    const files = await listFiles(folder)

    return NextResponse.json({
      success: true,
      data: files
    })

  } catch (error) {
    console.error('Error listing local files:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to list local files' },
      { status: 500 }
    )
  }
} 