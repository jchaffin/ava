import React, { useState } from 'react'
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import Button from './ui/Button'

interface StripeElementsFormProps {
  amount: number
  email: string
  onSuccess: (paymentIntent: any) => void
  onError: (error: string) => void
  disabled?: boolean
}

const StripeElementsForm: React.FC<StripeElementsFormProps> = ({ amount, email, onSuccess, onError, disabled }) => {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!stripe || !elements) return
    setIsLoading(true)

    const { error: submitError } = await elements.submit()
    if (submitError) {
      setError(submitError.message || 'Payment failed')
      setIsLoading(false)
      return
    }

    // Confirm payment
    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        receipt_email: email,
      },
      redirect: 'if_required',
    })

    if (confirmError) {
      setError(confirmError.message || 'Payment failed')
      onError(confirmError.message || 'Payment failed')
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onSuccess(paymentIntent)
    } else {
      setError('Payment was not successful')
      onError('Payment was not successful')
    }
    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="stripe-elements-theme-wrapper">
        <PaymentElement 
          options={{ 
            layout: 'tabs',
            fields: {
              billingDetails: {
                name: 'auto',
                email: 'auto',
                phone: 'auto',
                address: {
                  country: 'auto',
                  line1: 'auto',
                  line2: 'auto',
                  city: 'auto',
                  state: 'auto',
                  postalCode: 'auto',
                },
              },
            },
          }} 
        />
      </div>
      {error && <div className="text-red-400 text-sm mt-2">{error}</div>}
      <Button
        type="submit"
        variant="secondary"
        size="lg"
        className="w-full btn-secondary"
        disabled={isLoading || disabled || !stripe || !elements}
        loading={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-3">
            <div className="w-5 h-5 border-2 border-theme-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-lg">Processing...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span className="text-lg">Pay ${amount.toFixed(2)}</span>
          </div>
        )}
      </Button>
    </form>
  )
}

export default StripeElementsForm 