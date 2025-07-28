# Stripe Integration Setup

This guide will help you set up Stripe payments in your application.

## Prerequisites

1. A Stripe account (free to create)
2. Access to Stripe Dashboard

## Setup Steps

### 1. Create Stripe Account

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Sign up for a free account
3. Complete your business profile
4. Get your API keys

### 2. Get API Keys

In your Stripe Dashboard:
1. Navigate to "Developers" → "API keys"
2. Copy your **Publishable key** and **Secret key**
3. For testing, use the test keys (start with `pk_test_` and `sk_test_`)
4. For production, use the live keys (start with `pk_live_` and `sk_live_`)

### 3. Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# For production, use:
# STRIPE_SECRET_KEY=sk_live_your_live_secret_key
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
# STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret
```

### 4. Webhook Setup

1. In Stripe Dashboard, go to "Developers" → "Webhooks"
2. Click "Add endpoint"
3. Set the endpoint URL to: `https://yourdomain.com/api/stripe/webhook`
4. Select these events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the webhook signing secret to your environment variables

### 5. Testing

For testing, use Stripe's test card numbers:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`

## Features

The Stripe integration includes:

- **Card Payments**: Secure credit/debit card processing
- **Apple Pay**: Native Apple Pay support
- **Order Management**: Automatic order creation and status updates
- **Stock Management**: Automatic inventory updates
- **Webhook Processing**: Real-time payment status updates
- **Error Handling**: Comprehensive error handling and user feedback

## API Endpoints

- `POST /api/stripe/create-checkout-session`: Creates Stripe checkout session
- `POST /api/stripe/webhook`: Processes Stripe webhooks
- `POST /api/stripe/create-payment-intent`: Creates payment intents (for Apple Pay)

## Payment Flow

1. **User fills checkout form** with shipping information
2. **Order is created** in database (pending payment)
3. **Stripe checkout session** is created with order details
4. **User is redirected** to Stripe's hosted checkout page
5. **Payment is processed** securely by Stripe
6. **Webhook updates** order status and inventory
7. **User is redirected** to success page

## Security Features

- **Server-side validation**: All payments validated on server
- **Webhook verification**: Ensures webhook authenticity
- **Order validation**: Checks stock and pricing on server
- **HTTPS required**: All communications encrypted
- **PCI compliance**: Stripe handles sensitive card data

## Testing Checklist

- [ ] Test successful payment flow
- [ ] Test payment decline scenarios
- [ ] Test webhook processing
- [ ] Test order status updates
- [ ] Test inventory updates
- [ ] Test error handling
- [ ] Test mobile responsiveness

## Common Issues

### "Stripe is not configured"
- Check your environment variables
- Ensure keys are correct for your environment (test/live)

### "Webhook signature verification failed"
- Verify webhook secret in environment variables
- Check webhook endpoint URL in Stripe dashboard

### "Order not found"
- Check webhook processing
- Verify order creation in checkout session

### "Payment failed"
- Check Stripe dashboard for payment details
- Verify card details and billing information

## Production Checklist

- [ ] Switch to live Stripe keys
- [ ] Update webhook endpoint to production URL
- [ ] Test with real payment methods
- [ ] Set up monitoring and alerts
- [ ] Configure proper error logging
- [ ] Test webhook reliability

## Support

For Stripe-specific issues:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com/)

For application-specific issues, check:
- Server logs for webhook processing
- Browser console for frontend errors
- Stripe dashboard for payment details

## Monitoring

Monitor these key metrics:
- Payment success rate
- Webhook delivery success
- Order processing time
- Error rates and types

Set up alerts for:
- Failed payments
- Webhook failures
- High error rates
- Unusual payment patterns 