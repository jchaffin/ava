import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3'

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || process.env.AWS_S3_BUCKET || 'adelas-bucket'
const CLOUDFRONT_DOMAIN = process.env.AWS_CLOUDFRONT_DOMAIN

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

    // List all objects
    const listCommand = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
    })

    const response = await s3Client.send(listCommand)
    const objects = response.Contents || []

    // Transform objects to file format
    const files = objects.map(obj => {
      const key = obj.Key || ''
      
      // Determine folder based on key structure
      let folder = 'other'
      if (key.includes('/products/')) {
        folder = 'products'
      } else if (key.includes('/uploads/')) {
        folder = 'uploads'
      } else if (key.includes('/images/')) {
        folder = 'images'
      } else if (key.includes('/public/')) {
        folder = 'public'
      } else if (key.includes('/')) {
        // If it has a path but doesn't match known folders, use the first directory
        folder = key.split('/')[0]
      } else {
        folder = 'root'
      }
      
      // Generate URLs
      const s3Url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`
      const cdnUrl = CLOUDFRONT_DOMAIN ? `https://${CLOUDFRONT_DOMAIN}/${key}` : undefined
      
      // Determine file type
      const extension = key.split('.').pop()?.toLowerCase() || ''
      let type = 'application/octet-stream'
      
      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
        type = `image/${extension === 'jpg' ? 'jpeg' : extension}`
      } else if (['mp4', 'avi', 'mov'].includes(extension)) {
        type = `video/${extension}`
      } else if (['mp3', 'wav', 'ogg'].includes(extension)) {
        type = `audio/${extension}`
      } else if (extension === 'pdf') {
        type = 'application/pdf'
      }

      return {
        key,
        size: obj.Size || 0,
        lastModified: obj.LastModified?.toISOString() || new Date().toISOString(),
        url: cdnUrl || s3Url,
        type,
        folder,
      }
    })

    return NextResponse.json({
      success: true,
      data: files
    })

  } catch (error) {
    console.error('Error fetching S3 files:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch S3 files' },
      { status: 500 }
    )
  }
} 