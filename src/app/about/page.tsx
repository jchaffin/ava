'use client'

import React from 'react'
import Link from 'next/link'
import { 
  HeartIcon, 
  SparklesIcon, 
  ShieldCheckIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'

const AboutPage: React.FC = () => {
  const values = [
    {
      icon: HeartIcon,
      title: "Natural & Safe",
      description: "We use only the finest natural ingredients, carefully selected for their efficacy and safety."
    },
    {
      icon: SparklesIcon,
      title: "Innovation",
      description: "Our products are backed by cutting-edge research and innovative formulations."
    },
    {
      icon: ShieldCheckIcon,
      title: "Quality Assured",
      description: "Every product undergoes rigorous testing to ensure the highest quality standards."
    },
    {
      icon: GlobeAltIcon,
      title: "Sustainability",
      description: "We&apos;re committed to eco-friendly practices and sustainable packaging solutions."
    }
  ]

  const team = [
    {
      name: "Dr. Sarah Johnson",
      role: "Founder & Chief Scientific Officer",
      bio: "With over 15 years in dermatology research, Dr. Johnson leads our product development with a focus on evidence-based formulations."
    },
    {
      name: "Michael Chen",
      role: "CEO",
      bio: "A beauty industry veteran with a passion for creating accessible, high-quality skincare solutions for everyone."
    },
    {
      name: "Dr. Emily Rodriguez",
      role: "Head of Research",
      bio: "Specializing in cosmetic chemistry, Dr. Rodriguez ensures our products meet the highest scientific standards."
    }
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">About AVA Skincare</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          We&apos;re passionate about creating premium skincare products that help you discover your natural beauty. 
          Our scientifically-formulated solutions combine the best of nature and innovation.
        </p>
      </div>

      {/* Mission Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-12 mb-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
          <p className="text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed">
            At AVA Skincare, we believe that everyone deserves access to high-quality, effective skincare. 
            Our mission is to create products that not only enhance your natural beauty but also promote 
            healthy, radiant skin through innovative formulations and sustainable practices.
          </p>
        </div>
      </div>

      {/* Values Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <div key={index} className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <value.icon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
              <p className="text-gray-600">{value.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Story Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
          <div className="space-y-4 text-gray-600">
            <p>
              AVA Skincare was born from a simple belief: that effective skincare should be accessible, 
              safe, and backed by science. Founded in 2020 by Dr. Sarah Johnson, a renowned dermatologist, 
              our journey began with a mission to bridge the gap between luxury skincare and scientific innovation.
            </p>
            <p>
              What started as a small laboratory in New York has grown into a trusted brand known for 
              its commitment to quality, transparency, and results. Every product we create is the result 
              of extensive research, rigorous testing, and a deep understanding of skin science.
            </p>
            <p>
              Today, AVA Skincare serves customers worldwide, helping thousands of people achieve their 
              skincare goals with products that are as effective as they are gentle.
            </p>
          </div>
        </div>
        <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl font-bold text-gray-300 mb-4">2020</div>
            <p className="text-gray-600">The year AVA Skincare was founded</p>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Meet Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {team.map((member, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 text-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-400">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
              <p className="text-blue-600 font-medium mb-3">{member.role}</p>
              <p className="text-gray-600 text-sm">{member.bio}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-900 text-white rounded-2xl p-12 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold mb-2">50K+</div>
            <p className="text-gray-300">Happy Customers</p>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">25+</div>
            <p className="text-gray-300">Products</p>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">98%</div>
            <p className="text-gray-300">Satisfaction Rate</p>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">3</div>
            <p className="text-gray-300">Years of Excellence</p>
          </div>
        </div>
      </div>

      {/* Commitment Section */}
      <div className="bg-green-50 rounded-2xl p-12 mb-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Commitment to You</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="text-left">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Quality Assurance</h3>
              <p className="text-gray-600">
                Every product undergoes rigorous testing to ensure safety, efficacy, and quality. 
                We never compromise on the standards that keep your skin healthy and beautiful.
              </p>
            </div>
            <div className="text-left">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Customer Satisfaction</h3>
              <p className="text-gray-600">
                Your satisfaction is our priority. We offer a 30-day return policy and dedicated 
                customer support to ensure you&apos;re completely happy with your purchase.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to Start Your Skincare Journey?</h2>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Discover our collection of premium skincare products designed to help you achieve 
          radiant, healthy skin.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/products"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
          >
            Shop Products
          </Link>
          <Link
            href="/contact"
            className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AboutPage 