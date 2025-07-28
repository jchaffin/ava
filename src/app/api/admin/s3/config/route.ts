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

    // Return actual configuration values
    const config = {
      bucketName: process.env.AWS_S3_BUCKET_NAME || process.env.AWS_S3_BUCKET || 'adelas-bucket',
      region: process.env.AWS_REGION || 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      cdnDomain: process.env.AWS_CLOUDFRONT_DOMAIN || '',
      bucketConfigured: !!(process.env.AWS_S3_BUCKET_NAME || process.env.AWS_S3_BUCKET),
      accessKeyConfigured: !!process.env.AWS_ACCESS_KEY_ID,
      secretKeyConfigured: !!process.env.AWS_SECRET_ACCESS_KEY,
    }

    return NextResponse.json({
      success: true,
      data: config
    })

  } catch (error) {
    console.error('Error fetching S3 config:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch S3 configuration' },
      { status: 500 }
    )
  }
} 