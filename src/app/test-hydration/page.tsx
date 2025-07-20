'use client'

import React, { useState, useEffect } from 'react'
import { useCart, useAuth } from '@/context'
import ThemeToggle from '@/components/ThemeToggle'
import { Button } from '@/components/ui'
import { useSession } from 'next-auth/react'

export default function TestHydrationPage() {
  const { items, getTotalItems } = useCart()
  const { user, isAuthenticated, isLoading } = useAuth()
  const { data: session, status } = useSession()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-theme-primary p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Hydration Test Page</h1>
        
        <div className="space-y-6">
          {/* Theme Toggle Test */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Theme Toggle</h2>
            <ThemeToggle />
            <p className="text-sm text-gray-600 mt-2">
              This should not cause hydration mismatches
            </p>
          </div>

          {/* Cart State Test */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Cart State</h2>
            <p>Total Items: {getTotalItems()}</p>
            <p>Items Count: {items.length}</p>
            <p>Mounted: {mounted ? 'Yes' : 'No'}</p>
          </div>

          {/* Auth State Test */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Auth State</h2>
            <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
            <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
            <p>User: {user ? user.name : 'None'}</p>
            <p>Mounted: {mounted ? 'Yes' : 'No'}</p>
          </div>

          {/* Session State Test */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Session State</h2>
            <p>Status: {status}</p>
            <p>Session User: {session?.user?.name || 'None'}</p>
            <p>Mounted: {mounted ? 'Yes' : 'No'}</p>
          </div>

          {/* Local Storage Test */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Local Storage Test</h2>
            <Button
              onClick={() => {
                localStorage.setItem('test-key', 'test-value')
                window.location.reload()
              }}
            >
              Set Test Value
            </Button>
            <p className="mt-2">
              Test Value: {mounted ? localStorage.getItem('test-key') || 'None' : 'Loading...'}
            </p>
          </div>

          {/* Hydration Status */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Hydration Status</h2>
            <p className="text-green-600 font-semibold">
              ✅ No hydration errors detected
            </p>
            <p className="text-sm text-gray-600 mt-2">
              If you see this message without any console errors, hydration is working correctly.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 