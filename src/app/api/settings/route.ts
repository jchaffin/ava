import { NextRequest, NextResponse } from 'next/server'

interface SiteSettings {
  general: {
    siteName: string
    siteDescription: string
    contactEmail: string
    phoneNumber: string
    address: string
    socialMedia: {
      facebook: string
      instagram: string
      twitter: string
      youtube: string
      tiktok: string
      amazonShop: string
    }
  }
}

// GET /api/settings - Fetch site settings
export async function GET(): Promise<NextResponse<{
  success: boolean
  message: string
  data?: SiteSettings
  error?: string
}>> {
  try {
    // For now, return default settings
    // In a real app, you'd fetch these from a database
    const settings: SiteSettings = {
      general: {
        siteName: 'AVA Skincare',
        siteDescription: 'Premium skincare products for radiant, healthy skin',
        contactEmail: 'hello@ava.com',
        phoneNumber: '+1 (555) 123-4567',
        address: '123 Beauty Lane, Los Angeles, CA 90210',
        socialMedia: {
          facebook: 'https://facebook.com/your-page',
          instagram: 'https://instagram.com/your-username',
          twitter: 'https://twitter.com/your-username',
          youtube: 'https://youtube.com/your-channel',
          tiktok: 'https://tiktok.com/@your-username',
          amazonShop: 'https://www.amazon.com/shop/your-username'
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Settings fetched successfully',
        data: settings,
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error fetching settings:', error)
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch settings',
        error: 'SERVER_ERROR',
      },
      { status: 500 }
    )
  }
} 