'use client'

import React from 'react'
import { 
  TruckIcon, 
  ClockIcon, 
  MapPinIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

const ShippingPage: React.FC = () => {
  const shippingOptions = [
    {
      name: "Standard Shipping",
      time: "3-5 business days",
      price: "$5.99",
      description: "Free on orders over $50",
      icon: TruckIcon
    },
    {
      name: "Express Shipping",
      time: "1-2 business days",
      price: "$12.99",
      description: "Free on orders over $100",
      icon: ClockIcon
    },
    {
      name: "Overnight Shipping",
      time: "Next business day",
      price: "$24.99",
      description: "Available for most locations",
      icon: MapPinIcon
    }
  ]

  const shippingInfo = {
    processingTime: "1-2 business days",
    businessHours: "Monday - Friday, 9AM - 6PM EST",
    excludedDays: ["Saturdays", "Sundays", "Federal Holidays"],
    tracking: "All orders include tracking information",
    insurance: "All packages are insured up to $100"
  }

  const restrictions = [
    "We do not ship to PO Boxes",
    "International shipping available to select countries",
    "Some products may have shipping restrictions",
    "Signature required for orders over $200"
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-theme-primary mb-4">Shipping Information</h1>
        <p className="text-lg text-theme-secondary">
          Fast, reliable shipping to get your skincare products to you quickly and safely.
        </p>
      </div>

      {/* Shipping Options */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-theme-primary mb-6">Shipping Options</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {shippingOptions.map((option, index) => (
            <div key={index} className="bg-theme-secondary border border-theme rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="bg-theme-secondary p-3 rounded-lg mr-4">
                  <option.icon className="w-6 h-6 text-theme-secondary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-theme-primary">{option.name}</h3>
                  <p className="text-sm text-theme-muted">{option.time}</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-theme-primary mb-2">{option.price}</div>
              <p className="text-sm text-theme-secondary">{option.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Processing Information */}
      <div className="bg-theme-secondary rounded-lg p-8 mb-12">
        <h2 className="text-2xl font-bold text-theme-primary mb-6">Processing & Delivery</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-theme-tertiary rounded-lg p-4">
            <h3 className="text-lg font-semibold text-theme-primary mb-4">Processing Time</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3" />
                <span className="ava-text-tertiary">Orders processed within {shippingInfo.processingTime}</span>
              </div>
              <div className="flex items-center">
                <ClockIcon className="w-5 h-5 text-blue-600 mr-3" />
                <span className="ava-text-tertiary">Business hours: {shippingInfo.businessHours}</span>
              </div>
              <div className="flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mr-3" />
                <span className="ava-text-tertiary">No processing on: {shippingInfo.excludedDays.join(', ')}</span>
              </div>
            </div>
          </div>
          <div className="bg-theme-tertiary rounded-lg p-4">
            <h3 className="text-lg font-semibold text-theme-primary mb-4">Package Protection</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3" />
                <span className="ava-text-tertiary">{shippingInfo.tracking}</span>
              </div>
              <div className="flex items-center">
                <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3" />
                <span className="ava-text-tertiary">{shippingInfo.insurance}</span>
              </div>
              <div className="flex items-center">
                <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3" />
                <span className="ava-text-tertiary">Eco-friendly packaging materials</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shipping Restrictions */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-theme-primary mb-6">Shipping Restrictions</h2>
        <div className="bg-theme-secondary border border-theme rounded-lg p-6">
          <ul className="space-y-2">
            {restrictions.map((restriction, index) => (
              <li key={index} className="flex items-start">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                <span className="ava-text-tertiary">{restriction}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* International Shipping */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-theme-primary mb-6">International Shipping</h2>
        <div className="bg-theme-secondary border border-theme rounded-lg p-6">
          <p className="text-theme-secondary mb-4">
            We currently ship to the following countries:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              'United States', 'Canada', 'United Kingdom', 'Australia',
              'Germany', 'France', 'Japan', 'South Korea'
            ].map((country, index) => (
              <div key={index} className="flex items-center">
                <CheckCircleIcon className="w-4 h-4 text-green-600 mr-2" />
                <span className="ava-text-tertiary text-sm">{country}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-theme-tertiary rounded-lg">
            <p className="text-sm text-theme-secondary">
              <strong>Note:</strong> International shipping rates and delivery times vary by country. 
              Additional customs duties and taxes may apply and are the responsibility of the recipient.
            </p>
          </div>
        </div>
      </div>

      {/* Tracking Orders */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-theme-primary mb-6">Tracking Your Order</h2>
        <div className="bg-theme-secondary border border-theme rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-theme-tertiary rounded-lg p-4">
              <h3 className="text-lg font-semibold text-theme-primary mb-4">How to Track</h3>
              <ul className="space-y-3 text-theme-secondary">
                <li>• Check your order confirmation email for tracking information</li>
                <li>• Visit your account dashboard to view order status</li>
                <li>• Use the tracking number provided by the carrier</li>
                <li>• Contact customer service for assistance</li>
              </ul>
            </div>
            <div className="bg-theme-tertiary rounded-lg p-4">
              <h3 className="text-lg font-semibold text-theme-primary mb-4">Order Status Updates</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <span className="ava-text-tertiary">Order Confirmed</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                  <span className="ava-text-tertiary">Processing</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="ava-text-tertiary">Shipped</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                  <span className="ava-text-tertiary">Delivered</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-theme-primary mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div className="bg-theme-secondary border border-theme rounded-lg p-6">
            <h3 className="font-semibold text-theme-primary mb-2">When will my order ship?</h3>
                          <p className="text-theme-secondary">
                Orders are typically processed and shipped within 1-2 business days. You&apos;ll receive 
                a confirmation email with tracking information once your order ships.
              </p>
          </div>
          <div className="bg-theme-secondary border border-theme rounded-lg p-6">
            <h3 className="font-semibold text-theme-primary mb-2">Do you ship internationally?</h3>
            <p className="text-theme-secondary">
              Yes, we ship to select countries. International shipping rates and delivery times 
              vary by location. Additional customs duties may apply.
            </p>
          </div>
          <div className="bg-theme-secondary border border-theme rounded-lg p-6">
            <h3 className="font-semibold text-theme-primary mb-2">What if my package is lost or damaged?</h3>
            <p className="text-theme-secondary">
              All packages are insured. If your package is lost or damaged, please contact our 
              customer service team immediately. We&apos;ll work with the carrier to resolve the issue.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-theme-secondary rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-theme-primary mb-4">Need Help?</h2>
        <p className="text-theme-secondary mb-6">
          Have questions about shipping? Our customer service team is here to help.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/contact"
            className="bg-theme-primary text-theme-secondary px-6 py-3 rounded-lg transition-colors duration-200"
          >
            Contact Us
          </a>
          <a
            href="/faq"
            className="bg-theme-primary text-theme-secondary px-6 py-3 rounded-lg transition-colors duration-200"
          >
            View FAQ
          </a>
        </div>
      </div>
    </div>
  )
}

export default ShippingPage 