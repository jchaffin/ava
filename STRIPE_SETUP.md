# Stripe Integration Setup Guide

This guide will help you set up Stripe payment processing for your AVA skincare e-commerce application.

## Prerequisites

1. A Stripe account (sign up at [stripe.com](https://stripe.com))
2. Node.js and npm installed
3. Your AVA application running

## Step 1: Install Dependencies

The required packages have already been installed:
- `stripe` - Server-side Stripe SDK
- `@stripe/stripe-js` - Client-side Stripe SDK

## Step 2: Configure Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Apple Pay Configuration
NEXT_PUBLIC_DOMAIN=localhost:3000
```

### Getting Your Stripe Keys

1. **Log into your Stripe Dashboard**
2. **Go to Developers → API Keys**
3. **Copy your publishable key and secret key**
4. **For webhook secret, go to Developers → Webhooks**

## Step 3: Set Up Webhooks

### Create Webhook Endpoint

1. In your Stripe Dashboard, go to **Developers → Webhooks**
2. Click **Add endpoint**
3. Set the endpoint URL to: `https://yourdomain.com/api/stripe/webhook`
4. Select the following events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

## Step 4: Set Up Apple Pay

### Enable Apple Pay in Stripe

1. In your Stripe Dashboard, go to **Settings → Payment methods**
2. Enable **Apple Pay**
3. Add your domain to the allowed domains list
4. Download your Apple Pay merchant identity certificate

### Configure Apple Pay Domain

1. In your Stripe Dashboard, go to **Settings → Apple Pay**
2. Add your domain: `yourdomain.com`
3. Download the `.well-known/apple-developer-merchantid-domain-association` file
4. Place this file in your `public/.well-known/` directory

### Update Environment Variables

Add your domain to the environment variables:
```bash
NEXT_PUBLIC_DOMAIN=yourdomain.com
```

### Get Webhook Secret

1. After creating the webhook, click on it
2. Copy the **Signing secret** (starts with `whsec_`)
3. Add it to your `.env.local` as `STRIPE_WEBHOOK_SECRET`

## Step 4: Test the Integration

### Test Mode

1. **Use test keys** for development
2. **Test card numbers** you can use:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - 3D Secure: `4000 0025 0000 3155`

### Testing Flow

1. Add products to cart
2. Go to checkout
3. Fill in test card details
4. Complete payment
5. Check webhook events in Stripe Dashboard

## Step 5: Production Deployment

### Switch to Live Keys

1. **Replace test keys with live keys** in production
2. **Update webhook endpoint** to production URL
3. **Test with real cards** (small amounts)

### Security Considerations

- **Never commit API keys** to version control
- **Use environment variables** for all sensitive data
- **Enable webhook signature verification**
- **Monitor webhook events** for failures

## Features Implemented

### ✅ Payment Processing
- **Stripe Checkout** - Redirect-based checkout
- **Payment Intents** - Server-side payment processing
- **Apple Pay** - Native Apple Pay integration
- **Webhook Handling** - Real-time payment status updates

### ✅ Order Management
- **Order Creation** - Automatic order creation on payment
- **Status Updates** - Real-time order status tracking
- **Customer Management** - Stripe customer creation

### ✅ User Experience
- **Seamless Checkout** - Branded checkout experience
- **Success Pages** - Payment confirmation
- **Error Handling** - Graceful error management
- **Loading States** - User feedback during processing

### ✅ Security
- **Webhook Verification** - Signature validation
- **Authentication** - User verification required
- **Input Validation** - Server-side validation
- **Error Logging** - Comprehensive error tracking

## API Endpoints

### `/api/stripe/create-payment-intent`
- **Method**: POST
- **Purpose**: Create payment intent for custom checkout
- **Body**: `{ amount: number, currency: string }`

### `/api/stripe/create-checkout-session`
- **Method**: POST
- **Purpose**: Create Stripe Checkout session
- **Body**: `{ lineItems, mode, successUrl, cancelUrl, metadata }`

### `/api/stripe/webhook`
- **Method**: POST
- **Purpose**: Handle Stripe webhook events
- **Headers**: `stripe-signature` required

### `/api/stripe/validate-merchant`
- **Method**: POST
- **Purpose**: Validate Apple Pay merchant session
- **Body**: `{ validationURL: string }`

### `/api/stripe/process-apple-pay`
- **Method**: POST
- **Purpose**: Process Apple Pay payments
- **Body**: `{ paymentIntentId: string, token: object }`

## File Structure

```
src/
├── lib/
│   └── stripe.ts              # Stripe configuration and utilities
├── app/
│   ├── api/stripe/
│   │   ├── create-payment-intent/
│   │   │   └── route.ts       # Payment intent API
│   │   ├── create-checkout-session/
│   │   │   └── route.ts       # Checkout session API
│   │   ├── validate-merchant/
│   │   │   └── route.ts       # Apple Pay merchant validation
│   │   ├── process-apple-pay/
│   │   │   └── route.ts       # Apple Pay payment processing
│   │   └── webhook/
│   │       └── route.ts       # Webhook handler
│   ├── checkout/
│   │   └── page.tsx           # Checkout page
│   └── orders/success/
│       └── page.tsx           # Payment success page
└── components/
    ├── CheckoutForm.tsx       # Checkout form component
    └── ApplePayButton.tsx     # Apple Pay button component
```

## Troubleshooting

### Common Issues

1. **Webhook Not Receiving Events**
   - Check webhook endpoint URL
   - Verify webhook secret
   - Check server logs for errors

2. **Payment Intent Creation Fails**
   - Verify Stripe secret key
   - Check amount format (must be in cents)
   - Ensure user is authenticated

3. **Checkout Session Not Redirecting**
   - Verify publishable key
   - Check success/cancel URLs
   - Ensure line items are valid

### Debug Mode

Enable Stripe debug mode by adding to your environment:
```bash
STRIPE_DEBUG=true
```

### Logs

Check your server logs for detailed error messages and webhook events.

## Support

- **Stripe Documentation**: [stripe.com/docs](https://stripe.com/docs)
- **Stripe Support**: [support.stripe.com](https://support.stripe.com)
- **Webhook Testing**: Use Stripe CLI for local testing

## Next Steps

1. **Customize checkout styling** to match your brand
2. **Add subscription support** for recurring payments
3. **Implement saved payment methods**
4. **Add payment analytics** and reporting
5. **Set up email notifications** for order confirmations

---

**Note**: Always test thoroughly in Stripe's test mode before going live with real payments. 