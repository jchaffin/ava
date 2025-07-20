'use client'

import React, { useEffect, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'

// Apple Pay type declarations
declare global {
  interface Window {
    ApplePaySession?: {
      canMakePayments(): boolean
      canMakePaymentsWithActiveCard(merchantIdentifier: string): Promise<boolean>
      new (version: number, paymentRequest: any): ApplePaySession
      STATUS_SUCCESS: number
      STATUS_FAILURE: number
    }
  }
  
  interface ApplePaySession {
    begin(): void
    abort(): void
    completeMerchantValidation(merchantSession: any): void
    completePayment(status: number): void
    onvalidatemerchant: (event: any) => void
    onpaymentauthorized: (event: any) => void
    oncancel: () => void
  }
}

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null

interface ApplePayButtonProps {
  amount: number
  currency?: string
  onSuccess?: (paymentIntent: any) => void
  onError?: (error: string) => void
  disabled?: boolean
}

// Apple Pay button styling
const applePayButtonStyle = {
  WebkitAppearance: '-apple-pay-button',
  height: '40px',
  width: '100%',
  borderRadius: '8px',
  border: 'none',
  backgroundColor: 'black',
  color: 'white',
  fontSize: '16px',
  fontWeight: '600',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
} as React.CSSProperties

// Apple Pay button with fallback
const ApplePayButtonFallback: React.FC<ApplePayButtonProps> = ({
  amount,
  currency = 'usd',
  onSuccess,
  onError,
  disabled = false,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isApplePayAvailable, setIsApplePayAvailable] = useState(false)

  useEffect(() => {
    // Check if Apple Pay is available
    console.log('Checking Apple Pay availability...')
    console.log('Window ApplePaySession:', typeof window !== 'undefined' ? !!window.ApplePaySession : 'window undefined')
    
    if (typeof window !== 'undefined' && window.ApplePaySession) {
      const canMakePayments = window.ApplePaySession.canMakePayments()
      console.log('Apple Pay canMakePayments:', canMakePayments)
      setIsApplePayAvailable(canMakePayments)
    } else {
      console.log('Apple Pay not available - window.ApplePaySession is undefined')
      // For testing purposes, let's show the button anyway
      setIsApplePayAvailable(true)
    }
  }, [])

  const handleApplePayClick = async () => {
    if (!isApplePayAvailable || disabled) return

    setIsLoading(true)

    try {
      // Create payment intent with Apple Pay support
      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment intent')
      }

      // Initialize Apple Pay session
      const paymentRequest = {
        countryCode: 'US',
        currencyCode: currency.toUpperCase(),
        supportedNetworks: ['visa', 'masterCard', 'amex'],
        merchantCapabilities: ['supports3DS'],
        total: {
          label: 'AVA Skincare',
          amount: (amount * 100).toString(), // Convert to cents
        },
      }

      const session = new (window as any).ApplePaySession(3, paymentRequest)

      session.onvalidatemerchant = async (event: any) => {
        try {
          // Validate merchant with your server
          const validationResponse = await fetch('/api/stripe/validate-merchant', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              validationURL: event.validationURL,
            }),
          })

          const validationData = await validationResponse.json()

          if (validationResponse.ok) {
            session.completeMerchantValidation(validationData.merchantSession)
          } else {
            session.abort()
          }
        } catch (error) {
          console.error('Merchant validation error:', error)
          session.abort()
        }
      }

      session.onpaymentauthorized = async (event: any) => {
        try {
          // Process payment with Stripe
          const paymentResponse = await fetch('/api/stripe/process-apple-pay', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              paymentIntentId: data.paymentIntentId,
              token: event.payment.token,
            }),
          })

          const paymentData = await paymentResponse.json()

          if (paymentResponse.ok && window.ApplePaySession) {
            session.completePayment(window.ApplePaySession.STATUS_SUCCESS)
            onSuccess?.(paymentData.paymentIntent)
          } else if (window.ApplePaySession) {
            session.completePayment(window.ApplePaySession.STATUS_FAILURE)
            onError?.(paymentData.error || 'Payment failed')
          }
        } catch (error) {
          console.error('Payment processing error:', error)
          if (window.ApplePaySession) {
            session.completePayment(window.ApplePaySession.STATUS_FAILURE)
          }
          onError?.('Payment processing failed')
        }
      }

      session.oncancel = () => {
        onError?.('Payment cancelled')
      }

      session.begin()

    } catch (error) {
      console.error('Apple Pay error:', error)
      onError?.(error instanceof Error ? error.message : 'Apple Pay failed')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isApplePayAvailable) {
    // For testing, show a fallback button
    return (
      <button
        onClick={handleApplePayClick}
        disabled={disabled || isLoading}
        className="apple-pay-fallback-button"
        style={{
          height: '40px',
          width: '100%',
          borderRadius: '8px',
          border: 'none',
          backgroundColor: '#007AFF',
          color: 'white',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        {isLoading ? (
          <div className="loading-spinner"></div>
        ) : (
          <>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            Test Apple Pay (Fallback)
          </>
        )}
      </button>
    )
  }

  return (
    <button
      onClick={handleApplePayClick}
      disabled={disabled || isLoading}
      style={applePayButtonStyle}
      className="apple-pay-button"
    >
      {isLoading ? (
        <div className="loading-spinner"></div>
      ) : (
        <>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
          Pay
        </>
      )}
    </button>
  )
}

// Main Apple Pay button component
const ApplePayButton: React.FC<ApplePayButtonProps> = (props) => {
  return (
    <div className="apple-pay-container">
      <ApplePayButtonFallback {...props} />
      <style jsx>{`
        .apple-pay-container {
          width: 100%;
          margin: 8px 0;
        }
        
        .apple-pay-button {
          -webkit-appearance: -apple-pay-button;
          -apple-pay-button-type: plain;
          -apple-pay-button-style: black;
        }
        
        .apple-pay-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .loading-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default ApplePayButton 