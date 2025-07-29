'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  ChatBubbleLeftRightIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui'

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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 bg-theme-primary min-h-screen">
      {/* Header */}
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-theme-primary mb-3 sm:mb-4">Customer Support</h1>
        <p className="text-base sm:text-lg text-theme-secondary max-w-2xl mx-auto px-4">
          We&apos;re here to help! Choose the best way to get in touch with our customer service team.
        </p>
      </div>

      {/* Support Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
        {supportOptions.map((option, index) => (
          <div 
            key={index} 
            className={`bg-theme-secondary rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200`}
          >
            <div className="flex items-start space-x-3 sm:space-x-4">
              <div className={`p-2 sm:p-3 rounded-lg flex-shrink-0 ${
                option.priority === 'high' ? 'bg-ava-accent text-theme-primary' : 'bg-theme-secondary text-theme-muted'
              }`}>
                <option.icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-theme-primary mb-2">{option.title}</h3>
                <p className="text-theme-secondary text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">{option.description}</p>
                {option.href ? (
                  <Link href={option.href}>
                    <Button
                      variant="secondary"
                      size="sm"
                    >
                      Get Help
                    </Button>
                  </Link>
                ) : (
                  <Button
                    onClick={option.action}
                    variant="secondary"
                    size="sm"
                  >
                    Get Help
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Contact Details */}
        <div className="bg-theme-primary rounded-lg p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-theme-primary mb-4 sm:mb-6">Contact Information</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <PhoneIcon className="w-5 h-5 text-theme-muted flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-medium text-theme-primary text-sm sm:text-base">Phone</p>
                <p className="text-theme-secondary text-sm sm:text-base">{contactInfo.phone}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <EnvelopeIcon className="w-5 h-5 text-theme-muted flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-medium text-theme-primary text-sm sm:text-base">Email</p>
                <p className="text-theme-secondary text-sm sm:text-base">{contactInfo.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <ClockIcon className="w-5 h-5 text-theme-muted flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-medium text-theme-primary text-sm sm:text-base">Business Hours</p>
                <p className="text-theme-secondary text-sm sm:text-base">{contactInfo.hours}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Help */}
        <div className="bg-theme-secondary rounded-lg p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-theme-primary mb-4 sm:mb-6">Quick Help</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-theme-primary mb-2 text-sm sm:text-base">Common Issues</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-theme-secondary">
                <li>• Order tracking and status</li>
                <li>• Product recommendations</li>
                <li>• Return and refund requests</li>
                <li>• Account and billing issues</li>
                <li>• Product usage questions</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-theme-primary mb-2 text-sm sm:text-base">Before Contacting Us</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-theme-secondary">
                <li>• Check our <a href="/faq" className="text-ava-accent hover:underline">FAQ page</a></li>
                <li>• Review your order confirmation email</li>
                <li>• Have your order number ready</li>
                <li>• Check your account dashboard</li>
              </ul>
            </div>
          </div>
        </div>
      </div>


    </div>
  )
}

export default SupportPage 