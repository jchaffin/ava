'use client'

import React, { useState } from 'react'
import GooglePayButton from '@/components/GooglePayButton'
import toast from 'react-hot-toast'

export default function TestGooglePayPage() {
  const [testAmount, setTestAmount] = useState(10.00)

  const handleSuccess = () => {
    toast.success('Google Pay test payment successful!')
    console.log('Google Pay test payment completed')
  }

  const handleError = (error: string) => {
    toast.error(`Google Pay test failed: ${error}`)
    console.error('Google Pay test error:', error)
  }

  return (
    <div className="min-h-screen bg-theme-primary py-8">
      <div className="container mx-auto px-4 max-w-md">
        <div className="card p-6">
          <h1 className="text-2xl font-bold text-theme-primary mb-6">Google Pay Test</h1>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Test Amount ($)</label>
            <input
              type="number"
              value={testAmount}
              onChange={(e) => setTestAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              min="0.01"
              step="0.01"
            />
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Environment Variables:</h3>
            <div className="text-sm space-y-1">
              <p>NODE_ENV: {process.env.NODE_ENV}</p>
              <p>STRIPE_MERCHANT_ID: {process.env.NEXT_PUBLIC_STRIPE_MERCHANT_ID ? 'Set' : 'Using test merchant ID'}</p>
              <p>STRIPE_PUBLISHABLE_KEY: {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'Set' : 'Not set'}</p>
              <p className="text-xs text-gray-500">
                Merchant ID being used: {process.env.NEXT_PUBLIC_STRIPE_MERCHANT_ID || 'acct_test_1234567890abcdef'}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Google Pay Button:</h3>
            <GooglePayButton
              amount={testAmount}
              currency="usd"
              onSuccess={handleSuccess}
              onError={handleError}
              className="mb-4"
            />
          </div>

          <div className="text-sm text-theme-secondary">
            <p className="mb-2">This is a test page to debug Google Pay integration.</p>
            <p>Check the browser console for detailed logs.</p>
          </div>
        </div>
      </div>
    </div>
  )
} 