'use client'

import React, { useState } from 'react'
import { AdminLayout } from '@/components'
import { Button } from '@/components/ui'
import { useAuth } from '@/context'
import { useRouter } from 'next/navigation'
import {
  CreditCard,
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
} from 'lucide-react'
import toast from 'react-hot-toast'

const StripeTutorialPage: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [copiedSection, setCopiedSection] = useState<string | null>(null)

  React.useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated || !user?.id) {
      router.push('/signin?callbackUrl=/admin/tutorials/stripe')
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
      title: 'Create Stripe Account',
      icon: CreditCard,
      content: (
        <div className="space-y-4">
          <p className="text-theme-secondary">
            First, you'll need to create a Stripe account to get your API keys.
          </p>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Go to <a href="https://dashboard.stripe.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">Stripe Dashboard <ExternalLink className="w-4 h-4 ml-1" /></a></span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Sign up for a free account</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Complete your business profile</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Get your API keys</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: 'Get API Keys',
      icon: Settings,
      content: (
        <div className="space-y-4">
          <p className="text-theme-secondary">
            Navigate to your Stripe Dashboard to get your API keys.
          </p>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
                             <span>Go to &quot;Developers&quot; → &quot;API keys&quot;</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Copy your <strong>Publishable key</strong> and <strong>Secret key</strong></span>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Important</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    For testing, use the test keys (start with <code className="bg-yellow-100 px-1 rounded">pk_test_</code> and <code className="bg-yellow-100 px-1 rounded">sk_test_</code>).<br />
                    For production, use the live keys (start with <code className="bg-yellow-100 px-1 rounded">pk_live_</code> and <code className="bg-yellow-100 px-1 rounded">sk_live_</code>).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: 'Environment Variables',
      icon: Code,
      content: (
        <div className="space-y-4">
          <p className="text-theme-secondary">
            Add these environment variables to your <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code> file:
          </p>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300">Environment Variables</span>
              <button
                onClick={() => copyToClipboard(`# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# For production, use:
# STRIPE_SECRET_KEY=sk_live_your_live_secret_key
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
# STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret`, 'env')}
                className="text-gray-400 hover:text-white"
              >
                {copiedSection === 'env' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <div className="space-y-1">
              <div># Stripe Configuration</div>
              <div>STRIPE_SECRET_KEY=sk_test_your_secret_key_here</div>
              <div>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here</div>
              <div>STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here</div>
              <div className="text-gray-500 mt-2"># For production, use:</div>
              <div className="text-gray-500"># STRIPE_SECRET_KEY=sk_live_your_live_secret_key</div>
              <div className="text-gray-500"># NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key</div>
              <div className="text-gray-500"># STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: 'Webhook Setup',
      icon: Globe,
      content: (
        <div className="space-y-4">
          <p className="text-theme-secondary">
            Set up webhooks to receive real-time payment updates from Stripe.
          </p>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>In Stripe Dashboard, go to &quot;Developers&quot; → &quot;Webhooks&quot;</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Click &quot;Add endpoint&quot;</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Set the endpoint URL to: <code className="bg-gray-100 px-2 py-1 rounded">https://yourdomain.com/api/stripe/webhook</code></span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Select these events:</span>
            </div>
            <div className="ml-8 space-y-1">
              <div>• <code className="bg-gray-100 px-1 rounded">checkout.session.completed</code></div>
              <div>• <code className="bg-gray-100 px-1 rounded">payment_intent.succeeded</code></div>
              <div>• <code className="bg-gray-100 px-1 rounded">payment_intent.payment_failed</code></div>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Copy the webhook signing secret to your environment variables</span>
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
            Test your Stripe integration with these test card numbers.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2">Success</h4>
              <div className="bg-white p-2 rounded border">
                <code className="text-sm">4242 4242 4242 4242</code>
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-800 mb-2">Decline</h4>
              <div className="bg-white p-2 rounded border">
                <code className="text-sm">4000 0000 0000 0002</code>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">Requires Auth</h4>
              <div className="bg-white p-2 rounded border">
                <code className="text-sm">4000 0025 0000 3155</code>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 6,
      title: 'Configuration',
      icon: Settings,
      content: (
        <div className="space-y-4">
          <p className="text-theme-secondary">
            Configure your Stripe settings in the admin panel.
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
              <span>Enable Stripe payments</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Enter your Stripe API keys</span>
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
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-theme-primary">Stripe Setup Tutorial</h1>
                <p className="mt-1 text-sm text-theme-muted">
                  Complete guide to set up Stripe payments in your store
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => router.push('/admin/settings')}
                  variant="secondary"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Go to Settings
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow">
            {/* Progress Bar */}
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-theme-primary">Setup Progress</h2>
                <span className="text-sm text-theme-muted">Step {currentStep} of {steps.length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / steps.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Step Navigation */}
            <div className="p-6 border-b border-gray-200">
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
                  variant="primary"
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
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <step.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-theme-primary">{step.title}</h3>
                  </div>
                  {step.content}
                </div>
              ))}
            </div>

            {/* Features Overview */}
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <h3 className="text-lg font-medium text-theme-primary mb-4">Stripe Integration Features</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-green-500" />
                  <span>Secure card processing</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Zap className="w-5 h-5 text-green-500" />
                  <span>Apple Pay support</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Monitor className="w-5 h-5 text-green-500" />
                  <span>Order management</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Bell className="w-5 h-5 text-green-500" />
                  <span>Real-time webhooks</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default StripeTutorialPage 