'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components'
import { Button } from '@/components/ui'
import { useAuth } from '@/context'
import {
  BarChart3,
  DollarSign,
  ShoppingBag,
  Users,
  Download,
  Calendar,
  RefreshCw,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface AnalyticsData {
  overview: {
    totalRevenue: number
    totalOrders: number
    totalCustomers: number
    averageOrderValue: number
    conversionRate: number
  }
  revenue: {
    daily: { date: string; revenue: number }[]
    monthly: { month: string; revenue: number }[]
  }
  topProducts: {
    _id: string
    name: string
    sales: number
    revenue: number
    image: string
  }[]
  customerSegments: {
    segment: string
    count: number
    revenue: number
  }[]
  orderStatus: {
    status: string
    count: number
    percentage: number
  }[]
}

const AdminAnalytics: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d')


  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated || !user?.id) {
      router.push('/signin?callbackUrl=/admin/analytics')
      return
    }

    if (user.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.')
      router.push('/')
      return
    }

    fetchAnalytics()
  }, [user, isAuthenticated, isLoading, router, selectedPeriod])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/analytics?period=${selectedPeriod}`)
      const data = await response.json()
      
      if (data.success) {
        setAnalytics(data.data)
      } else {
        toast.error(data.message || 'Failed to fetch analytics')
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
      toast.error('Failed to fetch analytics')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }



  const exportData = async (type: 'csv' | 'pdf') => {
    try {
      const response = await fetch(`/api/admin/analytics/export?type=${type}&period=${selectedPeriod}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics-${selectedPeriod}.${type}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success(`Analytics exported as ${type.toUpperCase()}`)
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export analytics')
    }
  }

  if (isLoading || loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-theme-secondary">Loading analytics...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-theme-primary">Analytics</h1>
                <p className="mt-1 text-sm text-theme-muted">
                  Comprehensive insights into your business performance
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value as '7d' | '30d' | '90d' | '1y')}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                    <option value="1y">Last year</option>
                  </select>
                </div>
                <Button onClick={fetchAnalytics} variant="secondary">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <div className="flex space-x-2">
                  <Button onClick={() => exportData('csv')} variant="secondary">
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button onClick={() => exportData('pdf')} variant="secondary">
                    <Download className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {analytics ? (
            <>
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <DollarSign className="w-8 h-8 text-green-500" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-theme-muted">Total Revenue</p>
                      <p className="text-2xl font-bold text-theme-primary">
                        {formatCurrency(analytics.overview.totalRevenue)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ShoppingBag className="w-8 h-8 text-blue-500" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-theme-muted">Total Orders</p>
                      <p className="text-2xl font-bold text-theme-primary">
                        {formatNumber(analytics.overview.totalOrders)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Users className="w-8 h-8 text-purple-500" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-theme-muted">Total Customers</p>
                      <p className="text-2xl font-bold text-theme-primary">
                        {formatNumber(analytics.overview.totalCustomers)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <BarChart3 className="w-8 h-8 text-orange-500" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-theme-muted">Avg Order Value</p>
                      <p className="text-2xl font-bold text-theme-primary">
                        {formatCurrency(analytics.overview.averageOrderValue)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts and Detailed Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue Chart */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-theme-primary mb-4">Revenue Trend</h3>
                  <div className="h-64 flex items-center justify-center text-theme-muted">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                      <p>Revenue chart will be displayed here</p>
                    </div>
                  </div>
                </div>

                {/* Top Products */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-theme-primary mb-4">Top Products</h3>
                  <div className="space-y-4">
                    {analytics.topProducts.slice(0, 5).map((product) => (
                      <div key={product._id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-10 h-10 rounded object-cover"
                          />
                          <div className="ml-3">
                            <p className="text-sm font-medium text-theme-primary">{product.name}</p>
                            <p className="text-sm text-theme-muted">{formatNumber(product.sales)} sold</p>
                          </div>
                        </div>
                        <p className="text-sm font-medium text-theme-primary">
                          {formatCurrency(product.revenue)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Customer Segments */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-theme-primary mb-4">Customer Segments</h3>
                  <div className="space-y-4">
                    {analytics.customerSegments.map((segment) => (
                      <div key={segment.segment} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-theme-primary">{segment.segment}</p>
                          <p className="text-sm text-theme-muted">{formatNumber(segment.count)} customers</p>
                        </div>
                        <p className="text-sm font-medium text-theme-primary">
                          {formatCurrency(segment.revenue)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Status */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-theme-primary mb-4">Order Status</h3>
                  <div className="space-y-4">
                    {analytics.orderStatus.map((status) => (
                      <div key={status.status} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-theme-primary capitalize">{status.status}</p>
                          <p className="text-sm text-theme-muted">{formatNumber(status.count)} orders</p>
                        </div>
                        <p className="text-sm font-medium text-theme-primary">{status.percentage}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-theme-primary mb-2">No Analytics Data</h3>
              <p className="text-theme-muted">Analytics data will appear here once available.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminAnalytics 