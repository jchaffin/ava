'use client'

import React, { useEffect, useRef } from 'react'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null

interface StripeExpressCheckoutProps {
  amount: number
  currency: string
  onSuccess: () => void
  onError: (error: string) => void
  disabled?: boolean
  className?: string
}

const StripeExpressCheckout: React.FC<StripeExpressCheckoutProps> = ({
  amount,
  currency,
  onSuccess,
  onError,
  disabled = false,
  className = ''
}) => {
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!stripePromise || !elementRef.current || disabled) return

    const initializeExpressCheckout = async () => {
      try {
        const stripe = await stripePromise
        if (!stripe) {
          onError('Stripe not loaded')
          return
        }

        const expressCheckoutOptions = {
          buttonType: {
            applePay: 'buy',
            googlePay: 'buy',
          }
        }

        const elements = stripe.elements({
          locale: 'en',
          mode: 'payment',
          amount: Math.round(amount * 100),
          currency: currency.toLowerCase(),
        })

        const expressCheckoutElement = (elements as any).create('expressCheckout', expressCheckoutOptions)
        
        expressCheckoutElement.on('paymentmethod', (event: any) => {
          console.log('Payment method received:', event)
          onSuccess()
        })

        expressCheckoutElement.on('cancel', () => {
          console.log('Payment canceled')
        })

        expressCheckoutElement.on('error', (event: any) => {
          console.error('Payment error:', event)
          onError(event.error?.message || 'Payment failed')
        })

        expressCheckoutElement.mount('#express-checkout-element')

      } catch (error) {
        console.error('Error initializing express checkout:', error)
        onError('Failed to initialize payment')
      }
    }

    initializeExpressCheckout()
  }, [amount, currency, onSuccess, onError, disabled])

  if (!stripePromise) {
    return (
      <div className="w-full py-3 px-4 bg-theme-tertiary text-theme-muted rounded-lg text-center">
        Stripe not configured
      </div>
    )
  }

  return (
    <div className={className}>
      <div id="express-checkout-element" ref={elementRef} className="w-full" />
    </div>
  )
}

export default StripeExpressCheckout 