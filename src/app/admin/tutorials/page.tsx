'use client'

import React from 'react'
import { AdminLayout } from '@/components'
import { Button } from '@/components/ui'
import { useAuth } from '@/context'
import { useRouter } from 'next/navigation'
import {
  CreditCard,
  Cloud,
  Users,
  ArrowRight,
  BookOpen,
  Settings,
  Shield,
  Zap,
  Globe,
  Database,
  Upload,
  CheckCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'

const TutorialsPage: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  React.useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated || !user?.id) {
      router.push('/signin?callbackUrl=/admin/tutorials')
      return
    }

    if (user.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.')
      router.push('/')
      return
    }
  }, [user, isAuthenticated, isLoading, router])

  const tutorials = [
    {
      id: 'stripe',
      title: 'Stripe Setup',
      description: 'Complete guide to set up Stripe payments in your store',
      icon: CreditCard,
      href: '/admin/tutorials/stripe',
      features: [
        'Secure card processing',
        'Apple Pay support',
        'Order management',
        'Real-time webhooks'
      ],
      estimatedTime: '15-20 minutes',
      difficulty: 'Intermediate'
    },
    {
      id: 'paypal',
      title: 'PayPal Setup',
      description: 'Complete guide to set up PayPal payments in your store',
      icon: Users,
      href: '/admin/tutorials/paypal',
      features: [
        'Secure PayPal checkout',
        'One-click payments',
        'Order management',
        'Payment notifications'
      ],
      estimatedTime: '10-15 minutes',
      difficulty: 'Beginner'
    },
    {
      id: 'storage',
      title: 'Local Storage Setup',
      description: 'Complete guide to set up local file storage for asset management',
      icon: Cloud,
      href: '/admin/tutorials/storage',
      features: [
        'Local file storage',
        'Easy file uploads',
        'Simple setup',
        'Full control'
      ],
      estimatedTime: '5-10 minutes',
      difficulty: 'Beginner'
    }
  ]

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-theme-primary flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-primary mx-auto"></div>
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
        <div className="bg-theme-primary shadow-sm border-b border-theme">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-theme-primary rounded-lg">
                  <BookOpen className="w-6 h-6 text-theme-secondary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-theme-primary">Tutorials</h1>
                  <p className="mt-1 text-sm text-theme-muted">
                    Step-by-step guides to set up your store
                  </p>
                </div>
              </div>
              <Button
                onClick={() => router.push('/admin/settings')}
                variant="secondary"
              >
                <Settings className="w-4 h-4 mr-2 text-theme-primary" />
                Go to Settings
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Overview */}
          <div className="bg-theme-secondary rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-theme-primary mb-4">Getting Started</h2>
            <p className="text-theme-muted mb-4">
              Follow these tutorials in order to set up your store completely. Each tutorial includes step-by-step instructions, code examples, and troubleshooting tips.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2 text-theme-muted">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">Payment processing</span>
              </div>
              <div className="flex items-center space-x-2 text-theme-muted">
                <Globe className="w-4 h-4 text-blue-500" />
                <span className="text-sm">File management</span>
              </div>
              <div className="flex items-center space-x-2 text-theme-muted">
                <Shield className="w-4 h-4 text-purple-500" />
                <span className="text-sm">Security best practices</span>
              </div>
            </div>
          </div>

          {/* Tutorials Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {tutorials.map((tutorial, index) => {
              const Icon = tutorial.icon
              return (
                <div key={tutorial.id} className="bg-theme-secondary rounded-lg shadow border border-theme overflow-hidden hover:shadow-lg transition-shadow duration-200">
                  <div className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-theme-primary rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-theme-secondary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-theme-primary">{tutorial.title}</h3>
                        <p className="text-sm text-theme-muted">{tutorial.description}</p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      {tutorial.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-theme-primary rounded-full"></div>
                          <span className="text-sm text-theme-muted">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4 text-xs text-theme-muted">
                        <span>⏱️ {tutorial.estimatedTime}</span>
                        <span>📊 {tutorial.difficulty}</span>
                      </div>
                    </div>

                    <Button
                      onClick={() => router.push(tutorial.href)}
                      variant="primary"
                      className="w-full"
                    >
                      Start Tutorial
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Quick Actions */}
          <div className="bg-theme-secondary rounded-lg shadow p-6 mt-8">
            <h2 className="text-xl font-semibold text-theme-primary mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => router.push('/admin/settings')}
                variant="secondary"
                className="justify-start"
              >
                <Settings className="w-4 h-4 mr-2 text-theme-primary" />
                Configure Settings
              </Button>
              <Button
                onClick={() => router.push('/admin/products')}
                variant="secondary"
                className="justify-start"
              >
                <Database className="w-4 h-4 mr-2 text-theme-primary" />
                Manage Products
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default TutorialsPage 