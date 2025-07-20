import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import connectDB from '@/lib/mongoose'
import { authOptions } from '@/lib/auth'
import { Product, Order } from '@/models'
import { ApiResponse, IProduct, CreateProductInput, ProductAnalytics } from '@/types'
import { isValidObjectId } from 'mongoose'

interface RouteParams {
  params: {
    id: string
  }
}

interface ProductUpdateData extends Partial<CreateProductInput> {
  // Additional fields that might be updated
}

// GET /api/products/[id] - Get single product
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<IProduct & { analytics?: ProductAnalytics }>>> {
  try {
    const { id } = params

    // Validate MongoDB ObjectId
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid product ID format',
          error: 'INVALID_ID',
        },
        { status: 400 }
      )
    }

    // Connect to database
    await connectDB()

    // Find product by ID
    const product = await Product.findById(id).lean()

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: 'Product not found',
          error: 'PRODUCT_NOT_FOUND',
        },
        { status: 404 }
      )
    }

    // Get optional analytics data if requested
    const includeAnalytics = request.nextUrl.searchParams.get('includeAnalytics') === 'true'
    let analytics: ProductAnalytics | undefined

    if (includeAnalytics) {
      analytics = await getProductAnalytics(id)
    }

    // Track product view (in a real app, you might want to do this asynchronously)
    await trackProductView(id, request)

    // Prepare response
    const responseData = analytics 
      ? { ...product, analytics }
      : product

    return NextResponse.json(
      {
        success: true,
        message: 'Product fetched successfully',
        data: responseData as IProduct & { analytics?: ProductAnalytics },
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error fetching product:', error)
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch product',
        error: 'SERVER_ERROR',
      },
      { status: 500 }
    )
  }
}

// PUT /api/products/[id] - Update product (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<IProduct> | ApiResponse<{ validationErrors: { field: string; message: string }[] }>>> {
  try {
    const { id } = params

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

    // Validate MongoDB ObjectId
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid product ID format',
          error: 'INVALID_ID',
        },
        { status: 400 }
      )
    }

    // Parse request body
    const body: ProductUpdateData = await request.json()

    // Validate update data
    const validationErrors = validateProductUpdateData(body)
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          error: 'VALIDATION_ERROR',
          data: { validationErrors },
        },
        { status: 400 }
      )
    }

    // Connect to database
    await connectDB()

    // Check if product exists
    const existingProduct = await Product.findById(id)
    if (!existingProduct) {
      return NextResponse.json(
        {
          success: false,
          message: 'Product not found',
          error: 'PRODUCT_NOT_FOUND',
        },
        { status: 404 }
      )
    }

    // Check for duplicate name if name is being updated
    if (body.name && body.name !== existingProduct.name) {
      const duplicateProduct = await Product.findOne({
        name: { $regex: new RegExp(`^${body.name}$`, 'i') },
        _id: { $ne: id }
      })

      if (duplicateProduct) {
        return NextResponse.json(
          {
            success: false,
            message: 'Product with this name already exists',
            error: 'DUPLICATE_PRODUCT_NAME',
          },
          { status: 409 }
        )
      }
    }

    // Prepare update data
    const updateData: Partial<IProduct> = {}
    
    if (body.name !== undefined) updateData.name = body.name.trim()
    if (body.description !== undefined) updateData.description = body.description.trim()
    if (body.price !== undefined) updateData.price = parseFloat(body.price.toString())
    if (body.image !== undefined) updateData.image = body.image.trim()
    if (body.stock !== undefined) updateData.stock = parseInt(body.stock.toString())
    if (body.featured !== undefined) updateData.featured = Boolean(body.featured)

    // Track stock changes for notifications
    const stockChanged = body.stock !== undefined && body.stock !== existingProduct.stock
    const stockIncreased = stockChanged && body.stock! > existingProduct.stock
    const stockDecreased = stockChanged && body.stock! < existingProduct.stock

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: updateData },
      { 
        new: true, // Return updated document
        runValidators: true // Run mongoose validation
      }
    )

    // Log product update
    console.log(`Product updated: ${updatedProduct.name} by admin: ${session.user.email}`)

    // Handle stock change notifications
    if (stockChanged) {
      await handleStockChangeNotifications(updatedProduct, {
        increased: stockIncreased,
        decreased: stockDecreased,
        previousStock: existingProduct.stock,
        newStock: updatedProduct.stock,
      })
    }

    // Send update notifications (in a real app)
    // await notifyProductUpdated(updatedProduct, updateData)

    return NextResponse.json(
      {
        success: true,
        message: 'Product updated successfully',
        data: updatedProduct,
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error updating product:', error)

    // Handle MongoDB validation errors
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ValidationError') {
      const validationErrors = Object.values((error as any).errors).map((err: any) => ({
        field: err.path,
        message: err.message,
      }))

      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          error: 'VALIDATION_ERROR',
          data: { validationErrors },
        },
        { status: 400 }
      )
    }

    // Handle MongoDB cast errors (invalid ObjectId, etc.)
    if (error && typeof error === 'object' && 'name' in error && error.name === 'CastError') {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid data format',
          error: 'INVALID_DATA',
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update product',
        error: 'SERVER_ERROR',
      },
      { status: 500 }
    )
  }
}

// DELETE /api/products/[id] - Delete product (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<{ deletedProductId: string }>>> {
  try {
    const { id } = params

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

    // Validate MongoDB ObjectId
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid product ID format',
          error: 'INVALID_ID',
        },
        { status: 400 }
      )
    }

    // Connect to database
    await connectDB()

    // Check if product exists
    const existingProduct = await Product.findById(id)
    if (!existingProduct) {
      return NextResponse.json(
        {
          success: false,
          message: 'Product not found',
          error: 'PRODUCT_NOT_FOUND',
        },
        { status: 404 }
      )
    }

    // Check if product is referenced in any orders
    const ordersWithProduct = await Order.countDocuments({
      'orderItems.product': id
    })

    if (ordersWithProduct > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Cannot delete product that has been ordered. Consider marking it as unavailable instead.',
          error: 'PRODUCT_HAS_ORDERS',
        },
        { status: 409 }
      )
    }

    // Get force delete parameter
    const forceDelete = request.nextUrl.searchParams.get('force') === 'true'

    if (!forceDelete && ordersWithProduct > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Product has existing orders. Use force=true to delete anyway.',
          error: 'PRODUCT_HAS_ORDERS',
        },
        { status: 409 }
      )
    }

    // Delete the product
    await Product.findByIdAndDelete(id)

    // Log product deletion
    console.log(`Product deleted: ${existingProduct.name} by admin: ${session.user.email}`)

    // Clean up related data (reviews, analytics, etc.)
    await cleanupProductData(id)

    // Send deletion notifications (in a real app)
    // await notifyProductDeleted(existingProduct)

    return NextResponse.json(
      {
        success: true,
        message: 'Product deleted successfully',
        data: { deletedProductId: id },
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error deleting product:', error)
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete product',
        error: 'SERVER_ERROR',
      },
      { status: 500 }
    )
  }
}

// Validation helper for product updates
function validateProductUpdateData(data: ProductUpdateData): Array<{ field: string; message: string }> {
  const errors: Array<{ field: string; message: string }> = []

  // Name validation (if provided)
  if (data.name !== undefined) {
    if (typeof data.name !== 'string') {
      errors.push({ field: 'name', message: 'Product name must be a string' })
    } else if (data.name.trim().length < 2) {
      errors.push({ field: 'name', message: 'Product name must be at least 2 characters long' })
    } else if (data.name.trim().length > 100) {
      errors.push({ field: 'name', message: 'Product name cannot exceed 100 characters' })
    }
  }

  // Description validation (if provided)
  if (data.description !== undefined) {
    if (typeof data.description !== 'string') {
      errors.push({ field: 'description', message: 'Description must be a string' })
    } else if (data.description.trim().length < 10) {
      errors.push({ field: 'description', message: 'Description must be at least 10 characters long' })
    } else if (data.description.trim().length > 2000) {
      errors.push({ field: 'description', message: 'Description cannot exceed 2000 characters' })
    }
  }

  // Price validation (if provided)
  if (data.price !== undefined) {
    const price = parseFloat(data.price.toString())
    if (isNaN(price)) {
      errors.push({ field: 'price', message: 'Price must be a valid number' })
    } else if (price < 0) {
      errors.push({ field: 'price', message: 'Price cannot be negative' })
    } else if (price > 999999.99) {
      errors.push({ field: 'price', message: 'Price cannot exceed $999,999.99' })
    }
  }

  // Image validation (if provided)
  if (data.image !== undefined) {
    if (typeof data.image !== 'string') {
      errors.push({ field: 'image', message: 'Image URL must be a string' })
    } else if (!isValidUrl(data.image)) {
      errors.push({ field: 'image', message: 'Please provide a valid image URL' })
    }
  }



  // Stock validation (if provided)
  if (data.stock !== undefined) {
    const stock = parseInt(data.stock.toString())
    if (isNaN(stock)) {
      errors.push({ field: 'stock', message: 'Stock must be a valid number' })
    } else if (stock < 0) {
      errors.push({ field: 'stock', message: 'Stock cannot be negative' })
    } else if (stock > 999999) {
      errors.push({ field: 'stock', message: 'Stock cannot exceed 999,999 units' })
    }
  }

  return errors
}

// Helper function to validate URLs
function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

// Get product analytics
async function getProductAnalytics(productId: string): Promise<ProductAnalytics> {
  try {
    // Get order statistics for this product
    const orderStats = await Order.aggregate([
      { $unwind: '$orderItems' },
      { $match: { 'orderItems.product': productId } },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$orderItems.quantity' },
          totalRevenue: { $sum: { $multiply: ['$orderItems.quantity', '$orderItems.price'] } },
          lastOrderDate: { $max: '$createdAt' },
        }
      }
    ])

    // In a real app, you would also get:
    // - Review statistics from a reviews collection
    // - View count from an analytics collection
    // - Average rating from reviews

    const stats = orderStats[0] || {
      totalSales: 0,
      totalRevenue: 0,
      lastOrderDate: null,
    }

    return {
      views: 0, // Would come from analytics tracking
      sales: stats.totalSales,
      revenue: stats.totalRevenue,
      conversionRate: 0, // Would be calculated
      averageRating: 0, // Would come from reviews
      reviewCount: 0, // Would come from reviews
      wishlistCount: 0, // Would come from wishlist data
      returnRate: 0, // Would come from returns data
    }

  } catch (error) {
    console.error('Error getting product analytics:', error)
    return {
      views: 0,
      sales: 0,
      revenue: 0,
      conversionRate: 0,
      averageRating: 0,
      reviewCount: 0,
      wishlistCount: 0,
      returnRate: 0,
    }
  }
}

// Track product view
async function trackProductView(productId: string, request: NextRequest): Promise<void> {
  try {
    // In a real app, you would track this in an analytics collection
    // Get user IP, user agent, etc. for analytics
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    
    // Log view (in production, you'd store this in a database)
    console.log(`Product ${productId} viewed by IP: ${ip}`)
    
    // You could also update a view counter on the product itself
    // await Product.findByIdAndUpdate(productId, { $inc: { viewCount: 1 } })

  } catch (error) {
    console.error('Error tracking product view:', error)
    // Don't fail the request if analytics tracking fails
  }
}

// Handle stock change notifications
async function handleStockChangeNotifications(
  product: IProduct,
  changes: {
    increased: boolean
    decreased: boolean
    previousStock: number
    newStock: number
  }
): Promise<void> {
  try {
    // Notify about low stock
    if (changes.newStock <= 5 && changes.newStock > 0) {
      console.log(`Low stock alert: ${product.name} has ${changes.newStock} units remaining`)
      // await sendLowStockAlert(product)
    }

    // Notify about out of stock
    if (changes.newStock === 0 && changes.previousStock > 0) {
      console.log(`Out of stock alert: ${product.name} is now out of stock`)
      // await sendOutOfStockAlert(product)
    }

    // Notify about back in stock
    if (changes.newStock > 0 && changes.previousStock === 0) {
      console.log(`Back in stock: ${product.name} is now available`)
      // await sendBackInStockAlert(product)
    }

    // Notify about significant stock increase (restocking)
    if (changes.increased && changes.newStock - changes.previousStock >= 50) {
      console.log(`Stock replenished: ${product.name} restocked with ${changes.newStock - changes.previousStock} units`)
      // await sendRestockAlert(product)
    }

  } catch (error) {
    console.error('Error handling stock change notifications:', error)
  }
}

// Clean up related product data when deleting
async function cleanupProductData(productId: string): Promise<void> {
  try {
    // In a real app, you would clean up:
    // - Product reviews
    // - Analytics data
    // - Wishlist entries
    // - Cart items
    // - Image files
    
    console.log(`Cleaning up data for deleted product: ${productId}`)

    // Example cleanup operations:
    // await Review.deleteMany({ product: productId })
    // await Analytics.deleteMany({ productId })
    // await Wishlist.updateMany({}, { $pull: { products: productId } })

  } catch (error) {
    console.error('Error cleaning up product data:', error)
    // Log error but don't fail the deletion
  }
}

// Soft delete alternative (mark as deleted instead of removing)
export async function softDeleteProduct(productId: string): Promise<boolean> {
  try {
    await connectDB()
    
    const result = await Product.findByIdAndUpdate(
      productId,
      { 
        $set: { 
          isDeleted: true,
          deletedAt: new Date(),
          stock: 0 // Ensure it's not available for purchase
        }
      },
      { new: true }
    )

    return !!result

  } catch (error) {
    console.error('Error soft deleting product:', error)
    return false
  }
}
