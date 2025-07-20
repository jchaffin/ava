import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import connectDB from '@/lib/mongoose'
import { authOptions } from '@/lib/auth'
import { Product } from '@/models'
import { CreateProductInput, ApiResponse, IProduct, ProductFilters, ProductLeanResult } from '@/types'

interface ProductQueryParams {
  page?: string
  limit?: string
  featured?: string
  inStock?: string
  search?: string
  minPrice?: string
  maxPrice?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

interface ProductsResponse {
  products: ProductLeanResult[]
  pagination: {
    currentPage: number
    totalPages: number
    totalProducts: number
    hasNextPage: boolean
    hasPrevPage: boolean
    limit: number
  }
}

// GET /api/products - Fetch products with filtering, sorting, and pagination
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<ProductsResponse>>> {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const queryParams: ProductQueryParams = {
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '12',
      featured: searchParams.get('featured') || undefined,
      inStock: searchParams.get('inStock') || undefined,
      search: searchParams.get('search') || undefined,
      minPrice: searchParams.get('minPrice') || undefined,
      maxPrice: searchParams.get('maxPrice') || undefined,
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    }

    // Validate and sanitize parameters
    const page = Math.max(1, parseInt(queryParams.page || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(queryParams.limit || '10'))) // Max 50 products per page
    const skip = (page - 1) * limit

    // Connect to database
    await connectDB()

    // Build query filter
    const filter = buildProductFilter(queryParams)

    // Build sort object
    const sort = buildSortObject(queryParams.sortBy, queryParams.sortOrder)

    // Execute queries in parallel for better performance
    const [products, totalProducts] = await Promise.all([
      Product.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(), // Use lean() for better performance when we don't need Mongoose document methods
      Product.countDocuments(filter),
    ])

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalProducts / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    // Prepare response
    const response: ProductsResponse = {
      products: products as ProductLeanResult[],
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts,
        hasNextPage,
        hasPrevPage,
        limit,
      },
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Products fetched successfully',
        data: response,
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error fetching products:', error)
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch products',
        error: 'SERVER_ERROR',
      },
      { status: 500 }
    )
  }
}

// POST /api/products - Create new product (Admin only)
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<IProduct> | { success: false; message: string; error: string; data: { validationErrors: { field: string; message: string; }[] } }>> {
  try {
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

    // Parse request body
    const body: CreateProductInput = await request.json()

    // Validate required fields
    const validationErrors = validateProductData(body)
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

    // Check for duplicate product name
    const existingProduct = await Product.findOne({ 
      name: { $regex: new RegExp(`^${body.name}$`, 'i') } 
    })

    if (existingProduct) {
      return NextResponse.json(
        {
          success: false,
          message: 'Product with this name already exists',
          error: 'DUPLICATE_PRODUCT',
        },
        { status: 409 }
      )
    }

    // Create product data
    const productData: CreateProductInput = {
      name: body.name.trim(),
      description: body.description.trim(),
      price: parseFloat(body.price.toString()),
      image: body.image.trim(),
      stock: parseInt(body.stock.toString()),
      featured: body.featured || false,
    }

    // Create new product
    const newProduct = await Product.create(productData)

    // Log product creation
    console.log(`New product created: ${newProduct.name} by admin: ${session.user.email}`)

    // Send notification (in a real app)
    // await notifyProductAdded(newProduct)

    return NextResponse.json(
      {
        success: true,
        message: 'Product created successfully',
        data: newProduct,
      },
      { status: 201 }
    )

  } catch (error: any) {
    console.error('Error creating product:', error)

    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors || {}).map((err: any) => ({
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

    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0]
      return NextResponse.json(
        {
          success: false,
          message: `${field} already exists`,
          error: 'DUPLICATE_FIELD',
        },
        { status: 409 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create product',
        error: 'SERVER_ERROR',
      },
      { status: 500 }
    )
  }
}

// Helper function to build MongoDB filter from query parameters
function buildProductFilter(params: ProductQueryParams): Record<string, any> {
  const filter: Record<string, any> = {}



  // Featured filter
  if (params.featured === 'true') {
    filter.featured = true
  }

  // Stock filter
  if (params.inStock === 'true') {
    filter.stock = { $gt: 0 }
  }

  // Price range filter
  if (params.minPrice || params.maxPrice) {
    filter.price = {}
    if (params.minPrice) {
      const minPrice = parseFloat(params.minPrice)
      if (!isNaN(minPrice) && minPrice >= 0) {
        filter.price.$gte = minPrice
      }
    }
    if (params.maxPrice) {
      const maxPrice = parseFloat(params.maxPrice)
      if (!isNaN(maxPrice) && maxPrice > 0) {
        filter.price.$lte = maxPrice
      }
    }
  }

  // Search filter
  if (params.search) {
    const searchRegex = new RegExp(params.search, 'i')
    filter.$or = [
      { name: searchRegex },
      { description: searchRegex },
    ]
  }

  return filter
}

// Helper function to build MongoDB sort object
function buildSortObject(sortBy: string = 'createdAt', sortOrder: 'asc' | 'desc' = 'desc'): Record<string, 1 | -1> {
  const allowedSortFields = ['name', 'price', 'createdAt', 'updatedAt', 'stock', 'featured']
  
  // Validate sort field
  if (!allowedSortFields.includes(sortBy)) {
    sortBy = 'createdAt'
  }

  const sortDirection = sortOrder === 'asc' ? 1 : -1

  // Special handling for featured products
  if (sortBy === 'featured') {
    return { featured: -1, createdAt: -1 } // Featured first, then by creation date
  }

  return { [sortBy]: sortDirection }
}

// Validation helper function
function validateProductData(data: CreateProductInput): Array<{ field: string; message: string }> {
  const errors: Array<{ field: string; message: string }> = []

  // Name validation
  if (!data.name || typeof data.name !== 'string') {
    errors.push({ field: 'name', message: 'Product name is required' })
  } else if (data.name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Product name must be at least 2 characters long' })
  } else if (data.name.trim().length > 100) {
    errors.push({ field: 'name', message: 'Product name cannot exceed 100 characters' })
  }

  // Description validation
  if (!data.description || typeof data.description !== 'string') {
    errors.push({ field: 'description', message: 'Product description is required' })
  } else if (data.description.trim().length < 10) {
    errors.push({ field: 'description', message: 'Description must be at least 10 characters long' })
  } else if (data.description.trim().length > 2000) {
    errors.push({ field: 'description', message: 'Description cannot exceed 2000 characters' })
  }

  // Price validation
  if (data.price === undefined || data.price === null) {
    errors.push({ field: 'price', message: 'Product price is required' })
  } else {
    const price = parseFloat(data.price.toString())
    if (isNaN(price)) {
      errors.push({ field: 'price', message: 'Price must be a valid number' })
    } else if (price < 0) {
      errors.push({ field: 'price', message: 'Price cannot be negative' })
    } else if (price > 999999.99) {
      errors.push({ field: 'price', message: 'Price cannot exceed $999,999.99' })
    }
  }

  // Image validation
  if (!data.image || typeof data.image !== 'string') {
    errors.push({ field: 'image', message: 'Product image URL is required' })
  } else if (!isValidUrl(data.image)) {
    errors.push({ field: 'image', message: 'Please provide a valid image URL' })
  }



  // Stock validation
  if (data.stock === undefined || data.stock === null) {
    errors.push({ field: 'stock', message: 'Stock quantity is required' })
  } else {
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

// Advanced search functionality
export async function searchProducts(searchTerm: string, filters?: ProductFilters): Promise<IProduct[]> {
  await connectDB()

  const searchRegex = new RegExp(searchTerm, 'i')
  
  const baseFilter: Record<string, any> = {
    $or: [
      { name: searchRegex },
      { description: searchRegex },
    ]
  }

  if (filters?.featured) {
    baseFilter.featured = true
  }

  const products = await Product.find(baseFilter)
    .sort({ 
      createdAt: -1 
    })
    .limit(filters?.limit || 20)
    .lean()

  return products as IProduct[]
}

// Bulk operations for admin
export async function bulkUpdateProducts(updates: Array<{ id: string; updates: Partial<IProduct> }>): Promise<boolean> {
  try {
    await connectDB()

    const bulkOps = updates.map(({ id, updates }) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: updates },
      },
    }))

    const result = await Product.bulkWrite(bulkOps)
    return result.modifiedCount === updates.length

  } catch (error) {
    console.error('Bulk update error:', error)
    return false
  }
}

// Product analytics helper
export async function getProductAnalytics(): Promise<{
  totalProducts: number
  outOfStockProducts: number
  lowStockProducts: number
  averagePrice: number
}> {
  await connectDB()

  const [
    totalProducts,
    outOfStockProducts,
    lowStockProducts,
    priceStats,
  ] = await Promise.all([
    Product.countDocuments(),
    Product.countDocuments({ stock: 0 }),
    Product.countDocuments({ stock: { $lte: 5, $gt: 0 } }),
    Product.aggregate([
      { $group: { _id: null, averagePrice: { $avg: '$price' } } }
    ]),
  ])

  return {
    totalProducts,
    outOfStockProducts,
    lowStockProducts,
    averagePrice: priceStats[0]?.averagePrice || 0,
  }
}

// Input sanitization helper
function sanitizeProductInput(input: CreateProductInput): CreateProductInput {
  return {
    name: input.name?.toString().trim().slice(0, 100) || '',
    description: input.description?.toString().trim().slice(0, 2000) || '',
    price: Math.max(0, Math.min(999999.99, parseFloat(input.price?.toString() || '0'))),
    image: input.image?.toString().trim() || '',
    stock: Math.max(0, Math.min(999999, parseInt(input.stock?.toString() || '0'))),
    featured: Boolean(input.featured),
  }
}

// Rate limiting helper for product creation
const createProductAttempts = new Map<string, { count: number; lastAttempt: number }>()

function checkCreateProductRateLimit(ip: string): boolean {
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute
  const maxAttempts = 10 // Max 10 product creations per minute

  const attempts = createProductAttempts.get(ip)
  
  if (!attempts) {
    createProductAttempts.set(ip, { count: 1, lastAttempt: now })
    return true
  }

  // Reset if window has passed
  if (now - attempts.lastAttempt > windowMs) {
    createProductAttempts.set(ip, { count: 1, lastAttempt: now })
    return true
  }

  // Check if limit exceeded
  if (attempts.count >= maxAttempts) {
    return false
  }

  // Increment attempts
  attempts.count += 1
  attempts.lastAttempt = now
  createProductAttempts.set(ip, attempts)

  return true
}
