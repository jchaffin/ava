'use client'

import React, { useState } from 'react'
import { AdminLayout } from '@/components'
import { Button } from '@/components/ui'
import { useAuth } from '@/context'
import { useRouter } from 'next/navigation'
import {
  HardDrive,
  Folder,
  Upload,
  Download,
  Settings,
  CheckCircle,
  AlertCircle,
  Info,
  ArrowLeft,
  FileText,
  Database,
  Globe,
  ArrowRight,
  BookOpen,
  Shield,
  Zap,
  Monitor,
  Bell,
} from 'lucide-react'
import toast from 'react-hot-toast'

const StorageSetupTutorial: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)

  React.useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated || !user?.id) {
      router.push('/signin?callbackUrl=/admin/tutorials/storage')
      return
    }

    if (user.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.')
      router.push('/')
      return
    }
  }, [user, isAuthenticated, isLoading, router])

  const steps = [
    {
      id: 1,
      title: 'Storage Overview',
      icon: HardDrive,
      content: (
        <div className="space-y-4">
          <p className="text-theme-secondary">
            This application uses local file storage for managing images and assets. 
            Files are stored directly on your server&apos;s file system, making it simple 
            to set up and manage without external dependencies.
          </p>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>No external dependencies required</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Simple file system storage</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Full control over your data</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Easy backup and migration</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: 'Directory Structure',
      icon: Folder,
      content: (
        <div className="space-y-4">
          <p className="text-theme-secondary">
            The application uses a specific directory structure for organizing uploaded files.
          </p>
          <div className="bg-theme-tertiary rounded-lg p-4 font-mono text-sm">
            <div>public/</div>
            <div>├── images/</div>
            <div>│   └── products/</div>
            <div>│       └── [product-id]/</div>
            <div>│           ├── main.jpg</div>
            <div>│           ├── 1.jpg</div>
            <div>│           ├── 2.jpg</div>
            <div>│           └── 3.jpg</div>
            <div>└── uploads/</div>
            <div>    ├── general/</div>
            <div>    └── products/</div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Product images stored in organized folders</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Each product gets its own directory</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Easy to manage and backup</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: 'File Upload Process',
      icon: Upload,
      content: (
        <div className="space-y-4">
          <p className="text-theme-secondary">
            Understanding how file uploads work in the application.
          </p>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Files are uploaded via the admin interface</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Images are automatically resized and optimized</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>File names are sanitized for security</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Metadata is stored in the database</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: 'Best Practices',
      icon: Settings,
      content: (
        <div className="space-y-4">
          <p className="text-theme-secondary">
            Follow these best practices to ensure optimal performance and security.
          </p>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-theme-primary">Regular Backups</h4>
                <p className="text-sm text-theme-muted">
                  Regularly backup your upload directories to prevent data loss
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-theme-primary">Disk Space Monitoring</h4>
                <p className="text-sm text-theme-muted">
                  Monitor disk space usage to prevent storage issues
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-theme-primary">File Organization</h4>
                <p className="text-sm text-theme-muted">
                  Use consistent naming conventions and folder structures
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-theme-primary">Security</h4>
                <p className="text-sm text-theme-muted">
                  Ensure proper file permissions and validate uploaded file types
                </p>
              </div>
            </div>
          </div>
        </div>
      )
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
        <div className="shadow-sm border-b border-theme">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => router.push('/admin/tutorials')}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Tutorials
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-theme-primary">Local Storage Setup</h1>
                  <p className="mt-1 text-sm text-theme-muted">
                    Complete guide to setting up local file storage
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => router.push('/admin/tutorials/paypal')}
                  variant="ghost"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous: PayPal Setup
                </Button>
                <Button
                  onClick={() => router.push('/admin/tutorials')}
                  variant="ghost"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Back to Tutorials
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
              <h3 className="text-lg font-medium text-theme-primary mb-4">Local Storage Features</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-theme-primary" />
                  <span className="text-theme-primary">Local file storage</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Zap className="w-5 h-5 text-theme-primary" />
                  <span className="text-theme-primary">Easy file uploads</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Monitor className="w-5 h-5 text-theme-primary" />
                  <span className="text-theme-primary">Simple setup</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Bell className="w-5 h-5 text-theme-primary" />
                  <span className="text-theme-primary">Full control</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default StorageSetupTutorial 