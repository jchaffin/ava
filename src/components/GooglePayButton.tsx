'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui'

// Google Pay API types
declare global {
  interface Window {
    google?: {
      payments: {
        api: {
          PaymentsClient: new (options: { environment: string }) => {
            createButton: (options: any) => HTMLElement
            loadPaymentData: (request: any) => Promise<any>
            expressCheckout: (options: any) => Promise<any>
          }
        }
      }
    }
  }
}

interface GooglePayButtonProps {
  amount: number
  currency: string
  onSuccess: () => void
  onError: (error: string) => void
  disabled?: boolean
  className?: string
}

const GooglePayButton: React.FC<GooglePayButtonProps> = ({
  amount,
  currency,
  onSuccess,
  onError,
  disabled = false,
  className = ''
}) => {
  const googlePayRef = useRef<HTMLDivElement>(null)
  const [isGooglePayAvailable, setIsGooglePayAvailable] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const paymentsClientRef = useRef<any>(null)

  // Load Google Pay API script
  useEffect(() => {
    const loadGooglePayScript = () => {
      if (typeof window === 'undefined') return

      // Check if script is already loaded
      if (window.google?.payments?.api?.PaymentsClient) {
        console.log('Google Pay API already loaded')
        setIsGooglePayAvailable(true)
        setIsLoading(false)
        return
      }

      // Log environment variables for debugging
      console.log('Google Pay Environment Check:', {
        NODE_ENV: process.env.NODE_ENV,
        STRIPE_MERCHANT_ID: process.env.NEXT_PUBLIC_STRIPE_MERCHANT_ID ? 'Set' : 'Using test merchant ID',
        STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'Set' : 'Not set',
        MERCHANT_ID_BEING_USED: process.env.NEXT_PUBLIC_STRIPE_MERCHANT_ID || 'acct_test_1234567890abcdef'
      })

      // Load the Google Pay API script
      const script = document.createElement('script')
      script.src = 'https://pay.google.com/gp/p/js/pay.js'
      script.async = true
      script.onload = () => {
        console.log('Google Pay API script loaded')
        // Wait a bit for the API to initialize
        setTimeout(() => {
          if (window.google?.payments?.api?.PaymentsClient) {
            console.log('Google Pay API is available')
            setIsGooglePayAvailable(true)
          } else {
            console.log('Google Pay API not available after script load')
            setIsGooglePayAvailable(false)
          }
          setIsLoading(false)
        }, 1000)
      }
      script.onerror = () => {
        console.error('Failed to load Google Pay API script')
        setIsGooglePayAvailable(false)
        setIsLoading(false)
      }
      document.head.appendChild(script)
    }

    loadGooglePayScript()
  }, [])

  useEffect(() => {
    if (!isGooglePayAvailable || !googlePayRef.current || disabled) return

    // Additional check to ensure API is fully loaded
    if (!window.google?.payments?.api?.PaymentsClient) {
      console.error('Google Pay API not fully loaded')
      setIsGooglePayAvailable(false)
      return
    }

    const baseRequest = {
      apiVersion: 2,
      apiVersionMinor: 0
    }

    const allowedCardNetworks = ['MASTERCARD', 'VISA']
    const allowedCardAuthMethods = ['PAN_ONLY', 'CRYPTOGRAM_3DS']

    const baseCardPaymentMethod = {
      type: 'CARD',
      parameters: {
        allowedAuthMethods: allowedCardAuthMethods,
        allowedCardNetworks: allowedCardNetworks
      }
    }

    // Use a test merchant ID for development if environment variable is not set
    const merchantId = process.env.NEXT_PUBLIC_STRIPE_MERCHANT_ID || 'acct_test_1234567890abcdef'
    
    const cardPaymentMethod = Object.assign(
      { tokenizationSpecification: { type: 'PAYMENT_GATEWAY', parameters: { gateway: 'stripe', gatewayMerchantId: merchantId } } },
      baseCardPaymentMethod
    )

    try {
      console.log('Creating Google Pay PaymentsClient...')
      
      // Additional check to ensure API is fully loaded
      if (!window.google?.payments?.api?.PaymentsClient) {
        console.error('Google Pay API not fully loaded - PaymentsClient constructor not available')
        setIsGooglePayAvailable(false)
        return
      }
      
      const paymentsClient = new window.google!.payments.api.PaymentsClient({
        environment: process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'TEST'
      })
      
      console.log('PaymentsClient created successfully')
      console.log('PaymentsClient object:', paymentsClient)
      console.log('Available methods:', Object.getOwnPropertyNames(paymentsClient))
      
      // Store the client reference
      paymentsClientRef.current = paymentsClient

      // Create the payment data request
      const paymentDataRequest = {
        ...baseRequest,
        allowedPaymentMethods: [cardPaymentMethod],
        transactionInfo: {
          totalPriceStatus: 'FINAL',
          totalPriceLabel: 'Total',
          totalPrice: amount.toString(),
          currencyCode: currency.toUpperCase(),
          countryCode: 'US'
        },
        merchantInfo: {
          merchantName: 'Ava Skincare'
        },
        callbackIntents: ['PAYMENT_AUTHORIZATION'],
        paymentDataCallbacks: {
          onPaymentDataChanged: (paymentData: any) => {
            console.log('Payment data changed:', paymentData)
            return Promise.resolve({
              newTransactionInfo: {
                totalPriceStatus: 'FINAL',
                totalPrice: amount.toString(),
                currencyCode: currency.toUpperCase(),
                countryCode: 'US'
              }
            })
          }
        }
      }

      const button = paymentsClient.createButton({
        allowedPaymentMethods: [baseCardPaymentMethod],
        onClick: () => {
          paymentsClient.loadPaymentData(paymentDataRequest)
            .then((paymentData) => {
              console.log('Google Pay success:', paymentData)
              onSuccess()
            })
            .catch((err) => {
              if (err.statusCode === 'CANCELED') {
                console.log('User canceled')
              } else {
                console.error('Google Pay error:', err)
                onError(err.message || 'Payment failed')
              }
            })
        }
      })

      if (googlePayRef.current) {
        googlePayRef.current.innerHTML = ''
        googlePayRef.current.appendChild(button)
      }
    } catch (error) {
      console.error('Error initializing Google Pay:', error)
      setIsGooglePayAvailable(false)
    }

    return () => {
      if (googlePayRef.current) {
        googlePayRef.current.innerHTML = ''
      }
      // Clear references
      paymentsClientRef.current = null
    }
  }, [amount, currency, onSuccess, onError, disabled, isGooglePayAvailable])

  // Show loading state
  if (isLoading) {
    return (
      <Button
        disabled={true}
        variant="secondary"
        className={`w-full py-3 text-lg font-medium ${className}`}
      >
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2"></div>
          Loading Google Pay...
        </div>
      </Button>
    )
  }

  // Show fallback button if Google Pay is not available
  if (!isGooglePayAvailable) {
    return (
      <Button
        disabled={disabled}
        variant="secondary"
        className={`w-full py-3 text-lg font-medium opacity-60 ${className}`}
        onClick={() => onError('Google Pay is not available in your browser')}
      >
        <div className="flex items-center justify-center">
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google Pay Unavailable
        </div>
      </Button>
    )
  }

  return (
    <div className="flex justify-center items-center w-full">
      <div ref={googlePayRef} className={`${className} w-full flex justify-center items-center google-pay-button`} />
    </div>
  )
}

export default GooglePayButton 