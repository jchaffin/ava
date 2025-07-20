'use client'

import React, { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import { CheckCircleIcon, ArrowRightIcon, HomeIcon } from '@heroicons/react/24/outline'

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { clearCart } = useCart()
  const { user } = useAuth()
  
  const sessionId = searchParams.get('session_id')
  const success = searchParams.get('success')

  useEffect(() => {
    if (success === 'true' && sessionId) {
      // Clear cart after successful payment
      clearCart()
    }
  }, [success, sessionId, clearCart])

  if (!user) {
    router.push('/signin')
    return null
  }

  return (
    <div className="min-h-screen bg-theme-secondary py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-theme-primary rounded-lg shadow-sm border border-theme p-8 text-center">
          {/* Success Icon */}
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircleIcon className="w-8 h-8 text-green-600" />
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-theme-primary mb-4">
            Payment Successful!
          </h1>
          
          <p className="text-lg text-theme-secondary mb-6">
            Thank you for your purchase. Your order has been confirmed and will be processed shortly.
          </p>

          {/* Order Details */}
          {sessionId && (
            <div className="bg-theme-secondary rounded-lg p-4 mb-6">
              <p className="text-sm text-theme-secondary">
                <span className="font-medium">Session ID:</span> {sessionId}
              </p>
              <p className="text-sm text-theme-secondary mt-1">
                You will receive an email confirmation shortly.
              </p>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <h3 className="font-semibold text-blue-900 mb-2">What&apos;s Next?</h3>
            <ul className="text-sm text-blue-800 space-y-1 text-left">
              <li>• You&apos;ll receive an order confirmation email</li>
              <li>• We&apos;ll process and ship your order within 1-2 business days</li>
              <li>• You&apos;ll get tracking information once shipped</li>
              <li>• Enjoy your new skincare products!</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link href="/orders">
                          <button className="w-full bg-theme-primary hover:bg-theme-secondary text-theme-secondary py-3 px-6 rounded-lg font-bold flex items-center justify-center">
              <ArrowRightIcon className="w-5 h-5 mr-2" />
              View My Orders
            </button>
            </Link>
            
            <Link href="/">
                          <button className="w-full bg-theme-secondary hover:bg-theme-tertiary text-theme-primary py-3 px-6 rounded-lg font-bold flex items-center justify-center">
              <HomeIcon className="w-5 h-5 mr-2" />
              Continue Shopping
            </button>
            </Link>
          </div>

          {/* Support Info */}
          <div className="mt-8 pt-6 border-t border-theme">
            <p className="text-sm text-theme-muted">
              Need help? Contact us at{' '}
              <a href="mailto:support@ava.com" className="text-theme-primary hover:text-theme-secondary">
                support@ava.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 