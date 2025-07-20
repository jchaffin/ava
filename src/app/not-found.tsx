'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui'

const NotFound = () => {
  const router = useRouter()

  const handleGoBack = () => {
    router.back()
  }

  const handleGoHome = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300 select-none">404</h1>
          <div className="relative -mt-20">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Page Not Found
            </h2>
            <p className="text-gray-600 mb-8">
              Oops! The page you&apos;re looking for doesn&apos;t exist.
            </p>
          </div>
        </div>

        {/* Illustration */}
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto mb-4">
            <svg
              viewBox="0 0 200 200"
              className="w-full h-full text-gray-400"
              fill="currentColor"
            >
              <path d="M100 20c-44.18 0-80 35.82-80 80s35.82 80 80 80 80-35.82 80-80-35.82-80-80-80zm0 140c-33.14 0-60-26.86-60-60s26.86-60 60-60 60 26.86 60 60-26.86 60-60 60z" />
              <path d="M100 60c-22.09 0-40 17.91-40 40s17.91 40 40 40 40-17.91 40-40-17.91-40-40-40zm0 60c-11.05 0-20-8.95-20-20s8.95-20 20-20 20 8.95 20 20-8.95 20-20 20z" />
              <circle cx="70" cy="80" r="4" />
              <circle cx="130" cy="80" r="4" />
              <path d="M80 120c0-11.05 8.95-20 20-20s20 8.95 20 20" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </div>
        </div>

        {/* Helpful Links */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Here are some helpful links:
          </h3>
          <div className="space-y-2">
            <Link 
              href="/"
              className="block text-[#2D3748] hover:text-[#4A5568] transition-colors"
            >
              Home
            </Link>
            <Link 
              href="/products"
              className="block text-[#2D3748] hover:text-[#4A5568] transition-colors"
            >
              Products
            </Link>
            <Link 
              href="/cart"
              className="block text-[#2D3748] hover:text-[#4A5568] transition-colors"
            >
              Shopping Cart
            </Link>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button
            onClick={handleGoBack}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white"
          >
            Go Back
          </Button>
          <Button
            onClick={handleGoHome}
            className="w-full"
          >
            Go to Homepage
          </Button>
        </div>

        {/* Search Suggestion */}
        <div className="mt-8 p-4 bg-white rounded-lg shadow-sm">
          <p className="text-sm text-gray-600 mb-2">
            Can&apos;t find what you&apos;re looking for?
          </p>
          <Link
            href="/products"
            className="text-[#2D3748] hover:text-[#4A5568] font-medium"
          >
            Browse our products →
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound
