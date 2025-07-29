import Stripe from 'stripe'
import { loadStripe } from '@stripe/stripe-js'

// Initialize Stripe server-side
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16',
  typescript: true,
})

// Initialize Stripe client-side
export const getStripe = () => {
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    console.warn('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined')
    return null
  }
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
}

// Create payment intent
export const createPaymentIntent = async (amount: number, currency: string = 'usd') => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
    })
    
    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    }
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create payment intent',
    }
  }
}

// Create checkout session with Apple Pay support
export const createCheckoutSession = async (params: {
  lineItems: Array<{
    price_data: {
      currency: string
      product_data: {
        name: string
        description?: string
        images?: string[]
      }
      unit_amount: number
    }
    quantity: number
  }>
  mode: 'payment' | 'subscription'
  successUrl: string
  cancelUrl: string
  customerEmail?: string
  metadata?: Record<string, string>
}) => {
  try {
    const session = await stripe.checkout.sessions.create({
      line_items: params.lineItems,
      mode: params.mode,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      customer_email: params.customerEmail,
      metadata: params.metadata,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU'],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 0,
              currency: 'usd',
            },
            display_name: 'Free shipping',
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 5,
              },
              maximum: {
                unit: 'business_day',
                value: 7,
              },
            },
          },
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 1000, // $10.00
              currency: 'usd',
            },
            display_name: 'Express shipping',
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 1,
              },
              maximum: {
                unit: 'business_day',
                value: 3,
              },
            },
          },
        },
      ],
    })
    
    return {
      success: true,
      sessionId: session.id,
      url: session.url,
    }
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create checkout session',
    }
  }
}

// Create payment intent with Apple Pay support
export const createPaymentIntentWithApplePay = async (params: {
  amount: number
  currency: string
  customerEmail?: string
  metadata?: Record<string, string>
}) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(params.amount * 100),
      currency: params.currency,
      metadata: params.metadata,
      payment_method_types: ['card', 'apple_pay'],
      automatic_payment_methods: {
        enabled: true,
      },
    })
    
    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    }
  } catch (error) {
    console.error('Error creating payment intent with Apple Pay:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create payment intent',
    }
  }
}

// Retrieve payment intent
export const retrievePaymentIntent = async (paymentIntentId: string) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    return {
      success: true,
      paymentIntent,
    }
  } catch (error) {
    console.error('Error retrieving payment intent:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve payment intent',
    }
  }
}

// Create customer
export const createCustomer = async (params: {
  email: string
  name?: string
  phone?: string
  address?: {
    city?: string
    country?: string
    line1?: string
    line2?: string
    postal_code?: string
    state?: string
  }
  metadata?: Record<string, string>
}) => {
  try {
    const customer = await stripe.customers.create({
      email: params.email,
      name: params.name,
      phone: params.phone,
      address: params.address,
      metadata: params.metadata,
    })
    
    return {
      success: true,
      customer,
    }
  } catch (error) {
    console.error('Error creating customer:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create customer',
    }
  }
}

// Create product
export const createProduct = async (params: {
  name: string
  description?: string
  images?: string[]
  metadata?: Record<string, string>
}) => {
  try {
    const product = await stripe.products.create({
      name: params.name,
      description: params.description,
      images: params.images,
      metadata: params.metadata,
    })
    
    return {
      success: true,
      product,
    }
  } catch (error) {
    console.error('Error creating product:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create product',
    }
  }
}

// Create price
export const createPrice = async (params: {
  productId: string
  unitAmount: number
  currency: string
  recurring?: {
    interval: 'day' | 'week' | 'month' | 'year'
    intervalCount?: number
  }
  metadata?: Record<string, string>
}) => {
  try {
    const price = await stripe.prices.create({
      product: params.productId,
      unit_amount: Math.round(params.unitAmount * 100), // Convert to cents
      currency: params.currency,
      recurring: params.recurring,
      metadata: params.metadata,
    })
    
    return {
      success: true,
      price,
    }
  } catch (error) {
    console.error('Error creating price:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create price',
    }
  }
}

// Verify webhook signature
export const verifyWebhookSignature = (payload: string, signature: string, secret: string) => {
  try {
    const event = stripe.webhooks.constructEvent(payload, signature, secret)
    return {
      success: true,
      event,
    }
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Webhook signature verification failed',
    }
  }
}

// Format amount for display
export const formatAmount = (amount: number, currency: string = 'usd') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100) // Convert from cents
}

// Convert amount to cents
export const toCents = (amount: number) => {
  return Math.round(amount * 100)
}

// Convert cents to dollars
export const fromCents = (cents: number) => {
  return cents / 100
} 