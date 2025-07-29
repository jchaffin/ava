'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, User, Mail, Lock, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/context';
import { signIn } from 'next-auth/react';
import toast from 'react-hot-toast';

const Register: React.FC = () => {
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await register(formData);

      if (result.success) {
        // Redirect based on user role or return URL
        const callbackUrl = new URLSearchParams(window.location.search).get('callbackUrl');
        if (callbackUrl) {
          router.push(callbackUrl);
        } else if (result.user?.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/');
        }
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch {
      setError('Registration failed');
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.name && formData.email && formData.password && formData.confirmPassword;

  return (
    <div className="min-h-screen bg-theme-primary flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-theme-secondary p-3 rounded-full">
              <ShoppingBag className="h-8 w-8 text-theme-primary" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-theme-primary">Create Account</h2>
          <p className="mt-2 text-theme-secondary">
            Join thousands of happy customers
          </p>
        </div>

        {/* Registration Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-theme-secondary rounded-lg shadow-md p-6 border border-theme">
            <div className="space-y-4">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-theme-primary mb-1">
                  Full Name
                </label>
                <div className="flex items-center border-transparent rounded-md bg-theme-tertiary">
                  <div className="pl-3 pr-2">
                    <User className="h-5 w-5 text-theme-muted" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="flex-1 py-2 pr-3 bg-transparent text-theme-primary placeholder-theme-muted focus:outline-none focus:ring-0 focus:border-0 border-0 sm:text-sm"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-theme-primary mb-1">
                  Email Address
                </label>
                <div className="flex items-center border-transparent rounded-md bg-theme-tertiary">
                  <div className="pl-3 pr-2">
                    <Mail className="h-5 w-5 text-theme-muted" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="flex-1 py-2 pr-3 bg-transparent text-theme-primary placeholder-theme-muted focus:outline-none focus:ring-0 focus:border-0 border-0 sm:text-sm"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-theme-primary mb-1">
                  Password
                </label>
                <div className="flex items-center border-transparent rounded-md bg-theme-tertiary">
                  <div className="pl-3 pr-2">
                    <Lock className="h-5 w-5 text-theme-muted" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="flex-1 py-2 pr-3 bg-transparent text-theme-primary placeholder-theme-muted focus:outline-none focus:ring-0 focus:border-0 border-0 sm:text-sm"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    className="pr-3 flex items-center cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-theme-muted" />
                    ) : (
                      <Eye className="h-5 w-5 text-theme-muted" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-theme-muted">
                  Must be at least 6 characters
                </p>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-theme-primary mb-1">
                  Confirm Password
                </label>
                <div className="flex items-center border-transparent rounded-md bg-theme-tertiary">
                  <div className="pl-3 pr-2">
                    <Lock className="h-5 w-5 text-theme-muted" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="flex-1 py-2 pr-3 bg-transparent text-theme-primary placeholder-theme-muted focus:outline-none focus:ring-0 focus:border-0 border-0 sm:text-sm"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="pr-3 flex items-center cursor-pointer"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-theme-muted" />
                    ) : (
                      <Eye className="h-5 w-5 text-theme-muted" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 bg-theme-secondary border border-theme rounded-md">
                <p className="text-sm text-theme-primary">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="mt-6">
              <button
                type="submit"
                disabled={!isFormValid || loading}
                className="group relative w-full flex justify-center py-3 px-6 border border-transparent text-base font-bold rounded-lg btn-secondary focus:outline-none focus:ring-0 disabled:bg-theme-muted disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-theme-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>

            {/* Google Sign Up */}
            <div className="mt-6">
              <button
                type="button"
                onClick={() => signIn('google')}
                className="w-full flex items-center justify-center gap-3 py-3 px-6 rounded-lg border border-transparent btn-secondary font-bold shadow-sm transition-colors duration-150 cursor-pointer"
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
                Sign up with Google
              </button>
            </div>

            {/* Sign in Link */}
            <div className="mt-4 text-center">
              <p className="text-sm text-theme-secondary">
                Already have an account?{' '}
                <Link href="/signin" className="font-medium text-theme-primary hover:text-theme-secondary">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </form>

        {/* Terms and Privacy */}
        <div className="text-center">
                      <p className="text-xs text-theme-muted">
              By creating an account, you agree to our{' '}
            <Link href="/terms" className="text-theme-primary hover:text-theme-secondary">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-theme-primary hover:text-theme-secondary">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

