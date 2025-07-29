'use client'

import React, { useEffect, useState } from 'react'
import StripeExpressCheckout from '@/components/StripeExpressCheckout'
import toast from 'react-hot-toast'

export default function TestPaymentMethodsPage() {
  const [paymentMethods, setPaymentMethods] = useState<string[]>([])
  const [browserInfo, setBrowserInfo] = useState<any>({})

  useEffect(() => {
    // Check browser and device capabilities
    const info = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      vendor: navigator.vendor,
      isSafari: /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent),
      isChrome: /Chrome/.test(navigator.userAgent),
      isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      isHTTPS: window.location.protocol === 'https:',
      isLocalhost: window.location.hostname === 'localhost',
    }
    setBrowserInfo(info)

    // Check for Apple Pay availability
    if (window.ApplePaySession && window.ApplePaySession.canMakePayments()) {
      setPaymentMethods(prev => [...prev, 'Apple Pay Available'])
    } else {
      setPaymentMethods(prev => [...prev, 'Apple Pay Not Available'])
    }

    // Check for Google Pay availability
    if (window.google?.payments?.api?.PaymentsClient) {
      setPaymentMethods(prev => [...prev, 'Google Pay API Available'])
    } else {
      setPaymentMethods(prev => [...prev, 'Google Pay API Not Available'])
    }

  }, [])

  const handleSuccess = () => {
    toast.success('Payment successful!')
  }

  const handleError = (error: string) => {
    toast.error(`Payment failed: ${error}`)
  }

  return (
    <div className="min-h-screen bg-theme-secondary py-8">
      <div className="container bg-theme-tertiary mx-auto px-4 max-w-4xl">
        <div className="card p-6">
          <h1 className="text-2xl font-bold text-theme-primary mb-6">Payment Methods Test</h1>
          
          {/* Browser Information */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Browser Information:</h3>
            <div className="text-sm space-y-1">
              <p>User Agent: {browserInfo.userAgent}</p>
              <p>Platform: {browserInfo.platform}</p>
              <p>Is Safari: {browserInfo.isSafari ? 'Yes' : 'No'}</p>
              <p>Is Chrome: {browserInfo.isChrome ? 'Yes' : 'No'}</p>
              <p>Is Mobile: {browserInfo.isMobile ? 'Yes' : 'No'}</p>
              <p>Is HTTPS: {browserInfo.isHTTPS ? 'Yes' : 'No'}</p>
              <p>Is Localhost: {browserInfo.isLocalhost ? 'Yes' : 'No'}</p>
            </div>
          </div>

          {/* Payment Methods Status */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Payment Methods Status:</h3>
            <div className="text-sm space-y-1">
              {paymentMethods.map((method, index) => (
                <p key={index} className={method.includes('Available') ? 'text-green-600' : 'text-red-600'}>
                  {method}
                </p>
              ))}
            </div>
          </div>

          {/* Environment Variables */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Environment Variables:</h3>
            <div className="text-sm space-y-1">
              <p>NODE_ENV: {process.env.NODE_ENV}</p>
              <p>STRIPE_MERCHANT_ID: {process.env.NEXT_PUBLIC_STRIPE_MERCHANT_ID ? 'Set' : 'Not set'}</p>
              <p>STRIPE_PUBLISHABLE_KEY: {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'Set' : 'Not set'}</p>
            </div>
          </div>

          {/* Stripe Express Checkout Test */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Stripe Express Checkout Test:</h3>
            <StripeExpressCheckout
              amount={10.00}
              currency="usd"
              onSuccess={handleSuccess}
              onError={handleError}
              className="mb-4"
            />
          </div>

          {/* Troubleshooting Tips */}
          <div className="text-sm text-theme-secondary">
            <h3 className="text-lg font-medium mb-2">Troubleshooting Tips:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Apple Pay only works on Safari (macOS/iOS)</li>
              <li>Google Pay only works on Chrome/Android</li>
              <li>Both require HTTPS in production</li>
              <li>User must have payment methods set up in their wallet</li>
              <li>Check browser console for detailed logs</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 