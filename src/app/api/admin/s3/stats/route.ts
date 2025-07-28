import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { S3Client, ListObjectsV2Command, HeadBucketCommand } from '@aws-sdk/client-s3'

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || process.env.AWS_S3_BUCKET || 'adelas-bucket'

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

    // Check if bucket exists and is accessible
    try {
      await s3Client.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }))
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'S3 bucket not accessible. Please check your configuration.' },
        { status: 500 }
      )
    }

    // List all objects to get stats
    const listCommand = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
    })

    const response = await s3Client.send(listCommand)
    const objects = response.Contents || []

    // Calculate stats
    const totalFiles = objects.length
    const totalSize = objects.reduce((acc, obj) => acc + (obj.Size || 0), 0)
    
    // Format total size
    const formatFileSize = (bytes: number) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const stats = {
      totalFiles,
      totalSize: formatFileSize(totalSize),
      bucketName: BUCKET_NAME,
      region: process.env.AWS_REGION || 'us-east-1',
      cdnEnabled: !!process.env.AWS_CLOUDFRONT_DOMAIN,
      cdnDomain: process.env.AWS_CLOUDFRONT_DOMAIN,
    }

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('Error fetching S3 stats:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch S3 stats' },
      { status: 500 }
    )
  }
} 