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
    <div className="min-h-screen flex items-center justify-center bg-theme-primary px-4 sm:px-6">
      <div className="max-w-md w-full text-center">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-6xl sm:text-8xl lg:text-9xl font-bold text-theme-muted select-none">404</h1>
          <div className="relative -mt-12 sm:-mt-16 lg:-mt-20">
            <h2 className="text-2xl sm:text-3xl font-bold text-theme-primary mb-2">
              Page Not Found
            </h2>
            <p className="text-theme-secondary mb-8 text-sm sm:text-base">
              Oops! The page you&apos;re looking for doesn&apos;t exist.
            </p>
          </div>
        </div>

        {/* Illustration */}
        <div className="mb-8">
          <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4">
            <svg
              viewBox="0 0 200 200"
              className="w-full h-full text-theme-muted"
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
          <h3 className="text-base sm:text-lg font-semibold text-theme-primary mb-4">
            Here are some helpful links:
          </h3>
          <div className="space-y-2">
            <Link 
              href="/"
              className="block text-theme-primary hover:text-ava-accent transition-colors text-sm sm:text-base"
            >
              Home
            </Link>
            <Link 
              href="/products"
              className="block text-theme-primary hover:text-ava-accent transition-colors text-sm sm:text-base"
            >
              Products
            </Link>
            <Link 
              href="/cart"
              className="block text-theme-primary hover:text-ava-accent transition-colors text-sm sm:text-base"
            >
              Shopping Cart
            </Link>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 sm:space-y-4">
          <Button
            onClick={handleGoBack}
            className="w-full bg-theme-secondary hover:bg-theme-tertiary text-theme-primary"
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
        <div className="mt-8 p-4 bg-theme-secondary rounded-lg shadow-sm border border-theme">
          <p className="text-sm text-theme-secondary mb-2">
            Can&apos;t find what you&apos;re looking for?
          </p>
          <Link
            href="/products"
            className="text-theme-primary hover:text-ava-accent font-medium"
          >
            Browse our products →
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound
