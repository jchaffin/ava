import { formatPrice, formatDate, formatNumber, formatPercentage } from './helpers'
import { IProduct, IOrder, IUser } from '@/types'

// Product Formatters
export const formatProductPrice = (product: IProduct): string => {
  return formatPrice(product.price)
}

export const formatProductStock = (stock: number): string => {
  if (stock === 0) return 'Out of Stock'
  if (stock <= 5) return `Only ${stock} left`
  return 'In Stock'
}

export const formatProductCategory = (category: string): string => {
  return category.replace(/([A-Z])/g, ' $1').trim()
}

// Order Formatters
export const formatOrderId = (orderId: string): string => {
  return `#${orderId.slice(-8).toUpperCase()}`
}

export const formatOrderStatus = (status: string): string => {
  return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')
}

export const formatOrderDate = (date: Date | string): string => {
  return formatDate(date, 'MMM dd, yyyy')
}

export const formatOrderTotal = (order: IOrder): string => {
  return formatPrice(order.totalPrice)
}

// User Formatters
export const formatUserName = (user: IUser): string => {
  return user.name || 'Anonymous User'
}

export const formatUserRole = (role: string): string => {
  return role.charAt(0).toUpperCase() + role.slice(1)
}

export const formatUserJoinDate = (date: Date | string): string => {
  return `Member since ${formatDate(date, 'MMM yyyy')}`
}

// Address Formatters
export const formatAddress = (address: {
  street?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
}): string => {
  const parts = [
    address.street,
    address.city,
    address.state,
    address.zipCode,
    address.country,
  ].filter(Boolean)
  
  return parts.join(', ')
}

// Rating Formatters
export const formatRating = (rating: number): string => {
  return rating.toFixed(1)
}

export const formatReviewCount = (count: number): string => {
  if (count === 0) return 'No reviews'
  if (count === 1) return '1 review'
  return `${formatNumber(count)} reviews`
}

// Discount Formatters
export const formatDiscount = (originalPrice: number, discountedPrice: number): string => {
  const discount = ((originalPrice - discountedPrice) / originalPrice) * 100
  return formatPercentage(discount)
}

export const formatSavings = (originalPrice: number, discountedPrice: number): string => {
  const savings = originalPrice - discountedPrice
  return `Save ${formatPrice(savings)}`
}

// Shipping Formatters
export const formatShippingCost = (cost: number): string => {
  return cost === 0 ? 'FREE' : formatPrice(cost)
}

export const formatDeliveryTime = (days: number): string => {
  if (days === 1) return 'Next day delivery'
  if (days <= 3) return `${days} days delivery`
  return `${days} days delivery`
}

// Inventory Formatters
export const formatStockLevel = (current: number, total: number): string => {
  const percentage = (current / total) * 100
  if (percentage <= 10) return 'Critical'
  if (percentage <= 25) return 'Low'
  if (percentage <= 50) return 'Medium'
  return 'High'
}

// Size and Weight Formatters
export const formatWeight = (grams: number): string => {
  if (grams < 1000) return `${grams}g`
  return `${(grams / 1000).toFixed(1)}kg`
}

export const formatDimensions = (length: number, width: number, height: number): string => {
  return `${length} × ${width} × ${height} cm`
}

// Search Result Formatters
export const formatSearchResults = (count: number, query: string): string => {
  if (count === 0) return `No results found for "${query}"`
  if (count === 1) return `1 result for "${query}"`
  return `${formatNumber(count)} results for "${query}"`
}

// Time Formatters
export const formatTimeAgo = (date: Date | string): string => {
  const now = new Date()
  const past = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)

  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
  return formatDate(past, 'MMM dd, yyyy')
}

export const formatEstimatedDelivery = (orderDate: Date | string, processingDays: number = 2): string => {
  const order = new Date(orderDate)
  const delivery = new Date(order)
  delivery.setDate(order.getDate() + processingDays)
  
  const today = new Date()
  const diffInDays = Math.ceil((delivery.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffInDays <= 0) return 'Delivered'
  if (diffInDays === 1) return 'Arriving tomorrow'
  if (diffInDays <= 7) return `Arriving in ${diffInDays} days`
  return `Arriving ${formatDate(delivery, 'MMM dd')}`
}

// Payment Formatters
export const formatPaymentMethod = (method: string): string => {
  const methods: Record<string, string> = {
    card: 'Credit/Debit Card',
    paypal: 'PayPal',
    bank_transfer: 'Bank Transfer',
    apple_pay: 'Apple Pay',
    google_pay: 'Google Pay',
  }
  return methods[method] || method
}

export const formatCardNumber = (cardNumber: string): string => {
  // Mask all but last 4 digits
  return `**** **** **** ${cardNumber.slice(-4)}`
}

// Analytics Formatters
export const formatConversionRate = (conversions: number, visits: number): string => {
  if (visits === 0) return '0%'
  return formatPercentage((conversions / visits) * 100)
}

export const formatGrowthRate = (current: number, previous: number): string => {
  if (previous === 0) return '0%'
  const growth = ((current - previous) / previous) * 100
  const sign = growth >= 0 ? '+' : ''
  return `${sign}${formatPercentage(growth)}`
}

// Notification Formatters
export const formatNotificationTime = (date: Date | string): string => {
  const now = new Date()
  const notificationDate = new Date(date)
  const diffInHours = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) return 'Just now'
  if (diffInHours < 24) return `${diffInHours}h ago`
  if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
  return formatDate(notificationDate, 'MMM dd')
}

// File and Media Formatters
export const formatImageAlt = (productName: string, variant?: string): string => {
  return variant ? `${productName} - ${variant}` : productName
}

export const formatVideoTitle = (productName: string, type: 'demo' | 'unboxing' | 'review' = 'demo'): string => {
  const types = {
    demo: 'Product Demo',
    unboxing: 'Unboxing Video',
    review: 'Customer Review',
  }
  return `${productName} - ${types[type]}`
}





