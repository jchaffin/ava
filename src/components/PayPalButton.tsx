'use client'

import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

interface PayPalButtonProps {
  amount: number
  currency: string
  onSuccess: (paymentResult: any) => void
  onError: (error: string) => void
  disabled?: boolean
  className?: string
}

declare global {
  interface Window {
    paypal?: any
  }
}

export default function PayPalButton({
  amount,
  currency,
  onSuccess,
  onError,
  disabled = false,
  className = ''
}: PayPalButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [paypalLoaded, setPaypalLoaded] = useState(false)

  useEffect(() => {
    // Load PayPal SDK
    const loadPayPal = async () => {
      if (window.paypal) {
        setPaypalLoaded(true)
        return
      }

      // Set a timeout to prevent indefinite loading
      const timeoutId = setTimeout(() => {
        console.warn('PayPal SDK loading timeout - PayPal button will be hidden')
        setPaypalLoaded(false)
      }, 10000) // 10 second timeout

      try {
        const script = document.createElement('script')
        script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=${currency}`
        script.async = true
        script.onload = () => {
          clearTimeout(timeoutId)
          setPaypalLoaded(true)
        }
        script.onerror = () => {
          clearTimeout(timeoutId)
          console.warn('PayPal SDK failed to load - PayPal button will be hidden')
          setPaypalLoaded(false)
        }
        document.body.appendChild(script)
      } catch (error) {
        clearTimeout(timeoutId)
        console.warn('Error loading PayPal SDK - PayPal button will be hidden:', error)
        setPaypalLoaded(false)
      }
    }

    loadPayPal()
  }, [currency])

  const handlePayPalPayment = async () => {
    if (!window.paypal || disabled || isLoading) {
      return
    }

    setIsLoading(true)

    try {
      // Create PayPal order on your server
      const response = await fetch('/api/paypal/create-order', {
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
        throw new Error(data.error || 'Failed to create PayPal order')
      }

      // Open PayPal modal
      window.paypal.Buttons({
        createOrder: () => {
          return data.orderID
        },
        onApprove: async (data: any, actions: any) => {
          try {
            // Capture the payment
            const captureResponse = await fetch('/api/paypal/capture-order', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                orderID: data.orderID,
              }),
            })

            const captureData = await captureResponse.json()

            if (!captureResponse.ok) {
              throw new Error(captureData.error || 'Payment capture failed')
            }

            // Payment successful
            onSuccess(captureData)
            toast.success('Payment successful!')
          } catch (error) {
            console.error('Payment capture error:', error)
            onError(error instanceof Error ? error.message : 'Payment failed')
            toast.error('Payment failed')
          }
        },
        onError: (err: any) => {
          console.error('PayPal error:', err)
          onError('PayPal payment failed')
          toast.error('PayPal payment failed')
        },
        onCancel: () => {
          toast.error('Payment cancelled')
        },
      }).render('#paypal-button-container')

    } catch (error) {
      console.error('PayPal payment error:', error)
      onError(error instanceof Error ? error.message : 'Payment failed')
      toast.error('Payment failed')
    } finally {
      setIsLoading(false)
    }
  }

  // Don't render anything if PayPal failed to load or is still loading
  if (!paypalLoaded) {
    return null
  }

  return (
    <div className={`${className} paypal-button`}>
      <div id="paypal-button-container"></div>
    </div>
  )
} 