'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { loadStripe } from '@stripe/stripe-js'
import toast from 'react-hot-toast'
import ApplePayButton from './ApplePayButton'
import PayPalButton from './PayPalButton'
import { Elements } from '@stripe/react-stripe-js'
import StripeElementsForm from './StripeElementsForm'

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null

interface CheckoutFormProps {
  onCancel?: () => void
}

export default function CheckoutForm({ onCancel }: CheckoutFormProps) {
  const { items: cart, clearCart, getTotalPrice } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  
  // Debug Stripe configuration
  console.log('Stripe Publishable Key:', process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'Set' : 'Not set')
  console.log('Stripe Promise:', stripePromise ? 'Available' : 'Not available')
  
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: user?.email || '',
    name: user?.name || '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'US',
    },
    phone: '',
  })

  const total = getTotalPrice()
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/signin?callbackUrl=/checkout')
      return
    }

    if (cart.length === 0) {
      router.push('/cart')
      return
    }
  }, [user, cart, router])

  useEffect(() => {
    if (!user || cart.length === 0) return
    // Fetch PaymentIntent client secret
    const fetchClientSecret = async () => {
      try {
        const response = await fetch('/api/stripe/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: total,
            currency: 'usd',
            customerEmail: formData.email,
          }),
        })
        const data = await response.json()
        if (response.ok && data.clientSecret) {
          setClientSecret(data.clientSecret)
        } else {
          toast.error(data.error || 'Failed to initialize payment')
        }
      } catch (error) {
        toast.error('Failed to initialize payment')
      }
    }
    fetchClientSecret()
  }, [user, cart, total, formData.email])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value,
        },
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Please Sign In</h2>
          <p className="text-theme-secondary mb-4">You need to be signed in to checkout</p>
          <button
            onClick={() => router.push('/signin?callbackUrl=/checkout')}
            className="btn btn-primary"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Your Cart is Empty</h2>
          <p className="text-theme-secondary mb-4">Add some products to your cart to checkout</p>
          <button
            onClick={() => router.push('/products')}
            className="btn btn-primary"
          >
            Browse Products
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="card p-6">
        <div className="space-y-6">
          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-medium mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div>
            <h3 className="text-lg font-medium mb-4">Shipping Address</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              
              <div>
                <label htmlFor="address.line1" className="block text-sm font-medium mb-2">
                  Address Line 1
                </label>
                <input
                  type="text"
                  id="address.line1"
                  name="address.line1"
                  value={formData.address.line1}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              
              <div>
                <label htmlFor="address.line2" className="block text-sm font-medium mb-2">
                  Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  id="address.line2"
                  name="address.line2"
                  value={formData.address.line2}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="address.city" className="block text-sm font-medium mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    id="address.city"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="address.state" className="block text-sm font-medium mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    id="address.state"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="address.postal_code" className="block text-sm font-medium mb-2">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    id="address.postal_code"
                    name="address.postal_code"
                    value={formData.address.postal_code}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Order Summary</h3>
            <div className="space-y-2">
                          {cart.map((item) => (
              <div key={item._id} className="flex justify-between">
                <span>{item.name} × {item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
              <div className="border-t pt-2 font-semibold">
                <div className="flex justify-between">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Options */}
          <div className="border-t pt-6">
            <h3 className="text-xl font-semibold mb-6 text-theme-primary">Payment Method</h3>
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            
            {/* Apple Pay Button */}
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
              disabled={isLoading}
            />
            
            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-400 font-medium">or pay with card, Link, or more</span>
              </div>
            </div>
            
            {/* Stripe Elements Form */}
            {clientSecret && (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <StripeElementsForm
                  amount={total}
                  email={formData.email}
                  onSuccess={() => {
                    toast.success('Payment successful!')
                    clearCart()
                    router.push('/orders/success?success=true')
                  }}
                  onError={(error) => toast.error(error)}
                  disabled={isLoading}
                />
              </Elements>
            )}
            
            {/* PayPal Button (optional, can be left as is) */}
            <PayPalButton
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
              disabled={isLoading}
              className="mb-4"
            />
          </div>

          {/* Cancel Button */}
          <div className="pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="w-full bg-gray-100 hover:bg-gray-200 ava-text-tertiary font-medium py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
            </div>
        </div>
      </div>
    </div>
  )
} 