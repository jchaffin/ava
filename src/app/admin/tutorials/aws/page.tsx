'use client'

import React, { useState } from 'react'
import { AdminLayout } from '@/components'
import { Button } from '@/components/ui'
import { useAuth } from '@/context'
import { useRouter } from 'next/navigation'
import {
  Cloud,
  CheckCircle,
  AlertCircle,
  Copy,
  ExternalLink,
  Database,
  Shield,
  Settings,
  Upload,
  Globe,
  ArrowLeft,
  BookOpen,
  ArrowRight,
} from 'lucide-react'
import toast from 'react-hot-toast'

const AWSTutorial: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)

  React.useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated || !user?.id) {
      router.push('/signin?callbackUrl=/admin/tutorials/aws')
      return
    }

    if (user.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.')
      router.push('/')
      return
    }
  }, [user, isAuthenticated, isLoading, router])

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard!`)
  }

  const steps = [
    {
      id: 1,
      title: 'Create AWS Account',
      icon: Cloud,
      content: (
        <div className="space-y-4">
          <p className="text-theme-secondary">
            Sign up for an AWS account if you don&apos;t have one.
          </p>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-theme-primary" />
              <span>Go to <a href="https://aws.amazon.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">AWS Amazon <ExternalLink className="w-4 h-4 ml-1" /></a></span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-theme-primary" />
              <span>Click &quot;Create an AWS Account&quot;</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-theme-primary" />
              <span>Follow the registration process</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-theme-primary" />
              <span>Verify your email and phone number</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-theme-primary" />
              <span>Set up billing information</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: 'Create S3 Bucket',
      icon: Database,
      content: (
        <div className="space-y-4">
          <p className="text-theme-secondary">
            Create a new S3 bucket for your assets.
          </p>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-theme-primary" />
              <span>Log into AWS Console</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-theme-primary" />
              <span>Navigate to S3 service</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-theme-primary" />
              <span>Click &quot;Create bucket&quot;</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-theme-primary" />
              <span>Choose a unique bucket name (e.g., your-app-assets)</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-theme-primary" />
              <span>Select your preferred region</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-theme-primary" />
              <span>Keep default settings for now</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: 'Configure Bucket Permissions',
      icon: Shield,
      content: (
        <div className="space-y-4">
          <p className="text-theme-secondary">
            Set up proper permissions for your bucket.
          </p>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-theme-primary" />
              <span>Go to your bucket settings</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-theme-primary" />
              <span>Under &quot;Block public access&quot;, uncheck all options</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-theme-primary" />
              <span>Go to &quot;Bucket policy&quot; and add a policy for public read access</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-theme-primary" />
              <span>Enable CORS for web access</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-theme-primary">Bucket Policy:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(`{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}`, 'policy')}
                className="text-theme-muted hover:text-theme-primary"
              >
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </Button>
            </div>
            <pre className="bg-theme-tertiary rounded-lg p-4 text-sm text-theme-primary overflow-x-auto">
              <code>{`{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}`}</code>
            </pre>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: 'Create IAM User',
      icon: Settings,
      content: (
        <div className="space-y-4">
          <p className="text-theme-secondary">
            Create an IAM user with S3 permissions.
          </p>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-theme-primary" />
              <span>Go to IAM service in AWS Console</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-theme-primary" />
              <span>Click &quot;Users&quot; then &quot;Add user&quot;</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-theme-primary" />
              <span>Give it a name (e.g., s3-upload-user)</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-theme-primary" />
              <span>Select &quot;Programmatic access&quot;</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-theme-primary" />
              <span>Attach the &quot;AmazonS3FullAccess&quot; policy</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-theme-primary" />
              <span>Save the Access Key ID and Secret Access Key</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 5,
      title: 'Set Environment Variables',
      icon: Upload,
      content: (
        <div className="space-y-4">
          <p className="text-theme-secondary">
            Add AWS credentials to your .env.local file.
          </p>
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-theme-primary">Environment Variables:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(`AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-bucket-name`, 'env')}
                className="text-theme-muted hover:text-theme-primary"
              >
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </Button>
            </div>
            <pre className="bg-theme-tertiary rounded-lg p-4 text-sm text-theme-primary overflow-x-auto">
              <code>{`AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-bucket-name`}</code>
            </pre>
          </div>
        </div>
      )
    },
    {
      id: 6,
      title: 'Test Upload',
      icon: CheckCircle,
      content: (
        <div className="space-y-4">
          <p className="text-theme-secondary">
            Test your S3 setup by uploading an image.
          </p>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-theme-primary" />
              <span>Go to your admin products page</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-theme-primary" />
              <span>Try uploading a product image</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-theme-primary" />
              <span>Check if the image appears correctly</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-theme-primary" />
              <span>Verify the image URL in your browser</span>
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
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-theme-primary rounded-lg">
                  <Cloud className="w-6 h-6 text-theme-secondary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-theme-primary">AWS S3 Setup</h1>
                  <p className="mt-1 text-sm text-theme-muted">
                    Complete guide to set up AWS S3 for asset management
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
                  onClick={() => router.push('/admin/settings')}
                  variant="ghost"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Go to Settings
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
              <h3 className="text-lg font-medium text-theme-primary mb-4">AWS S3 Integration Features</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-theme-primary" />
                  <span className="text-theme-primary">Secure file storage</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-theme-primary" />
                  <span className="text-theme-primary">Global CDN access</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Upload className="w-5 h-5 text-theme-primary" />
                  <span className="text-theme-primary">Easy file uploads</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Database className="w-5 h-5 text-theme-primary" />
                  <span className="text-theme-primary">Scalable storage</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AWSTutorial 