'use client'

import React from 'react'
import Image from 'next/image'

export default function TestImagesPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Image Test Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Test Home Images */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Home Images</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Main Light</h3>
                <Image
                  src="/images/home/main_light.png"
                  alt="Main Light"
                  width={300}
                  height={200}
                  className="rounded"
                  onError={(e) => console.error('Main light failed:', e)}
                  onLoad={() => console.log('Main light loaded')}
                />
              </div>
              <div>
                <h3 className="font-medium mb-2">Main Dark</h3>
                <Image
                  src="/images/home/main_dark.png"
                  alt="Main Dark"
                  width={300}
                  height={200}
                  className="rounded"
                  onError={(e) => console.error('Main dark failed:', e)}
                  onLoad={() => console.log('Main dark loaded')}
                />
              </div>
            </div>
          </div>

          {/* Test Logo Images */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Logo Images</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Logo</h3>
                <Image
                  src="/images/logos/logo.png"
                  alt="Logo"
                  width={200}
                  height={100}
                  className="rounded"
                  onError={(e) => console.error('Logo failed:', e)}
                  onLoad={() => console.log('Logo loaded')}
                />
              </div>
              <div>
                <h3 className="font-medium mb-2">Logo Dark</h3>
                <Image
                  src="/images/logos/logo_dark.png"
                  alt="Logo Dark"
                  width={200}
                  height={100}
                  className="rounded"
                  onError={(e) => console.error('Logo dark failed:', e)}
                  onLoad={() => console.log('Logo dark loaded')}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Debug Info */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
            <p><strong>Base URL:</strong> {typeof window !== 'undefined' ? window.location.origin : 'Server'}</p>
            <p><strong>User Agent:</strong> {typeof window !== 'undefined' ? window.navigator.userAgent : 'Server'}</p>
          </div>
        </div>
      </div>
    </div>
  )
} 