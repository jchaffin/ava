'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useCart } from '@/context'
import { Button } from '@/components/ui'
import ApplePayButton from '@/components/ApplePayButton'
import CartItem from '@/components/CartItem'
import { 
  ShoppingBagIcon,
  ArrowLeftIcon,
  LockClosedIcon,
  TruckIcon,
  ShieldCheckIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline'

import toast from 'react-hot-toast'

const CartPage: React.FC = () => {
  const { data: session } = useSession()
  const router = useRouter()
  const { 
    items, 
    removeItem, 
    updateQuantity, 
    clearCart, 
    getTotalPrice, 
    getTotalItems 
  } = useCart()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    updateQuantity(productId, newQuantity)
  }

  const handleRemoveItem = (productId: string) => {
    removeItem(productId)
  }

  const handleClearCart = () => {
    if (items.length === 0) return
    
    if (confirm('Are you sure you want to clear your cart?')) {
      clearCart()
    }
  }

  const handleCheckout = () => {
    if (!session) {
      router.push('/signin?callbackUrl=/cart')
      return
    }
    
    if (items.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    router.push('/checkout')
  }

  const subtotal = getTotalPrice()
  const shipping = subtotal > 100 ? 0 : 10
  const tax = subtotal * 0.1 // 10% tax
  const total = subtotal + shipping + tax

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Link 
              href="/products"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Continue Shopping
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          </div>

          {/* Empty Cart */}
          <div className="bg-white rounded-lg shadow-lg border p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <ShoppingBagIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Looks like you haven&apos;t added any products to your cart yet. Start shopping to discover our amazing skincare products.
            </p>
            <div className="space-y-4">
              <Link href="/products">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3">
                  <ShoppingBagIcon className="w-5 h-5 mr-2" />
                  Start Shopping
                </Button>
              </Link>
              <div className="text-sm text-gray-500">
                <p>Free shipping on orders over $100</p>
                <p>30-day money-back guarantee</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/products"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Continue Shopping
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <button
              onClick={handleClearCart}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Clear Cart
            </button>
          </div>
          <p className="text-gray-600 mt-2">
            {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg border">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Cart Items</h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {items.map((item) => (
                  <div key={item._id} className="p-6">
                    <CartItem
                      item={{
                        id: item._id,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        image: item.image,
                        description: item.description,
                      }}
                      stock={item.stock}
                      onUpdateQuantity={(id, quantity) => handleQuantityChange(id, quantity)}
                      onRemove={handleRemoveItem}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg border sticky top-8">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
              </div>
              
              <div className="p-6 space-y-4">
                {/* Price Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({getTotalItems()} items)</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {shipping === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        formatCurrency(shipping)
                      )}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">{formatCurrency(tax)}</span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>

                {/* Shipping Info */}
                {shipping > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center text-sm text-blue-800">
                      <TruckIcon className="w-4 h-4 mr-2" />
                      <span>
                        Add {formatCurrency(100 - subtotal)} more for free shipping
                      </span>
                    </div>
                  </div>
                )}

                {/* Apple Pay Button */}
                {session && (
                  <ApplePayButton
                    amount={total}
                    currency="usd"
                    onSuccess={() => {
                      toast.success('Payment successful!')
                      clearCart()
                      router.push('/orders/success?success=true')
                    }}
                    onError={(error) => {
                      toast.error(error)
                    }}
                    disabled={items.length === 0}
                  />
                )}

                {/* Divider */}
                {session && (
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">or</span>
                    </div>
                  </div>
                )}

                {/* Checkout Button */}
                <Button
                  onClick={handleCheckout}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium"
                  disabled={items.length === 0}
                >
                  <LockClosedIcon className="w-5 h-5 mr-2" />
                  {session ? 'Proceed to Checkout' : 'Sign in to Checkout'}
                </Button>

                {/* Security & Trust */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center">
                      <ShieldCheckIcon className="w-4 h-4 mr-1" />
                      <span>Secure Checkout</span>
                    </div>
                    <div className="flex items-center">
                      <CreditCardIcon className="w-4 h-4 mr-1" />
                      <span>Multiple Payment Options</span>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="text-xs text-gray-500 space-y-1">
                  <p>• Free shipping on orders over $100</p>
                  <p>• 30-day money-back guarantee</p>
                  <p>• Secure payment processing</p>
                </div>
              </div>
            </div>

            {/* Save for Later */}
            <div className="mt-6 bg-white rounded-lg shadow-lg border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Save for Later</h3>
              <p className="text-sm text-gray-600 mb-4">
                Create an account to save items for future purchases
              </p>
              <Link href="/register">
                <Button variant="ghost" className="w-full">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartPage