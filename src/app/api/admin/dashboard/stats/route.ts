import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import connectDB from '@/lib/mongoose'
import { authOptions } from '@/lib/auth'
import { Order, Product, User } from '@/models'
import { ApiResponse } from '@/types'

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<any>>> {
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

    // Get period from query params
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month'

    // Connect to database
    await connectDB()

    // Calculate date range based on period
    const now = new Date()
    let startDate: Date
    let previousStartDate: Date

    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        previousStartDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000)
        break
      case 'week':
        const dayOfWeek = now.getDay()
        const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1
        startDate = new Date(now.getTime() - daysToSubtract * 24 * 60 * 60 * 1000)
        startDate.setHours(0, 0, 0, 0)
        previousStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        previousStartDate = new Date(now.getFullYear() - 1, 0, 1)
        break
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    }

    // Get current period stats
    const [currentOrders, currentProducts, currentUsers] = await Promise.all([
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: null,
            totalSales: { $sum: '$total' },
            totalOrders: { $sum: 1 },
            averageOrderValue: { $avg: '$total' }
          }
        }
      ]),
      Product.countDocuments(),
      User.countDocuments({ role: 'user' })
    ])

    // Get previous period stats for growth calculation
    const [previousOrders] = await Promise.all([
      Order.aggregate([
        { $match: { createdAt: { $gte: previousStartDate, $lt: startDate } } },
        {
          $group: {
            _id: null,
            totalSales: { $sum: '$total' },
            totalOrders: { $sum: 1 }
          }
        }
      ])
    ])

    // Calculate stats
    const currentStats = currentOrders[0] || { totalSales: 0, totalOrders: 0, averageOrderValue: 0 }
    const previousStats = previousOrders[0] || { totalSales: 0, totalOrders: 0 }

    // Calculate growth percentages
    const salesGrowth = previousStats.totalSales > 0 
      ? ((currentStats.totalSales - previousStats.totalSales) / previousStats.totalSales) * 100
      : 0

    const ordersGrowth = previousStats.totalOrders > 0
      ? ((currentStats.totalOrders - previousStats.totalOrders) / previousStats.totalOrders) * 100
      : 0

    // Mock customer growth (in a real app, you'd track this properly)
    const customersGrowth = 5.2 // Mock value

    const stats = {
      totalSales: currentStats.totalSales,
      totalOrders: currentStats.totalOrders,
      totalProducts: currentProducts,
      totalCustomers: currentUsers,
      averageOrderValue: currentStats.averageOrderValue,
      conversionRate: 2.8, // Mock conversion rate
      growth: {
        sales: Math.round(salesGrowth * 100) / 100,
        orders: Math.round(ordersGrowth * 100) / 100,
        customers: customersGrowth
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Dashboard stats fetched successfully',
        data: stats,
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch dashboard stats',
        error: 'SERVER_ERROR',
      },
      { status: 500 }
    )
  }
} 