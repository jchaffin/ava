'use client'

import React, { useState } from 'react'
import { 
  ChatBubbleLeftRightIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface SupportOption {
  title: string
  description: string
  icon: React.ComponentType<any>
  href?: string
  action?: () => void
  priority?: 'high' | 'medium' | 'low'
}

const SupportPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  const supportOptions: SupportOption[] = [
    {
      title: "Live Chat",
      description: "Get instant help from our customer service team",
      icon: ChatBubbleLeftRightIcon,
      priority: 'high',
      action: () => {
        // In a real app, this would open a chat widget
        alert('Live chat feature coming soon!')
      }
    },
    {
      title: "Email Support",
      description: "Send us a detailed message and we'll respond within 24 hours",
      icon: EnvelopeIcon,
      href: "/contact",
      priority: 'high'
    },
    {
      title: "Phone Support",
      description: "Call us Monday-Friday, 9AM-6PM EST",
      icon: PhoneIcon,
      action: () => {
        window.location.href = 'tel:+1-800-AVA-SKIN'
      },
      priority: 'high'
    },
    {
      title: "FAQ",
      description: "Find answers to common questions",
      icon: DocumentTextIcon,
      href: "/faq",
      priority: 'medium'
    },
    {
      title: "Order Issues",
      description: "Problems with your order? We're here to help",
      icon: ExclamationTriangleIcon,
      href: "/contact?category=order",
      priority: 'high'
    },
    {
      title: "Product Questions",
      description: "Need help choosing the right products?",
      icon: DocumentTextIcon,
      href: "/contact?category=product",
      priority: 'medium'
    }
  ]

  const contactInfo = {
    phone: "+1 (800) AVA-SKIN",
    email: "support@ava.com",
    hours: "Monday - Friday: 9AM - 6PM EST",
    address: "AVA Skincare\n123 Beauty Street\nNew York, NY 10001"
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-theme-primary mb-4">Customer Support</h1>
        <p className="text-lg text-theme-secondary max-w-2xl mx-auto">
          We&apos;re here to help! Choose the best way to get in touch with our customer service team.
        </p>
      </div>

      {/* Support Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {supportOptions.map((option, index) => (
          <div 
            key={index} 
            className={`bg-theme-primary border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200 ${
              option.priority === 'high' ? 'border-blue-200' : 'border-theme'
            }`}
          >
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-lg ${
                option.priority === 'high' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-theme-secondary'
              }`}>
                <option.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-theme-primary mb-2">{option.title}</h3>
                <p className="text-theme-secondary text-sm mb-4">{option.description}</p>
                {option.href ? (
                  <a
                    href={option.href}
                    className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      option.priority === 'high' 
                        ? 'bg-blue-600 text-theme-primary hover:bg-blue-700' 
                        : 'bg-gray-100 ava-text-tertiary hover:bg-gray-200'
                    }`}
                  >
                    Get Help
                  </a>
                ) : (
                  <button
                    onClick={option.action}
                    className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      option.priority === 'high' 
                        ? 'bg-blue-600 text-theme-primary hover:bg-blue-700' 
                        : 'bg-gray-100 ava-text-tertiary hover:bg-gray-200'
                    }`}
                  >
                    Get Help
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Details */}
        <div className="bg-theme-primary border border-theme rounded-lg p-8">
          <h2 className="text-2xl font-bold text-theme-primary mb-6">Contact Information</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <PhoneIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-theme-primary">Phone</p>
                <p className="text-theme-secondary">{contactInfo.phone}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <EnvelopeIcon className="w-5 h-5 text-theme-muted" />
              <div>
                <p className="font-medium text-theme-primary">Email</p>
                <p className="text-theme-secondary">{contactInfo.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <ClockIcon className="w-5 h-5 text-theme-muted" />
              <div>
                <p className="font-medium text-theme-primary">Business Hours</p>
                <p className="text-theme-secondary">{contactInfo.hours}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Help */}
        <div className="bg-theme-secondary border border-theme rounded-lg p-8">
          <h2 className="text-2xl font-bold text-theme-primary mb-6">Quick Help</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-theme-primary mb-2">Common Issues</h3>
              <ul className="space-y-2 text-sm text-theme-secondary">
                <li>• Order tracking and status</li>
                <li>• Product recommendations</li>
                <li>• Return and refund requests</li>
                <li>• Account and billing issues</li>
                <li>• Product usage questions</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-theme-primary mb-2">Before Contacting Us</h3>
              <ul className="space-y-2 text-sm text-theme-secondary">
                <li>• Check our <a href="/faq" className="text-blue-600 hover:underline">FAQ page</a></li>
                <li>• Review your order confirmation email</li>
                <li>• Have your order number ready</li>
                <li>• Check your account dashboard</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <ExclamationTriangleIcon className="w-6 h-6 text-red-600 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">Urgent Issues</h3>
            <p className="text-red-700 mb-3">
              For urgent matters like allergic reactions or severe skin irritation, please contact us immediately by phone or email.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="tel:+1-800-AVA-SKIN"
                className="bg-red-600 text-theme-primary px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 text-center"
              >
                Call Now
              </a>
              <a
                href="/contact?priority=urgent"
                className="border border-red-600 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors duration-200 text-center"
              >
                Send Urgent Email
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SupportPage 