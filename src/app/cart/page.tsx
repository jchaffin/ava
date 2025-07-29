'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useCart } from '@/context'
import { Button } from '@/components/ui'
import ApplePayButton from '@/components/ApplePayButton'
import GooglePayButton from '@/components/GooglePayButton'
import LinkPayButton from '@/components/LinkPayButton'
import StripeExpressCheckout from '@/components/StripeExpressCheckout'
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
      <div className="min-h-screen bg-theme-primary py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Link 
              href="/products"
              className="inline-flex items-center text-ava-accent hover:text-ava-accent/80 mb-4"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Continue Shopping
            </Link>
            <h1 className="text-3xl font-bold text-theme-primary">Shopping Cart</h1>
          </div>

          {/* Empty Cart */}
          <div className="bg-theme-secondary rounded-lg shadow-lg border border-theme p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-theme-tertiary rounded-full flex items-center justify-center mb-6">
              <ShoppingBagIcon className="w-12 h-12 text-theme-muted" />
            </div>
            <h2 className="text-2xl font-semibold text-theme-primary mb-4">
              Your cart is empty
            </h2>
            <p className="text-theme-secondary mb-8 max-w-md mx-auto">
              Looks like you haven&apos;t added any products to your cart yet. Start shopping to discover our amazing skincare products.
            </p>
            <div className="space-y-4">
              <Link href="/products">
                <Button className="font-bold px-8 py-3">
                  <ShoppingBagIcon className="w-5 h-5 mr-2" />
                  Start Shopping
                </Button>
              </Link>
              <div className="text-sm text-theme-muted">
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
    <div className="min-h-screen bg-theme-primary py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/products"
            className="inline-flex items-center text-ava-accent hover:text-ava-accent/80 mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Continue Shopping
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-theme-primary">Shopping Cart</h1>
            <button
              onClick={handleClearCart}
              className="text-theme-muted hover:text-theme-primary text-sm font-medium"
            >
              Clear Cart
            </button>
          </div>
          <p className="text-theme-secondary mt-2">
            {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-theme-secondary rounded-lg shadow-lg border border-theme">
              <div className="p-6 border-b border-theme">
                <h2 className="text-lg font-semibold text-theme-primary">Cart Items</h2>
              </div>
              
              <div className="divide-y divide-theme">
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
            <div className="bg-theme-secondary rounded-lg shadow-lg border border-theme sticky top-8">
              <div className="p-6 border-b border-theme">
                <h2 className="text-lg font-semibold text-theme-primary">Order Summary</h2>
              </div>
              
              <div className="p-6 space-y-4">
                {/* Price Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-theme-secondary">Subtotal ({getTotalItems()} items)</span>
                    <span className="font-medium text-theme-primary">{formatCurrency(subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-theme-secondary">Shipping</span>
                    <span className="font-medium text-theme-primary">
                      {shipping === 0 ? (
                        <span className="text-green-600 dark:text-green-400">Free</span>
                      ) : (
                        formatCurrency(shipping)
                      )}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-theme-secondary">Tax</span>
                    <span className="font-medium text-theme-primary">{formatCurrency(tax)}</span>
                  </div>
                  
                  <div className="border-t border-theme pt-3">
                    <div className="flex justify-between text-lg font-semibold text-theme-primary">
                      <span>Total</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>

                {/* Shipping Info */}
                {shipping > 0 && (
                  <div className="bg-theme-tertiary border border-theme rounded-lg p-4">
                    <div className="flex items-center text-sm text-theme-primary">
                      <TruckIcon className="w-4 h-4 mr-2" />
                      <span>
                        Add {formatCurrency(100 - subtotal)} more for free shipping
                      </span>
                    </div>
                  </div>
                )}

                {/* Stripe Express Checkout - All Payment Methods */}
                {session && (
                  <StripeExpressCheckout
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
                    className="mb-4"
                  />
                )}

                {/* Divider */}
                {session && (
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-theme" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 text-theme-muted">or use individual payment methods</span>
                    </div>
                  </div>
                )}


                {/* Checkout Button */}
                <Button
                  onClick={handleCheckout}
                  className="btn-secondary w-full py-3 text-lg font-medium"
                  disabled={items.length === 0}
                >
                  <LockClosedIcon className="w-5 h-5 mr-2" />
                  {session ? 'Proceed to Checkout' : 'Sign in to Checkout'}
                </Button>

                {/* Security & Trust */}
                <div className="border-t border-theme pt-4">
                  <div className="flex items-center justify-center space-x-6 text-sm text-theme-muted">
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
                <div className="text-xs text-theme-muted space-y-1">
                  <p>• Free shipping on orders over $100</p>
                  <p>• 30-day money-back guarantee</p>
                  <p>• Secure payment processing</p>
                </div>
              </div>
            </div>

            {/* Save for Later - Only show for guests with items */}
            {!session && items.length > 0 && (
              <div className="fixed bottom-6 right-6 w-80 bg-theme-tertiary rounded-lg shadow-lg border border-theme p-6 z-50">
                <h3 className="text-lg font-semibold text-theme-primary mb-4">Save Your Cart</h3>
                <p className="text-sm text-theme-secondary mb-4">
                  Create an account to save these {getTotalItems()} item{getTotalItems() !== 1 ? 's' : ''} for later. Your cart will be preserved when you sign in.
                </p>
                <div className="space-y-2">
                  <Link href="/register">
                    <Button variant="primary" className="w-full">
                      Create Account & Save Cart
                    </Button>
                  </Link>
                  <Link href="/signin">
                    <Button variant="ghost" className="w-full text-sm">
                      Already have an account? Sign in
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartPage