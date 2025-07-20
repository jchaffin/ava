interface PayPalTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

let paypalAccessToken: string | null = null
let tokenExpiry: number = 0

export async function getPayPalAccessToken(): Promise<string> {
  // Check if we have a valid token
  if (paypalAccessToken && Date.now() < tokenExpiry) {
    return paypalAccessToken
  }

  try {
    const clientId = process.env.PAYPAL_CLIENT_ID
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET
    const isProduction = process.env.NODE_ENV === 'production'
    
    const baseUrl = isProduction 
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com'

    const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: 'grant_type=client_credentials',
    })

    if (!response.ok) {
      throw new Error('Failed to get PayPal access token')
    }

    const data: PayPalTokenResponse = await response.json()
    
    // Store token and set expiry (with 5 minute buffer)
    paypalAccessToken = data.access_token
    tokenExpiry = Date.now() + (data.expires_in - 300) * 1000

    return paypalAccessToken
  } catch (error) {
    console.error('PayPal token error:', error)
    throw new Error('Failed to authenticate with PayPal')
  }
}

export function getPayPalApiUrl(): string {
  const isProduction = process.env.NODE_ENV === 'production'
  return isProduction 
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'
} 