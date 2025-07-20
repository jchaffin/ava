# PayPal Integration Setup

This guide will help you set up PayPal payments in your application.

## Prerequisites

1. A PayPal Business account
2. Access to PayPal Developer Dashboard

## Setup Steps

### 1. Create PayPal App

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/)
2. Sign in with your PayPal Business account
3. Navigate to "Apps & Credentials"
4. Click "Create App"
5. Choose "Business" app type
6. Give your app a name (e.g., "Ava Store")
7. Click "Create App"

### 2. Get Credentials

After creating the app, you'll get:
- **Client ID**: Used for frontend PayPal SDK
- **Client Secret**: Used for backend API calls

### 3. Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# PayPal Configuration
PAYPAL_CLIENT_ID=your_paypal_client_id_here
PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id_here

# For production, also add:
# PAYPAL_CLIENT_ID=your_live_client_id
# PAYPAL_CLIENT_SECRET=your_live_client_secret
# NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_live_client_id
```

### 4. Testing

For testing, use PayPal's Sandbox environment:
- Use sandbox credentials
- Test with sandbox PayPal accounts
- No real money will be charged

### 5. Production

For production:
1. Switch to Live environment in PayPal Developer Dashboard
2. Update environment variables with live credentials
3. Ensure your domain is approved in PayPal settings

## Features

The PayPal integration includes:

- **PayPal Button**: Renders PayPal's official checkout button
- **Order Creation**: Creates PayPal orders on your server
- **Payment Capture**: Captures payments after user approval
- **Error Handling**: Comprehensive error handling and user feedback
- **Authentication**: Secure token management for API calls

## API Endpoints

- `POST /api/paypal/create-order`: Creates a PayPal order
- `POST /api/paypal/capture-order`: Captures a PayPal payment

## Usage

The PayPal button is automatically included in the checkout form and will:

1. Load PayPal SDK dynamically
2. Create orders on your server
3. Handle payment capture
4. Redirect to success page on completion
5. Show appropriate error messages

## Security Notes

- Never expose your PayPal Client Secret in frontend code
- Always validate payments on your server
- Use HTTPS in production
- Implement proper error handling
- Log payment events for debugging

## Troubleshooting

### Common Issues

1. **"Failed to load PayPal"**: Check your `NEXT_PUBLIC_PAYPAL_CLIENT_ID`
2. **"Authentication required"**: Ensure user is logged in
3. **"Failed to create PayPal order"**: Check server logs and PayPal credentials
4. **"Payment capture failed"**: Verify order ID and PayPal API status

### Debug Mode

Enable debug logging by setting:
```bash
NODE_ENV=development
```

This will log detailed PayPal API responses to help with troubleshooting.

## Support

For PayPal-specific issues:
- [PayPal Developer Documentation](https://developer.paypal.com/docs/)
- [PayPal Support](https://www.paypal.com/support/)

For application-specific issues, check the server logs and browser console for detailed error messages. 