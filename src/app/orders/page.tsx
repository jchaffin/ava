'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

import { Button } from '@/components/ui'
import { IOrder, IOrderItem } from '@/types'
import { formatPrice, formatDate } from '@/utils/helpers'
import toast from 'react-hot-toast'

interface OrdersPageState {
  orders: IOrder[]
  loading: boolean
  error: string | null
}

interface OrderStatusInfo {
  label: string
  color: string
  bgColor: string
}

const OrdersPage: React.FC = () => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [state, setState] = useState<OrdersPageState>({
    orders: [],
    loading: true,
    error: null,
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin?callbackUrl=/orders')
    } else if (session) {
      fetchOrders()
    }
  }, [session, status, router])

  const fetchOrders = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      const response = await fetch('/api/orders', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.statusText}`)
      }

      const data = await response.json()
      
      setState(prev => ({
        ...prev,
        orders: data,
        loading: false,
      }))
    } catch (error) {
      console.error('Error fetching orders:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load orders',
        loading: false,
      }))
      toast.error('Failed to load orders')
    }
  }

  const getOrderStatus = (order: IOrder): OrderStatusInfo => {
    if (order.isDelivered) {
      return {
        label: 'Delivered',
        color: 'text-green-800',
        bgColor: 'bg-green-100',
      }
    } else if (order.isPaid) {
      return {
        label: 'Processing',
        color: 'text-blue-800',
        bgColor: 'bg-blue-100',
      }
    } else {
      return {
        label: 'Pending Payment',
        color: 'text-yellow-800',
        bgColor: 'bg-yellow-100',
      }
    }
  }

  const getPaymentStatus = (order: IOrder): OrderStatusInfo => {
    if (order.isPaid) {
      return {
        label: 'Paid',
        color: 'text-green-800',
        bgColor: 'bg-green-100',
      }
    } else {
      return {
        label: 'Unpaid',
        color: 'text-red-800',
        bgColor: 'bg-red-100',
      }
    }
  }

  const handleReorder = async (order: IOrder) => {
    try {
      // Add all items from the order to cart
      // This would integrate with your cart context
      toast.success('Items added to cart!')
      router.push('/cart')
    } catch (error) {
      toast.error('Failed to add items to cart')
    }
  }

  const handleTrackOrder = (orderId: string) => {
    // Navigate to order tracking page
    router.push(`/orders/${orderId}/track`)
  }

  const handleViewInvoice = (orderId: string) => {
    // Navigate to invoice page or download invoice
    window.open(`/api/orders/${orderId}/invoice`, '_blank')
  }

  if (status === 'loading' || state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    )
  }

  if (state.error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-red-900 mb-2">
              Unable to Load Orders
            </h3>
            <p className="text-red-700 mb-4">{state.error}</p>
            <Button onClick={fetchOrders} variant="danger">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (state.orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-gray-50 rounded-lg p-8">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gray-100 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No Orders Yet
            </h2>
            <p className="text-gray-600 mb-6">
              You haven't placed any orders yet. Start shopping to see your order history here.
            </p>
            <Link href="/products">
              <Button size="lg">
                Start Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order History
          </h1>
          <p className="text-gray-600">
            Track and manage your orders. You have {state.orders.length} order{state.orders.length !== 1 ? 's' : ''}.
          </p>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {state.orders.map((order) => {
            const orderStatus = getOrderStatus(order)
            const paymentStatus = getPaymentStatus(order)

            return (
              <div
                key={order._id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
              >
                {/* Order Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Order #{order._id.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-sm text-gray-500">
                          Placed on {formatDate(order.createdAt)}
                        </p>
                      </div>
                      
                      <div className="flex space-x-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${orderStatus.bgColor} ${orderStatus.color}`}
                        >
                          {orderStatus.label}
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${paymentStatus.bgColor} ${paymentStatus.color}`}
                        >
                          {paymentStatus.label}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 mt-3 sm:mt-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewInvoice(order._id)}
                      >
                        View Invoice
                      </Button>
                      {order.isPaid && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTrackOrder(order._id)}
                        >
                          Track Order
                        </Button>
                      )}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleReorder(order)}
                      >
                        Reorder
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="px-6 py-4">
                  <div className="space-y-4">
                    {order.orderItems.map((item: IOrderItem, index: number) => (
                      <div key={index} className="flex items-center space-x-4">
                        <div className="flex-shrink-0 w-16 h-16">
                          <Image
                            src={typeof item.product === 'object' ? item.product.image : '/placeholder.jpg'}
                            alt={typeof item.product === 'object' ? item.product.name : 'Product'}
                            width={64}
                            height={64}
                            sizes="64px"
                            className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {typeof item.product === 'object' ? item.product.name : 'Product'}
                          </h4>
                          <p className="text-sm text-gray-500">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        
                        <div className="text-sm font-medium text-gray-900">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      <p>Items: {formatPrice(order.itemsPrice)}</p>
                      <p>Shipping: {formatPrice(order.shippingPrice)}</p>
                      <p>Tax: {formatPrice(order.taxPrice)}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="text-lg font-bold text-gray-900">
                        {formatPrice(order.totalPrice)}
                      </p>
                    </div>
                  </div>

                  {/* Delivery Information */}
                  {order.shippingAddress && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Delivery Address
                      </h4>
                      <p className="text-sm text-gray-600">
                        {order.shippingAddress.street}<br />
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                        {order.shippingAddress.country}
                      </p>
                    </div>
                  )}

                  {/* Delivery Status */}
                  {order.isDelivered && order.deliveredAt && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center text-green-600">
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-sm font-medium">
                          Delivered on {formatDate(order.deliveredAt)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Load More Button (if pagination is needed) */}
        {state.orders.length >= 10 && (
          <div className="text-center mt-8">
            <Button variant="secondary" onClick={fetchOrders}>
              Load More Orders
            </Button>
          </div>
        )}
      </div>
  )
}

export default OrdersPage
