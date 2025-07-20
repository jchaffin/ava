'use client'

import React from 'react'

export default function TestStripePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Stripe Configuration Test</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Environment Variables:</h2>
          <p>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? '✅ Set' : '❌ Not set'}</p>
          <p>STRIPE_SECRET_KEY: {process.env.STRIPE_SECRET_KEY ? '✅ Set' : '❌ Not set'}</p>
          <p>NEXT_PUBLIC_DOMAIN: {process.env.NEXT_PUBLIC_DOMAIN || '❌ Not set'}</p>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold">Stripe Keys (first 10 chars):</h2>
          <p>Publishable: {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 10) || 'Not set'}...</p>
          <p>Secret: {process.env.STRIPE_SECRET_KEY?.substring(0, 10) || 'Not set'}...</p>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold">Browser Info:</h2>
          <p>User Agent: {typeof window !== 'undefined' ? window.navigator.userAgent : 'Server side'}</p>
          <p>Apple Pay Available: {typeof window !== 'undefined' && window.ApplePaySession ? '✅ Yes' : '❌ No'}</p>
        </div>
      </div>
    </div>
  )
} 