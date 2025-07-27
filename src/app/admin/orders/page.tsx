'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components'
import { Button, Input } from '@/components/ui'
import { useAuth } from '@/context'
import {
  Search,
  Eye,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Package,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface OrderItem {
  product: {
    _id: string
    name: string
    image: string
    price: number
  }
  quantity: number
  price: number
}

interface Order {
  _id: string
  orderNumber: string
  user: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  orderItems: OrderItem[]
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  shippingAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  createdAt: string
  updatedAt: string
}

const AdminOrders: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'>('all')
  const [sortBy, setSortBy] = useState<'createdAt' | 'total' | 'status'>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated || !user?.id) {
      router.push('/signin?callbackUrl=/admin/orders')
      return
    }

    if (user.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.')
      router.push('/')
      return
    }

    fetchOrders()
  }, [user, isAuthenticated, isLoading, router])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/orders')
      const data = await response.json()
      
      if (data.success) {
        setOrders(data.data)
      } else {
        toast.error(data.message || 'Failed to fetch orders')
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await response.json()

      if (data.success) {
        toast.success('Order status updated successfully')
        fetchOrders()
      } else {
        toast.error(data.message || 'Failed to update order status')
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      toast.error('Failed to update order status')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'processing':
        return <Package className="w-4 h-4 text-blue-500" />
      case 'shipped':
        return <Truck className="w-4 h-4 text-purple-500" />
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-theme-primary" />
      case 'cancelled':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-theme-muted" />
    }
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

  // Filter and sort orders
  const filteredAndSortedOrders = orders
    .filter(order => {
      const matchesSearch = 
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user.email.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesFilter = filter === 'all' || order.status === filter

      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      let aValue: string | number = a[sortBy]
      let bValue: string | number = b[sortBy]

      if (sortBy === 'total') {
        aValue = Number(aValue)
        bValue = Number(bValue)
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  if (isLoading || loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-theme-secondary">Loading orders...</p>
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
                <h1 className="text-3xl font-bold text-theme-primary">Orders Management</h1>
                <p className="mt-1 text-sm text-theme-muted">
                  Track and manage customer orders
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                <Input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 relative"
                />
              </div>
              
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled')}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'createdAt' | 'total' | 'status')}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="createdAt">Date Created</option>
                <option value="total">Total Amount</option>
                <option value="status">Status</option>
              </select>

              <Button
                variant="ghost"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="flex items-center justify-center"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
          </div>

          {/* Orders List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-theme-primary">
                Orders ({filteredAndSortedOrders.length})
              </h3>
            </div>
            
            {filteredAndSortedOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-theme-muted uppercase tracking-wider">
                        Order
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-theme-muted uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-theme-muted uppercase tracking-wider">
                        Items
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-theme-muted uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-theme-muted uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-theme-muted uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-theme-muted uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAndSortedOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-theme-primary">
                            #{order.orderNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-theme-primary">
                              {order.user.firstName} {order.user.lastName}
                            </div>
                            <div className="text-sm text-theme-muted">
                              {order.user.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-theme-primary">
                            {order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''}
                          </div>
                          <div className="text-sm text-theme-muted">
                            {order.orderItems[0]?.product.name}
                            {order.orderItems.length > 1 && ` +${order.orderItems.length - 1} more`}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-theme-primary">
                          {formatCurrency(order.total)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(order.status)}
                            <span className={`ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-theme-muted">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/admin/orders/${order._id}`)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                              className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-theme-muted">
                  {searchTerm || filter !== 'all' 
                    ? 'No orders match your filters' 
                    : 'No orders found'
                  }
                </p>
                {searchTerm || filter !== 'all' && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSearchTerm('')
                      setFilter('all')
                    }}
                    className="mt-2"
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminOrders 