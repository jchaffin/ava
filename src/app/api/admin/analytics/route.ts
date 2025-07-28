import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import connectDB from '@/lib/mongoose'
import { authOptions } from '@/lib/auth'
import { Order, User } from '@/models'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role
    if (session.user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 })
    }

    await connectDB()

    // Get period from query params
    const { searchParams } = request.nextUrl
    const period = searchParams.get('period') || '30d'

    // Calculate date range
    const now = new Date()
    let startDate: Date
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    // Fetch analytics data
    const [
      totalRevenue,
      totalOrders,
      totalCustomers,
      topProducts,
      orderStatusCounts,
      customerSegments
    ] = await Promise.all([
      // Total revenue
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),

      // Total orders
      Order.countDocuments({ createdAt: { $gte: startDate } }),

      // Total customers
      User.countDocuments({ role: 'user' }),

      // Top products
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $unwind: '$orderItems' },
        {
          $group: {
            _id: '$orderItems.product',
            sales: { $sum: '$orderItems.quantity' },
            revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } }
          }
        },
        { $sort: { revenue: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: '$product' },
        {
          $project: {
            _id: '$product._id',
            name: '$product.name',
            image: '$product.image',
            sales: 1,
            revenue: 1
          }
        }
      ]),

      // Order status counts
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]),

      // Customer segments (simplified - could be enhanced with more sophisticated segmentation)
      User.aggregate([
        { $match: { role: 'user' } },
        {
          $lookup: {
            from: 'orders',
            localField: '_id',
            foreignField: 'user',
            as: 'orders'
          }
        },
        {
          $addFields: {
            totalSpent: { $sum: '$orders.total' },
            orderCount: { $size: '$orders' }
          }
        },
        {
          $group: {
            _id: {
              $cond: {
                if: { $gte: ['$totalSpent', 1000] },
                then: 'High Value',
                else: {
                  $cond: {
                    if: { $gte: ['$totalSpent', 500] },
                    then: 'Medium Value',
                    else: 'Low Value'
                  }
                }
              }
            },
            count: { $sum: 1 },
            revenue: { $sum: '$totalSpent' }
          }
        },
        { $sort: { revenue: -1 } }
      ])
    ])

    // Calculate average order value
    const avgOrderValue = totalOrders > 0 ? (totalRevenue[0]?.total || 0) / totalOrders : 0

    // Calculate conversion rate (simplified - could be enhanced with actual conversion tracking)
    const conversionRate = 2.5 // Placeholder - would need actual conversion tracking

    // Format order status data
    const orderStatus = orderStatusCounts.map(status => ({
      status: status._id,
      count: status.count,
      percentage: totalOrders > 0 ? Math.round((status.count / totalOrders) * 100) : 0
    }))

    // Format customer segments data
    const customerSegmentsFormatted = customerSegments.map(segment => ({
      segment: segment._id,
      count: segment.count,
      revenue: segment.revenue
    }))

    // Generate sample revenue data (in a real app, this would come from actual data)
    const revenueData = {
      daily: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        revenue: Math.floor(Math.random() * 1000) + 500
      })),
      monthly: Array.from({ length: 12 }, (_, i) => ({
        month: new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'short' }),
        revenue: Math.floor(Math.random() * 5000) + 2000
      }))
    }

    const analyticsData = {
      overview: {
        totalRevenue: totalRevenue[0]?.total || 0,
        totalOrders,
        totalCustomers,
        averageOrderValue: avgOrderValue,
        conversionRate
      },
      revenue: revenueData,
      topProducts,
      customerSegments: customerSegmentsFormatted,
      orderStatus
    }

    return NextResponse.json({
      success: true,
      data: analyticsData
    })

  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
} 