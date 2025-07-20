import React from 'react'
import { LoadingSpinner } from '@/components/ui'

const Loading = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Logo/Brand Section */}
      <div className="mb-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4">
          <svg
            viewBox="0 0 64 64"
            className="w-full h-full text-blue-600"
            fill="currentColor"
          >
            <circle cx="32" cy="32" r="30" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M20 32c0-6.63 5.37-12 12-12s12 5.37 12 12-5.37 12-12 12-12-5.37-12-12z" />
            <circle cx="26" cy="28" r="2" fill="currentColor" />
            <circle cx="38" cy="28" r="2" fill="currentColor" />
            <path d="M26 38c0 3.31 2.69 6 6 6s6-2.69 6-6" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">AVA</h1>
        <p className="text-theme-secondary">Loading your experience...</p>
      </div>

      {/* Main Loading Spinner */}
      <div className="mb-8">
        <LoadingSpinner size="lg" color="primary" />
      </div>

      {/* Animated Dots */}
      <div className="flex space-x-2 mb-8">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"
            style={{
              animationDelay: `${index * 0.1}s`,
              animationDuration: '1s'
            }}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="w-64 bg-gray-200 rounded-full h-2 mb-8">
        <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
      </div>

      {/* Loading Tips */}
      <div className="text-center max-w-md">
        <div className="space-y-2 text-sm text-theme-muted">
          <p className="animate-pulse">✨ Preparing your personalized experience</p>
          <p className="animate-pulse" style={{ animationDelay: '0.5s' }}>
            🚀 Loading products and recommendations
          </p>
          <p className="animate-pulse" style={{ animationDelay: '1s' }}>
            🎯 Setting up your shopping journey
          </p>
        </div>
      </div>

      {/* Background Animation */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" style={{ animationDelay: '2s' }} />
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" style={{ animationDelay: '4s' }} />
      </div>
    </div>
  )
}

export default Loading
