import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')
const PRODUCT_IMAGES_DIR = path.join(process.cwd(), 'public', 'images', 'products')

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

    // Decode the key from URL
    const decodedKey = decodeURIComponent(key)

    // Determine file path based on key
    let filePath: string
    
    if (decodedKey.startsWith('products/')) {
      // Product images
      const parts = decodedKey.split('/')
      const productId = parts[1]
      const filename = parts[2]
      filePath = path.join(PRODUCT_IMAGES_DIR, productId, filename)
    } else {
      // Other uploads
      filePath = path.join(UPLOAD_DIR, decodedKey)
    }

    // Check if file exists
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { success: false, message: 'File not found' },
        { status: 404 }
      )
    }

    // Read file
    const fileBuffer = await readFile(filePath)
    const filename = path.basename(filePath)

    // Return file as response
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Type': 'application/octet-stream',
      },
    })

  } catch (error) {
    console.error('Error downloading local file:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to download file' },
      { status: 500 }
    )
  }
} 