'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useState } from 'react'

export default function TestSessionPage() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)

  const handleDemoLogin = async () => {
    setLoading(true)
    try {
      const result = await signIn('credentials', {
        email: 'demo@ava.com',
        password: 'demo123',
        redirect: false,
      })
      
      if (result?.error) {
        alert(`Login failed: ${result.error}`)
      } else {
        alert('Login successful!')
      }
    } catch (error) {
      alert(`Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return <div className="p-8">Loading session...</div>
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Session Test Page</h1>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Session Status: {status}</h2>
        {session ? (
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800">Authenticated!</h3>
            <pre className="mt-2 text-sm text-green-700 overflow-auto">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
        ) : (
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-semibold text-red-800">Not authenticated</h3>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {!session ? (
          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in as Demo User'}
          </button>
        ) : (
          <button
            onClick={() => signOut()}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Sign Out
          </button>
        )}
      </div>
    </div>
  )
} 