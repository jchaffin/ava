'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { Button, Input } from '@/components/ui'
import { useAuth } from '@/context'
import toast from 'react-hot-toast'
import { signIn } from 'next-auth/react'

interface SignInFormData {
  email: string
  password: string
}

interface FormErrors {
  email?: string
  password?: string
  general?: string
}

const SignInPage: React.FC = () => {
  const [formData, setFormData] = useState<SignInFormData>({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [loginSuccess, setLoginSuccess] = useState(false)
  const router = useRouter()
  const { login, user, isAuthenticated, isLoading } = useAuth()

  // Handle redirect after successful login
  useEffect(() => {
    if (loginSuccess && isAuthenticated && user && !isLoading) {
      const callbackUrl = new URLSearchParams(window.location.search).get('callbackUrl')
      if (callbackUrl) {
        router.push(callbackUrl)
      } else if (user.role === 'admin') {
        router.push('/admin/dashboard')
      } else {
        router.push('/')
      }
      setLoginSuccess(false)
    }
  }, [loginSuccess, user, isAuthenticated, isLoading, router])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const result = await login({
        email: formData.email,
        password: formData.password,
      })

      if (result.success) {
        // Set flag to trigger redirect when session updates
        setLoginSuccess(true)
      } else {
        setErrors({ general: result.message || 'Sign in failed' })
      }
    } catch {
      setErrors({ general: 'Something went wrong. Please try again.' })
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async (role: 'user' | 'admin') => {
    setLoading(true)
    
    const demoCredentials = {
      user: { email: 'demo@ava.com', password: 'demo123' },
      admin: { email: 'admin@ava.com', password: 'admin123' }
    }
    
    const credentials = demoCredentials[role]
    
    try {
      const result = await login(credentials)

      if (result.success) {
        toast.success(`Signed in as demo ${role}`)
        setLoginSuccess(true)
      } else {
        toast.error('Demo login failed')
      }
    } catch {
      toast.error('Demo login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or&nbsp;
              <Link
                href="/register"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                create a new account
              </Link>
            </p>
          </div>

          <div className="bg-white shadow-md rounded-lg p-8">
            {/* General Error Message */}
            {errors.general && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm">{errors.general}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="Enter your email"
                autoComplete="email"
                required
              />

              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link
                    href="/forgot-password"
                    className="font-medium text-[#2D3748] hover:text-[#4A5568]"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                loading={loading}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            {/* Google Sign In */}
            <div className="mt-6">
              <button
                type="button"
                onClick={() => signIn('google')}
                className="w-full flex items-center justify-center gap-3 py-3 px-6 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold shadow-sm transition-colors duration-150"
                disabled={loading}
              >
                <svg className="w-5 h-5" viewBox="0 0 48 48">
                  <g>
                    <path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.85-6.85C35.64 2.36 30.18 0 24 0 14.82 0 6.73 5.48 2.69 13.44l7.98 6.2C12.13 13.13 17.62 9.5 24 9.5z"/>
                    <path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.43-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.02l7.19 5.59C43.93 37.13 46.1 31.36 46.1 24.55z"/>
                    <path fill="#FBBC05" d="M10.67 28.65c-1.01-2.99-1.01-6.21 0-9.2l-7.98-6.2C.7 17.1 0 20.46 0 24c0 3.54.7 6.9 1.96 10.1l8.71-5.45z"/>
                    <path fill="#EA4335" d="M24 48c6.18 0 11.36-2.04 15.15-5.54l-7.19-5.59c-2.01 1.35-4.59 2.15-7.96 2.15-6.38 0-11.87-3.63-14.33-8.89l-8.71 5.45C6.73 42.52 14.82 48 24 48z"/>
                    <path fill="none" d="M0 0h48v48H0z"/>
                  </g>
                </svg>
                Sign in with Google
              </button>
            </div>


          </div>

          {/* Additional Links */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="font-medium text-[#2D3748] hover:text-[#4A5568]"
              >
                Sign up for free
              </Link>
            </p>
          </div>
        </div>
      </div>
  )
}

export default SignInPage

