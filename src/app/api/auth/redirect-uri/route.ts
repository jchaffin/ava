import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  const host = request.headers.get('host') || 'localhost:3000'
  const baseUrl = `${protocol}://${host}`
  
  const redirectUri = `${baseUrl}/api/auth/callback/google`
  
  return NextResponse.json({
    success: true,
    data: {
      redirectUri,
      baseUrl,
      environment: process.env.NODE_ENV,
      googleClientId: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set',
      googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set',
      nextAuthUrl: process.env.NEXTAUTH_URL || baseUrl,
    },
    instructions: [
      '1. Go to Google Cloud Console > APIs & Services > Credentials',
      '2. Edit your OAuth 2.0 Client ID',
      '3. Add the redirectUri above to "Authorized redirect URIs"',
      '4. Save the changes',
      '5. Try signing in with Google again'
    ]
  })
} 