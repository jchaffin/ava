'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components'
import { Button } from '@/components/ui'
import { useAuth } from '@/context'
import ThemeToggle from '@/components/ThemeToggle'
import {
  ShoppingBag,
  Package,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  AlertTriangle,
  Plus,
  Edit,
  BarChart3,
  Calendar,
  Cloud,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface DashboardStats {
  totalSales: number
  totalOrders: number
  totalProducts: number
  totalCustomers: number
  averageOrderValue: number
  conversionRate: number
  growth: {
    sales: number
    orders: number
    customers: number
  }
}

interface RecentOrder {
  _id: string
  orderNumber: string
  customer: {
    name: string
    email: string
  }
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  createdAt: string
}

interface LowStockProduct {
  _id: string
  name: string
  stock: number
  price: number
  image: string
}

const AdminDashboard: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month')

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return
    
    if (isLoading) return

    if (!isAuthenticated || !user?.id) {
      router.push('/signin?callbackUrl=/admin/dashboard')
      return
    }

    if (user.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.')
      router.push('/')
      return
    }

    fetchDashboardData()
  }, [user, isAuthenticated, isLoading, router, selectedPeriod, isClient])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch dashboard stats
      const statsResponse = await fetch(`/api/admin/dashboard/stats?period=${selectedPeriod}`)
      const statsData = await statsResponse.json()
      
      if (statsData.success) {
        setStats(statsData.data)
      }

      // Fetch recent orders
      const ordersResponse = await fetch('/api/admin/dashboard/recent-orders')
      const ordersData = await ordersResponse.json()
      
      if (ordersData.success) {
        setRecentOrders(ordersData.data)
      }

      // Fetch low stock products
      const productsResponse = await fetch('/api/admin/dashboard/low-stock')
      const productsData = await productsResponse.json()
      
      if (productsData.success) {
        setLowStockProducts(productsData.data)
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
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



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getGrowthIcon = (value: number) => {
    return value >= 0 ? (
      <TrendingUp className="w-4 h-4 text-theme-primary" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-500" />
    )
  }

  if (isLoading || loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-theme-secondary">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-theme-primary">
        {/* Header */}
        <div className="bg-theme-primary shadow-sm border-b border-theme">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-theme-primary">Admin Dashboard</h1>
                <p className="mt-1 text-sm text-theme-muted">
                  Welcome back, {user?.name}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-theme-muted" />
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value as 'day' | 'week' | 'month' | 'year')}
                    className="border border-theme rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-0 focus:border-theme bg-theme-tertiary text-theme-primary"
                  >
                    <option value="day">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
                  </select>
                </div>
                <Button variant="secondary" size="sm" onClick={() => router.push('/admin/products/new')}>
                  <Plus className="w-4 h-4 mr-2 text-theme-primary" />
                  Add Product
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-theme-secondary rounded-lg shadow border border-theme p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-theme-tertiary rounded-lg">
                    <DollarSign className="w-6 h-6 text-theme-primary" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-theme-secondary">Total Sales</p>
                    <p className="text-2xl font-bold text-theme-primary">{formatCurrency(stats.totalSales)}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  {getGrowthIcon(stats.growth.sales)}
                  <span className={`ml-2 text-sm ${stats.growth.sales >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(stats.growth.sales)}% from last period
                  </span>
                </div>
              </div>

              <div className="bg-theme-secondary rounded-lg shadow border border-theme p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-theme-tertiary rounded-lg">
                    <ShoppingBag className="w-6 h-6 text-theme-primary" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-theme-secondary">Total Orders</p>
                    <p className="text-2xl font-bold text-theme-primary">{stats.totalOrders}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  {getGrowthIcon(stats.growth.orders)}
                  <span className={`ml-2 text-sm ${stats.growth.orders >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(stats.growth.orders)}% from last period
                  </span>
                </div>
              </div>

              <div className="bg-theme-secondary rounded-lg shadow border border-theme p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-theme-tertiary rounded-lg">
                    <Package className="w-6 h-6 text-theme-primary" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-theme-secondary">Total Products</p>
                    <p className="text-2xl font-bold text-theme-primary">{stats.totalProducts}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <Eye className="w-4 h-4 text-theme-muted" />
                  <span className="ml-2 text-sm text-theme-secondary">
                    {stats.conversionRate}% conversion rate
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Orders */}
            <div className="bg-theme-secondary rounded-lg shadow border border-theme">
              <div className="px-6 py-4 border-b border-theme">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-theme-primary">Recent Orders</h3>
                  <Button 
                    variant="secondary" 
                    className="bg-theme-secondary"
                    onClick={() => router.push('/admin/orders')}
                  >
                    View All
                  </Button>
                </div>
              </div>
              <div className="p-6">
                {recentOrders.length > 0 ? (
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order._id} className="flex items-center justify-between p-4 border border-theme rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-medium text-theme-primary">#{order.orderNumber}</p>
                            <p className="text-sm text-theme-muted">{order.customer.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-theme-primary">{formatCurrency(order.total)}</p>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingBag className="w-12 h-12 text-theme-muted mx-auto mb-4" />
                    <p className="text-theme-muted">No recent orders</p>
                  </div>
                )}
              </div>
            </div>

            {/* Low Stock Products */}
            <div className="bg-theme-secondary rounded-lg shadow border border-theme">
              <div className="px-6 py-4 border-b border-theme">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-theme-primary">Low Stock Alert</h3>
                  <Button 
                    variant="secondary" 
                    className="bg-theme-secondary"
                    onClick={() => router.push('/admin/products')}
                  >
                    View All
                  </Button>
                </div>
              </div>
              <div className="p-6">
                {lowStockProducts.length > 0 ? (
                  <div className="space-y-4">
                    {lowStockProducts.map((product) => (
                      <div key={product._id} className="flex items-center justify-between p-4 border border-theme rounded-lg">
                        <div className="flex items-center space-x-4">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <div>
                            <p className="font-medium text-theme-primary">{product.name}</p>
                            <p className="text-sm text-theme-muted">{formatCurrency(product.price)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            <span className="text-sm font-medium text-red-600">{product.stock} left</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/admin/products/${product._id}/edit`)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-theme-muted">All products are well stocked</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-theme-secondary rounded-lg shadow border border-theme">
            <div className="px-6 py-4 border-b border-theme">
              <h3 className="text-lg font-medium text-theme-primary">Quick Actions</h3>
              <p className="text-sm text-theme-muted mt-1">Common tasks to manage your store</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Button
                  variant="secondary"
                  className="h-24 flex-col group relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  onClick={() => router.push('/admin/products/new')}
                >
                  <Plus className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform duration-300 text-theme-primary" />
                  <span className="font-semibold text-base text-theme-primary">Add Product</span>
                  <span className="text-xs text-theme-secondary mt-1">Create new product listing</span>
                </Button>
                
                <Button
                  variant="secondary"
                  className="h-24 flex-col group relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  onClick={() => router.push('/admin/orders')}
                >
                  <ShoppingBag className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform duration-300 text-theme-primary" />
                  <span className="font-semibold text-base text-theme-primary">View Orders</span>
                  <span className="text-xs text-theme-secondary mt-1">Manage customer orders</span>
                </Button>

                <Button
                  variant="secondary"
                  className="h-24 flex-col group relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  onClick={() => router.push('/admin/analytics')}
                >
                  <BarChart3 className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform duration-300 text-theme-primary" />
                  <span className="font-semibold text-base text-theme-primary">View Analytics</span>
                  <span className="text-xs text-theme-secondary mt-1">Track performance metrics</span>
                </Button>
              </div>
              
              {/* Additional Quick Actions Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-theme">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-col h-16 group hover:bg-theme-tertiary transition-all duration-200"
                  onClick={() => router.push('/admin/products')}
                >
                  <Package className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform duration-200 text-theme-primary" />
                  <span className="text-sm font-medium text-theme-primary">Products</span>
                </Button>
                
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-col h-16 group hover:bg-theme-tertiary transition-all duration-200"
                  onClick={() => router.push('/admin/settings')}
                >
                  <Calendar className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform duration-200 text-theme-primary" />
                  <span className="text-sm font-medium text-theme-primary">Settings</span>
                </Button>
                
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-col h-16 group hover:bg-theme-tertiary transition-all duration-200"
                  onClick={() => window.open('/api/admin/analytics/export', '_blank')}
                >
                  <TrendingUp className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform duration-200 text-theme-primary" />
                  <span className="text-sm font-medium text-theme-primary">Export Data</span>
                </Button>
                
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-col h-16 group hover:bg-theme-tertiary transition-all duration-200"
                  onClick={() => router.push('/admin/tutorials')}
                >
                  <Eye className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform duration-200 text-theme-primary" />
                  <span className="text-sm font-medium text-theme-primary">Tutorials</span>
                </Button>
                
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-col h-16 group hover:bg-theme-tertiary transition-all duration-200"
                  onClick={() => router.push('/admin/s3')}
                >
                  <Cloud className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform duration-200 text-theme-primary" />
                  <span className="text-sm font-medium text-theme-primary">Local Storage</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminDashboard 