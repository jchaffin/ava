'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { Button, Input } from '@/components/ui'
import { useAuth } from '@/context'
import toast from 'react-hot-toast'

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

            {/* Demo Login Section */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or try demo accounts</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button
                  variant="secondary"
                  onClick={() => handleDemoLogin('user')}
                  disabled={loading}
                  className="w-full"
                >
                  Demo User
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleDemoLogin('admin')}
                  disabled={loading}
                  className="w-full"
                >
                  Demo Admin
                </Button>
              </div>
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

