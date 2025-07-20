'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ShoppingBagIcon,
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  UserIcon,
  HeartIcon,
  CogIcon,
  ArrowRightIcon,
  StarIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  BellIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui'
import { useAuth } from '@/context'
import { IOrder, IProduct } from '@/types'

interface DashboardStats {
  totalOrders: number
  totalSpent: number
  wishlistItems: number
  reviews: number
}

interface RecentOrder extends IOrder {
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  statusColor: string
  statusIcon: React.ComponentType<any>
}

const DashboardPage: React.FC = () => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { hasRole } = useAuth()
  const [isClient, setIsClient] = useState(false)
  
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalSpent: 0,
    wishlistItems: 0,
    reviews: 0,
  })
  
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [recentProducts, setRecentProducts] = useState<IProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return
    
    if (status === 'loading') return
    
    if (status === 'unauthenticated') {
      router.push('/signin')
      return
    }

    fetchDashboardData()
  }, [status, session, isClient])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch user orders
      const ordersResponse = await fetch('/api/orders')
      const ordersData = await ordersResponse.json()
      
      if (ordersData.success) {
        const orders = ordersData.data || []
        const totalSpent = orders.reduce((sum: number, order: IOrder) => sum + order.totalPrice, 0)
        
        setStats({
          totalOrders: orders.length,
          totalSpent,
          wishlistItems: 5, // Mock data - would come from wishlist API
          reviews: 3, // Mock data - would come from reviews API
        })

        // Transform orders for display
        const recentOrdersData = orders.slice(0, 5).map((order: IOrder) => {
          const statuses = [
            { status: 'pending' as const, color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
            { status: 'processing' as const, color: 'bg-blue-100 text-blue-800', icon: CogIcon },
            { status: 'shipped' as const, color: 'bg-purple-100 text-purple-800', icon: TruckIcon },
            { status: 'delivered' as const, color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
            { status: 'cancelled' as const, color: 'bg-red-100 text-red-800', icon: CheckCircleIcon },
          ]
          
          const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
          
          return {
            ...order,
            status: randomStatus.status,
            statusColor: randomStatus.color,
            statusIcon: randomStatus.icon,
          }
        })
        
        setRecentOrders(recentOrdersData)
      }

      // Fetch recent products (featured products)
      const productsResponse = await fetch('/api/products?featured=true&limit=4')
      const productsData = await productsResponse.json()
      
      if (productsData.success) {
        setRecentProducts(productsData.data || [])
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return ClockIcon
      case 'processing':
        return CogIcon
      case 'shipped':
        return TruckIcon
      case 'delivered':
        return CheckCircleIcon
      case 'cancelled':
        return CheckCircleIcon
      default:
        return ClockIcon
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-theme-primary">
                Welcome back, {session.user?.name?.split(' ')[0]}!
              </h1>
              <p className="mt-1 text-theme-secondary">
                Here&apos;s what&apos;s happening with your account today.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/products')}
              >
                <ShoppingBagIcon className="h-4 w-4 mr-2" />
                Shop Now
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingBagIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-theme-secondary">Total Orders</p>
                <p className="text-2xl font-bold text-theme-primary">{stats.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-theme-secondary">Total Spent</p>
                <p className="text-2xl font-bold text-theme-primary">{formatCurrency(stats.totalSpent)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <HeartIcon className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-theme-secondary">Wishlist Items</p>
                <p className="text-2xl font-bold text-theme-primary">{stats.wishlistItems}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <StarIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-theme-secondary">Reviews</p>
                <p className="text-2xl font-bold text-theme-primary">{stats.reviews}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-theme-primary">Recent Orders</h2>
                  <Link 
                    href="/orders"
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
                  >
                    View all
                    <ArrowRightIcon className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {recentOrders.length > 0 ? (
                  <div className="space-y-4">
                    {recentOrders.map((order) => {
                      const StatusIcon = order.statusIcon
                      return (
                        <div key={order._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.statusColor}`}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-theme-primary">
                                Order #{order._id.slice(-8)}
                              </p>
                              <p className="text-sm text-theme-muted">
                                {order.orderItems.length} items • {formatDate(order.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-theme-primary">
                              {formatCurrency(order.totalPrice)}
                            </p>
                            <Link 
                              href={`/orders/${order._id}`}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              View details
                            </Link>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingBagIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-theme-muted mb-4">No orders yet</p>
                    <Button onClick={() => router.push('/products')}>
                      Start Shopping
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions & Recent Products */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-theme-primary">Quick Actions</h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <Link
                    href="/profile"
                    className="flex items-center p-3 ava-text-tertiary hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <UserIcon className="h-5 w-5 mr-3 text-gray-400" />
                    <span className="text-sm font-medium">Edit Profile</span>
                  </Link>
                  
                  <Link
                    href="/orders"
                    className="flex items-center p-3 ava-text-tertiary hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <ClipboardDocumentListIcon className="h-5 w-5 mr-3 text-gray-400" />
                    <span className="text-sm font-medium">View Orders</span>
                  </Link>
                  
                  <Link
                    href="/wishlist"
                    className="flex items-center p-3 ava-text-tertiary hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <HeartIcon className="h-5 w-5 mr-3 text-gray-400" />
                    <span className="text-sm font-medium">Wishlist</span>
                  </Link>
                  
                  <Link
                    href="/settings"
                    className="flex items-center p-3 ava-text-tertiary hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <CogIcon className="h-5 w-5 mr-3 text-gray-400" />
                    <span className="text-sm font-medium">Settings</span>
                  </Link>

                  {hasRole('admin') && (
                    <Link
                      href="/admin"
                      className="flex items-center p-3 ava-text-tertiary hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <ChartBarIcon className="h-5 w-5 mr-3 text-gray-400" />
                      <span className="text-sm font-medium">Admin Dashboard</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Products */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-theme-primary">Featured Products</h2>
                  <Link 
                    href="/products"
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View all
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {recentProducts.length > 0 ? (
                  <div className="space-y-4">
                    {recentProducts.map((product) => (
                      <Link
                        key={product._id}
                        href={`/products/${product._id}`}
                        className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-12 w-12 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-theme-primary truncate">
                            {product.name}
                          </p>
                          <p className="text-sm text-theme-muted">
                            {formatCurrency(product.price)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-theme-muted text-sm">No featured products</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage 