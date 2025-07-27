import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import connectDB from '@/lib/mongoose'
import { authOptions } from '@/lib/auth'

// In a real application, you would have a Settings model
// For now, we'll use a simple object to store settings
let siteSettings = {
  general: {
    siteName: 'AVA Beauty',
    siteDescription: 'Premium beauty and skincare products',
    contactEmail: 'contact@ava.com',
    phoneNumber: '+1 (555) 123-4567',
    address: '123 Beauty Street, New York, NY 10001'
  },
  appearance: {
    primaryColor: '#3B82F6',
    logoUrl: '/images/logos/logo.png',
    faviconUrl: '/favicon.ico',
    theme: 'light' as 'light' | 'dark' | 'auto'
  },
  notifications: {
    emailNotifications: true,
    orderNotifications: true,
    lowStockAlerts: true,
    marketingEmails: false
  },
  security: {
    twoFactorAuth: false,
    sessionTimeout: 30,
    adminEmail: 'admin@ava.com',
    adminName: 'Admin User',
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireNumbers: true,
      requireSymbols: false
    }
  },
  payment: {
    stripeEnabled: true,
    stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
    paypalEnabled: true,
    paypalClientId: process.env.PAYPAL_CLIENT_ID || '',
    paypalSecret: process.env.PAYPAL_SECRET || '',
    applePayEnabled: true,
    applePayMerchantId: process.env.APPLE_PAY_MERCHANT_ID || '',
    currency: 'USD',
    taxRate: 8.5
  },
  shipping: {
    freeShippingThreshold: 50,
    defaultShippingCost: 5.99,
    shippingZones: [
      {
        name: 'Domestic',
        cost: 5.99,
        countries: ['US']
      },
      {
        name: 'International',
        cost: 15.99,
        countries: ['CA', 'MX', 'UK', 'DE', 'FR']
      }
    ]
  }
}

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role
    if (session.user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 })
    }

    await connectDB()

    return NextResponse.json({
      success: true,
      data: siteSettings
    })

  } catch (error) {
    console.error('Settings GET API error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role
    if (session.user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 })
    }

    await connectDB()

    // Get updated settings from request body
    const updatedSettings = await request.json()

    // Validate settings structure
    if (!updatedSettings || typeof updatedSettings !== 'object') {
      return NextResponse.json(
        { success: false, message: 'Invalid settings data' },
        { status: 400 }
      )
    }

    // Update settings (in a real app, you would save to database)
    siteSettings = {
      ...siteSettings,
      ...updatedSettings
    }

    // In a real application, you would save to database here
    // await Settings.findOneAndUpdate({}, siteSettings, { upsert: true })

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      data: siteSettings
    })

  } catch (error) {
    console.error('Settings PUT API error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update settings' },
      { status: 500 }
    )
  }
} 