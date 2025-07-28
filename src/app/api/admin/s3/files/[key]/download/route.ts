import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params
  
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

    // Decode the key (it was URL encoded)
    const decodedKey = decodeURIComponent(key)

    // Get object from S3
    const getCommand = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: decodedKey,
    })

    const response = await s3Client.send(getCommand)
    
    if (!response.Body) {
      return NextResponse.json(
        { success: false, message: 'File not found' },
        { status: 404 }
      )
    }

    // Convert stream to buffer
    const chunks: Uint8Array[] = []
    const reader = response.Body.transformToWebStream().getReader()
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
    }
    
    const buffer = Buffer.concat(chunks)

    // Get filename from key
    const filename = decodedKey.split('/').pop() || 'download'

    // Return file as response
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': response.ContentType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': response.ContentLength?.toString() || buffer.length.toString(),
      },
    })

  } catch (error) {
    console.error('Error downloading file:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to download file' },
      { status: 500 }
    )
  }
} 