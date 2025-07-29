'use client'

import React from 'react'
import { Button } from '@/components/ui'

interface LinkPayButtonProps {
  amount: number
  currency: string
  onSuccess: () => void
  onError: (error: string) => void
  disabled?: boolean
  className?: string
}

const LinkPayButton: React.FC<LinkPayButtonProps> = ({
  amount,
  currency,
  onSuccess,
  onError,
  disabled = false,
  className = ''
}) => {
  const handleLinkPayment = async () => {
    try {
      // Create a payment intent for Link
      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          currency: currency,
          payment_method_types: ['link'],
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment intent')
      }

      // Redirect to Stripe Link hosted page
      if (data.clientSecret) {
        // For Link, we'll use Stripe's hosted payment page
        const stripe = await import('@stripe/stripe-js').then(m => m.loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!))
        
        if (stripe) {
          const { error } = await stripe.redirectToCheckout({
            mode: 'payment',
            lineItems: [{
              price: 'price_link', // You'll need to create this price in Stripe
              quantity: 1,
            }],
            successUrl: `${window.location.origin}/orders/success?success=true`,
            cancelUrl: `${window.location.origin}/cart`,
          })

          if (error) {
            onError(error.message || 'Payment failed')
          }
        } else {
          onError('Stripe failed to load')
        }
      }
    } catch (error) {
      console.error('Link payment error:', error)
      onError('Payment failed. Please try again.')
    }
  }

  return (
    <Button
      onClick={handleLinkPayment}
      disabled={disabled}
      className={`btn-secondary w-full py-3 text-lg font-medium ${className}`}
    >
      <div className="flex items-center justify-center">
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        Pay with Link
      </div>
    </Button>
  )
}

export default LinkPayButton 