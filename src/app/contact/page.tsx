'use client'

import React, { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import { Button, Input } from '@/components/ui'
import toast from 'react-hot-toast'

interface ContactForm {
  name: string
  email: string
  subject: string
  message: string
  category: string
  priority: string
}

const ContactPage: React.FC = () => {
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: searchParams.get('category') || 'general',
    priority: searchParams.get('priority') || 'normal'
  })
  const [loading, setLoading] = useState(false)

  const categories = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'order', label: 'Order Issue' },
    { value: 'product', label: 'Product Question' },
    { value: 'return', label: 'Return/Refund' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'feedback', label: 'Feedback' }
  ]

  const priorities = [
    { value: 'normal', label: 'Normal' },
    { value: 'urgent', label: 'Urgent' }
  ]

  const contactInfo = {
    email: 'hello@ava.com',
    phone: '+1 (800) AVA-SKIN',
    address: '123 Beauty Street\nNew York, NY 10001',
    hours: 'Monday - Friday: 9AM - 6PM EST\nSaturday: 10AM - 4PM EST'
  }

  const handleChange = (field: keyof ContactForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // In a real app, this would send the form data to your API
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      toast.success('Message sent successfully! We\'ll get back to you soon.')
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        category: 'general',
        priority: 'normal'
      })
    } catch {
      toast.error('Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 min-h-screen">
      {/* Header */}
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-theme-primary mb-3 sm:mb-4">Contact Us</h1>
        <p className="text-base sm:text-lg text-theme-secondary max-w-2xl mx-auto">
          Have a question or need help? We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <div className="bg-theme-secondary border border-theme rounded-lg p-6 sm:p-8 shadow-lg">
            <h2 className="text-xl sm:text-2xl font-bold text-theme-primary mb-4 sm:mb-6">Send us a Message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                  placeholder="Your full name"
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium ava-text-tertiary mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="w-full border border-theme rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-theme-primary bg-theme-primary text-theme-secondary"
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium ava-text-tertiary mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => handleChange('priority', e.target.value)}
                    className="w-full border border-theme rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-theme-primary bg-theme-primary text-theme-secondary"
                  >
                    {priorities.map(priority => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Input
                label="Subject"
                value={formData.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
                required
                placeholder="Brief description of your inquiry"
              />

              <div>
                <label className="block text-sm font-medium ava-text-tertiary mb-2">
                  Message
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  required
                  rows={6}
                  className="w-full border border-theme rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-theme-primary bg-theme-primary text-theme-secondary"
                  placeholder="Please provide details about your inquiry..."
                />
              </div>

              <Button
                type="submit"
                loading={loading}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4 sm:space-y-6">
          {/* Contact Details */}
          <div className="bg-theme-secondary border border-theme rounded-lg p-4 sm:p-6 shadow-lg">
            <h3 className="text-base sm:text-lg font-semibold text-theme-primary mb-3 sm:mb-4">Get in Touch</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <EnvelopeIcon className="w-5 h-5 text-theme-muted mt-1" />
                <div>
                  <p className="font-medium text-theme-primary">Email</p>
                  <a href={`mailto:${contactInfo.email}`} className="text-ava-accent hover:underline">
                    {contactInfo.email}
                  </a>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <PhoneIcon className="w-5 h-5 text-theme-muted mt-1" />
                <div>
                  <p className="font-medium text-theme-primary">Phone</p>
                  <a href={`tel:${contactInfo.phone}`} className="text-ava-accent hover:underline">
                    {contactInfo.phone}
                  </a>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPinIcon className="w-5 h-5 text-theme-muted mt-1" />
                <div>
                  <p className="font-medium text-theme-primary">Address</p>
                  <p className="text-theme-secondary whitespace-pre-line">{contactInfo.address}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <ClockIcon className="w-5 h-5 text-theme-muted mt-1" />
                <div>
                  <p className="font-medium text-theme-primary">Business Hours</p>
                  <p className="text-theme-secondary whitespace-pre-line">{contactInfo.hours}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-theme-secondary border border-theme rounded-lg p-4 sm:p-6 shadow-lg">
            <h3 className="text-base sm:text-lg font-semibold text-theme-primary mb-3 sm:mb-4">Quick Actions</h3>
            <div className="space-y-2 sm:space-y-3">
              <a
                href="/faq"
                className="flex items-center space-x-3 p-3 bg-theme-primary rounded-lg hover:bg-theme-tertiary transition-colors duration-200"
              >
                <DocumentTextIcon className="w-5 h-5 text-theme-secondary" />
                <span className="text-theme-secondary">Browse FAQ</span>
              </a>
              <a
                href="/support"
                className="flex items-center space-x-3 p-3 bg-theme-primary rounded-lg hover:bg-theme-tertiary transition-colors duration-200"
              >
                <ChatBubbleLeftRightIcon className="w-5 h-5 text-theme-secondary" />
                <span className="text-theme-secondary">Get Support</span>
              </a>
              <a
                href="/orders"
                className="flex items-center space-x-3 p-3 bg-theme-primary rounded-lg hover:bg-theme-tertiary transition-colors duration-200"
              >
                <DocumentTextIcon className="w-5 h-5 text-theme-secondary" />
                <span className="text-theme-secondary">Track Order</span>
              </a>
            </div>
          </div>

          {/* Response Time */}
          <div className="bg-theme-secondary border border-theme rounded-lg p-4 sm:p-6 shadow-lg">
            <h3 className="text-base sm:text-lg font-semibold text-theme-primary mb-2 sm:mb-3">Response Time</h3>
            <p className="text-theme-secondary text-sm">
              We typically respond to inquiries within 24 hours during business days. 
              For urgent matters, please call us directly.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactPage 