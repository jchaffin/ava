'use client'

import React, { useState } from 'react'
import { AdminLayout } from '@/components'
import { Button } from '@/components/ui'
import { useAuth } from '@/context'
import { useRouter } from 'next/navigation'
import {
  CheckCircle,
  ExternalLink,
  Copy,
  AlertCircle,
  ArrowRight,
  Settings,
  Shield,
  Zap,
  Globe,
  Code,
  TestTube,
  Monitor,
  Bell,
  Users,
  Lock,
  ArrowLeft,
  BookOpen,
  Cloud,
} from 'lucide-react'
import toast from 'react-hot-toast'

const PayPalTutorialPage: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [copiedSection, setCopiedSection] = useState<string | null>(null)

  React.useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated || !user?.id) {
      router.push('/signin?callbackUrl=/admin/tutorials/paypal')
      return
    }

    if (user.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.')
      router.push('/')
      return
    }
  }, [user, isAuthenticated, isLoading, router])

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text)
    setCopiedSection(section)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopiedSection(null), 2000)
  }

  const steps = [
    {
      id: 1,
      title: 'Create PayPal Business Account',
      icon: Users,
      content: (
        <div className="space-y-4">
          <p className="text-theme-secondary">
            First, you&apos;ll need a PayPal Business account to get your API credentials.
          </p>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Go to <a href="https://www.paypal.com/business" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">PayPal Business <ExternalLink className="w-4 h-4 ml-1" /></a></span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Sign up for a Business account</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Complete your business verification</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Verify your business details</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: 'Create PayPal App',
      icon: Settings,
      content: (
        <div className="space-y-4">
          <p className="text-theme-secondary">
            Create a PayPal app in the Developer Dashboard to get your API credentials.
          </p>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Go to <a href="https://developer.paypal.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">PayPal Developer Dashboard <ExternalLink className="w-4 h-4 ml-1" /></a></span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Sign in with your PayPal Business account</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Navigate to &quot;Apps &amp; Credentials&quot;</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Click &quot;Create App&quot;</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Choose &quot;Business&quot; app type</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Give your app a name (e.g., &quot;Ava Store&quot;)</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Click &quot;Create App&quot;</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: 'Get API Credentials',
      icon: Lock,
      content: (
        <div className="space-y-4">
          <p className="text-theme-secondary">
            After creating your app, you&apos;ll get the API credentials needed for integration.
          </p>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Find your app in the &quot;Apps &amp; Credentials&quot; section</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Copy your <strong>Client ID</strong> and <strong>Client Secret</strong></span>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Important</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    For testing, use the <strong>Sandbox</strong> credentials.<br />
                    For production, use the <strong>Live</strong> credentials.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: 'Environment Variables',
      icon: Code,
      content: (
        <div className="space-y-4">
          <p className="text-theme-secondary">
            Add these environment variables to your <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code> file:
          </p>
          <div className="bg-theme-tertiary text-theme-primary p-4 rounded-lg font-mono text-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300">Environment Variables</span>
              <button
                onClick={() => copyToClipboard(`# PayPal Configuration
PAYPAL_CLIENT_ID=your_paypal_client_id_here
PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id_here

# For production, also add:
# PAYPAL_CLIENT_ID=your_live_client_id
# PAYPAL_CLIENT_SECRET=your_live_client_secret
# NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_live_client_id`, 'env')}
                className="text-gray-400 hover:text-white"
              >
                {copiedSection === 'env' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <div className="space-y-1">
              <div># PayPal Configuration</div>
              <div>PAYPAL_CLIENT_ID=your_paypal_client_id_here</div>
              <div>PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here</div>
              <div>NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id_here</div>
              <div className="text-gray-500 mt-2"># For production, also add:</div>
              <div className="text-gray-500"># PAYPAL_CLIENT_ID=your_live_client_id</div>
              <div className="text-gray-500"># PAYPAL_CLIENT_SECRET=your_live_client_secret</div>
              <div className="text-gray-500"># NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_live_client_id</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 5,
      title: 'Testing',
      icon: TestTube,
      content: (
        <div className="space-y-4">
          <p className="text-theme-secondary">
            Test your PayPal integration using the Sandbox environment.
          </p>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800">Sandbox Testing</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Use PayPal&apos;s Sandbox environment for testing. No real money will be charged.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Use sandbox credentials in your environment variables</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Test with sandbox PayPal accounts</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Verify payment flow works correctly</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Test error scenarios and edge cases</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 6,
      title: 'Production Setup',
      icon: Globe,
      content: (
        <div className="space-y-4">
          <p className="text-theme-secondary">
            Switch to production when you&apos;re ready to accept real payments.
          </p>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Switch to Live environment in PayPal Developer Dashboard</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Update environment variables with live credentials</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Ensure your domain is approved in PayPal settings</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Test with real payment methods</span>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-800">Ready for Production</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Your PayPal integration is now ready to accept real payments from customers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 7,
      title: 'Configuration',
      icon: Settings,
      content: (
        <div className="space-y-4">
          <p className="text-theme-secondary">
            Configure your PayPal settings in the admin panel.
          </p>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Go to <button onClick={() => router.push('/admin/settings')} className="text-blue-600 hover:underline">Admin Settings</button></span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Navigate to the &quot;Payment&quot; tab</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Enable PayPal payments</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Enter your PayPal Client ID and Secret</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Save your settings</span>
            </div>
          </div>
        </div>
      )
    }
  ]

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-theme-secondary">Loading...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-theme-primary">
        {/* Header */}
        <div className="shadow-sm border-b border-theme">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-theme-primary">PayPal Setup Tutorial</h1>
                <p className="mt-1 text-sm text-theme-muted">
                  Complete guide to set up PayPal payments in your store
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => router.push('/admin/tutorials/stripe')}
                  variant="ghost"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous: Stripe Setup
                </Button>
                <Button
                  onClick={() => router.push('/admin/tutorials/storage')}
                  variant="ghost"
                >
                  <Cloud className="w-4 h-4 mr-2" />
                  Next: Local Storage Setup
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-theme-secondary rounded-lg shadow border border-theme">
            {/* Progress Bar */}
            <div className="border-b border-theme p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-theme-primary">Setup Progress</h2>
                <span className="text-sm text-theme-muted">Step {currentStep} of {steps.length}</span>
              </div>
              <div className="w-full bg-theme-tertiary rounded-full h-2">
                <div 
                  className="bg-theme-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / steps.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Step Navigation */}
            <div className="p-6 border-b border-theme">
              <div className="flex items-center justify-between">
                <Button
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                  variant="ghost"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
                  disabled={currentStep === steps.length}
                  variant="ghost"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* Current Step Content */}
            <div className="p-6">
              {steps.map((step) => (
                <div key={step.id} className={currentStep === step.id ? 'block' : 'hidden'}>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-theme-tertiary rounded-full flex items-center justify-center">
                      <step.icon className="w-5 h-5 text-theme-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-theme-primary">{step.title}</h3>
                  </div>
                  {step.content}
                </div>
              ))}
            </div>

            {/* Features Overview */}
            <div className="border-t border-theme p-6">
              <h3 className="text-lg font-medium text-theme-primary mb-4">PayPal Integration Features</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-theme-primary" />
                  <span className="text-theme-primary">Secure PayPal checkout</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Zap className="w-5 h-5 text-theme-primary" />
                  <span className="text-theme-primary">One-click payments</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Monitor className="w-5 h-5 text-theme-primary" />
                  <span className="text-theme-primary">Order management</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Bell className="w-5 h-5 text-theme-primary" />
                  <span className="text-theme-primary">Payment notifications</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default PayPalTutorialPage 