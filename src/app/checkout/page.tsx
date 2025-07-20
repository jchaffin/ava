import React from 'react'
import CheckoutForm from '@/components/CheckoutForm'
import { ProtectedRoute } from '@/context/AuthContext'

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
            <p className="text-gray-600 mt-2">Complete your purchase</p>
          </div>
          
          <CheckoutForm />
        </div>
      </div>
    </ProtectedRoute>
  )
} 