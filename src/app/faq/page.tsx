'use client'

import React, { useState } from 'react'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui'

interface FAQItem {
  question: string
  answer: string
}

const FAQPage: React.FC = () => {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set())

  const faqData: FAQItem[] = [
    {
      question: "What is AVA Skincare?",
      answer: "AVA Skincare is a premium skincare brand offering scientifically-formulated products designed for radiant, healthy skin. Our collection includes serums, moisturizers, and treatments crafted with high-quality ingredients."
    },
    {
      question: "How do I choose the right products for my skin type?",
      answer: "We recommend starting with our skin assessment quiz or consulting with our skincare experts. Different skin types (dry, oily, combination, sensitive) require different formulations. Our product descriptions include detailed information about which skin types each product is best suited for."
    },
    {
      question: "Are your products suitable for sensitive skin?",
      answer: "Yes, many of our products are formulated with sensitive skin in mind. We use gentle, non-irritating ingredients and avoid common irritants. However, we always recommend patch testing new products and consulting with a dermatologist if you have specific skin concerns."
    },
    {
      question: "How long does shipping take?",
      answer: "Standard shipping typically takes 3-5 business days within the continental US. Express shipping (1-2 business days) is available for an additional fee. International shipping times vary by location."
    },
    {
      question: "What is your return policy?",
      answer: "We offer a 30-day return policy for unused products in their original packaging. If you're not satisfied with your purchase, you can return it for a full refund or exchange. Please contact our customer service team to initiate a return."
    },
    {
      question: "Are your products cruelty-free?",
      answer: "Yes, all AVA Skincare products are cruelty-free and we do not test on animals. We are committed to ethical practices and sustainable sourcing."
    },
    {
      question: "How should I store my skincare products?",
      answer: "Store products in a cool, dry place away from direct sunlight. Some products may require refrigeration - check the product label for specific storage instructions. Always keep products tightly sealed when not in use."
    },
    {
      question: "Can I use multiple products together?",
      answer: "Yes, but it's important to layer products correctly and not overwhelm your skin. Start with a gentle cleanser, then apply products from thinnest to thickest consistency. We recommend introducing new products gradually to monitor how your skin responds."
    },
    {
      question: "Do you offer samples?",
      answer: "We occasionally offer sample sizes with purchases or as promotional items. Check our website regularly for sample offers, or contact customer service to inquire about current availability."
    },
    {
      question: "How can I track my order?",
      answer: "Once your order ships, you'll receive a confirmation email with tracking information. You can also track your order through your account dashboard or by contacting our customer service team."
    }
  ]

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems)
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index)
    } else {
      newOpenItems.add(index)
    }
    setOpenItems(newOpenItems)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-theme-secondary mb-3 sm:mb-4">Frequently Asked Questions</h1>
        <p className="text-base sm:text-lg text-theme-secondary max-w-2xl mx-auto">
          Find answers to common questions about our products, shipping, returns, and more.
        </p>
      </div>

      {/* FAQ Section */}
      <div className="space-y-3 sm:space-y-4">
        {faqData.map((item, index) => (
          <div key={index} className="bg-theme-secondary border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <Button
              onClick={() => toggleItem(index)}
              className="btn-primary w-full px-6 py-4 text-left flex items-center justify-between transition-colors duration-200"
            >
              <h3 className="text-lg font-medium text-theme-primary flex-1 pr-4">{item.question}</h3>
              <div className="flex-shrink-0 flex items-center">
                {openItems.has(index) ? (
                  <ChevronUpIcon className="w-5 h-5 text-theme-muted" />
                ) : (
                  <ChevronDownIcon className="w-5 h-5 text-theme-muted" />
                )}
              </div>
            </Button>
            {openItems.has(index) && (
              <div className="px-6 pb-6">
                <p className="text-theme-secondary leading-relaxed text-sm sm:text-base">{item.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Contact Section */}
      <div className="mt-8 sm:mt-12 bg-gray-50 rounded-lg p-6 sm:p-8 text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-theme-primary mb-3 sm:mb-4">Still have questions?</h2>
        <p className="text-theme-secondary mb-4 sm:mb-6 text-sm sm:text-base">
          Can&apos;t find what you&apos;re looking for? Our customer service team is here to help.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <a
            href="/contact"
            className="text-theme-primary px-4 sm:px-6 py-3 rounded-lg bg-theme-secondary transition-colors duration-200 text-sm sm:text-base font-medium"
          >
            Contact Us
          </a>
          <a
            href="/support"
            className="border border-gray-300 ava-text-tertiary px-4 sm:px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm sm:text-base font-medium"
          >
            Get Support
          </a>
        </div>
      </div>
    </div>
  )
}

export default FAQPage 