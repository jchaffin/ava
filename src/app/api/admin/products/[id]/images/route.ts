import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import connectDB from '@/lib/mongoose'
import { authOptions } from '@/lib/auth'
import { Product } from '@/models'
import { uploadToLocal, deleteFromLocal } from '@/lib/local-storage'
import { extractKeyFromLocalUrl, localKeyToUrl } from '@/lib/local-storage-client'
import { isValidObjectId } from 'mongoose'

// POST /api/admin/products/[id]/images - Upload new product image
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
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

    // Validate product ID
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid product ID' },
        { status: 400 }
      )
    }

    // Connect to database
    await connectDB()

    // Check if product exists
    const product = await Product.findById(id)
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      )
    }

    // Parse form data
    const formData = await request.formData()
    const imageFile = formData.get('image') as File
    const imageIndex = formData.get('imageIndex') as string

    if (!imageFile) {
      return NextResponse.json(
        { success: false, message: 'No image file provided' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await imageFile.arrayBuffer()
    const buffer = Buffer.from(bytes)

    console.log('Uploading image:', {
      productId: id,
      imageIndex: imageIndex,
      fileName: imageFile.name,
      fileSize: imageFile.size,
      fileType: imageFile.type
    })

    // Upload to local storage with proper key structure
    // Use the imageIndex as the filename to match the display position (1-based)
    const displayPosition = imageIndex === '0' || imageIndex === 'main' ? 'main' : (parseInt(imageIndex) + 1).toString()
    const fileName = `${displayPosition}.jpg`
    const uploadResult = await uploadToLocal(buffer, {
      folder: 'products',
      fileName: fileName,
      contentType: imageFile.type || 'image/jpeg',
      productId: id
    })

    console.log('Local storage upload result:', uploadResult)

    // Store the local storage key in the database (not the full URL)
    const imageKey = uploadResult.key
    
    if (!imageIndex || imageIndex === '0' || imageIndex === 'main') {
      // Update the main product image
      await Product.findByIdAndUpdate(id, { image: imageKey })
      console.log('Updated main product image:', imageKey)
    } else {
      // Update the specific image in the images array
      const imageIndexNum = parseInt(imageIndex)
      
      // Get current product to see if images array exists
      const currentProduct = await Product.findById(id)
      let currentImages = currentProduct.images || []
      
      // Ensure the images array is long enough (0-based indexing)
      while (currentImages.length <= imageIndexNum) {
        currentImages.push('')
      }
      
      // Update the specific index (0-based)
      currentImages[imageIndexNum] = imageKey
      
      // Save the updated images array
      await Product.findByIdAndUpdate(id, { images: currentImages })
      console.log('Updated image in array:', { index: imageIndexNum, key: imageKey, totalImages: currentImages.length })
    }

    return NextResponse.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        imageUrl: uploadResult.url, // Return the URL for immediate display
        key: uploadResult.key // Return the local storage key for database storage
      }
    })

  } catch (error) {
    console.error('Error uploading product image:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to upload image' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/products/[id]/images - Update product image configuration
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
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

    // Validate product ID
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid product ID' },
        { status: 400 }
      )
    }

    // Connect to database
    await connectDB()

    // Check if product exists
    const product = await Product.findById(id)
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { images } = body

    if (images && Array.isArray(images)) {
      // Clean and validate the images array
      const cleanImages = images
        .filter(img => img && typeof img === 'string')
        .map(img => {
          // If it's a full URL, extract the key
          if (img.includes('/images/products/') || img.includes('/uploads/')) {
            const key = extractKeyFromLocalUrl(img)
            return key || img
          }
          // If it's already a key, return it
          return img
        })
        .filter(img => img.trim() !== '')

      console.log('Saving images to database:', cleanImages)
      
      // Update all images configuration - store local storage keys, not URLs
      await Product.findByIdAndUpdate(id, { images: cleanImages })
      
      return NextResponse.json({
        success: true,
        message: 'Images configuration updated successfully'
      })
    }

    return NextResponse.json(
      { success: false, message: 'Invalid request data' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error updating product images:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update images' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/products/[id]/images - Delete product images
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
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

    // Validate product ID
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid product ID' },
        { status: 400 }
      )
    }

    // Connect to database
    await connectDB()

    // Check if product exists
    const product = await Product.findById(id)
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      )
    }

    // Get image key from URL if provided
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('imageUrl')
    
    if (imageUrl) {
      const key = extractKeyFromLocalUrl(imageUrl)
      if (key) {
        await deleteFromLocal(key)
      }
    } else {
      // Delete all product images
      for (let i = 1; i <= 4; i++) {
        const key = `products/${id}/${i}.jpg`
        try {
          await deleteFromLocal(key)
        } catch (error) {
          // Ignore errors if file doesn't exist
          console.log(`Image ${key} not found, skipping deletion`)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Images deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting product images:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete images' },
      { status: 500 }
    )
  }
} 