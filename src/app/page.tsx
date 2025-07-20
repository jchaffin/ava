'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui'

interface Product {
  _id: string
  name: string
  description: string
  price: number
  stock: number
  image: string
  featured: boolean
  createdAt: string
}

export default function Home() {
  const router = useRouter()
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedProducts()
  }, [])

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/products?featured=true&limit=4')
      const data = await response.json()
      
      if (data.success && data.data?.products) {
        setFeaturedProducts(data.data.products)
      }
    } catch (error) {
      console.error('Error fetching featured products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProductClick = (productId: string) => {
    router.push(`/products/${productId}`)
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-white py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
                Discover Your Perfect
                <span className="text-ava-accent block">Beauty Routine</span>
              </h1>
              <p className="text-xl text-gray-700 mb-8 max-w-2xl">
                Transform your skincare journey with our premium collection of 
                scientifically-formulated products designed for radiant, healthy skin.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/products">
                  <Button className="px-8 py-3 text-lg">
                    Shop Now
                  </Button>
                </Link>
                                 <Link href="/products">
                   <Button variant="secondary" className="px-8 py-3 text-lg">
                     Learn More
                   </Button>
                 </Link>
              </div>
            </div>
            <div className="relative">
              <div className="relative z-10">
                <Image
                  src="/images/home/home_main.png"
                  alt="Premium skincare products"
                  width={600}
                  height={400}
                  className="rounded-2xl shadow-2xl"
                  priority
                />
              </div>
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-yellow-200 rounded-full opacity-80 animate-bounce" />
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-pink-200 rounded-full opacity-80 animate-bounce" style={{ animationDelay: '0.5s' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose AVA?
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Our commitment to quality, science, and your skin&apos;s health sets us apart
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '🧪',
                title: 'Scientifically Formulated',
                description: 'Every product is backed by dermatological research and clinical testing'
              },
              {
                icon: '🌿',
                title: 'Natural Ingredients',
                description: 'Premium natural ingredients sourced from the finest suppliers worldwide'
              },
              {
                icon: '✨',
                title: 'Proven Results',
                description: 'Thousands of satisfied customers with visible improvements in their skin'
              }
            ].map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-700">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Preview */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Featured Products
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Discover our most popular skincare solutions
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {loading ? (
              // Loading skeletons
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                  <div className="relative h-48 bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <div 
                  key={product._id} 
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => handleProductClick(product._id)}
                >
                  <div className="relative h-48">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 25vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-black mb-2">{product.name}</h3>
                    <p className="text-ava-accent font-bold">${product.price.toFixed(2)}</p>
                  </div>
                </div>
              ))
            ) : (
              // Fallback to hardcoded products if no featured products found
              [
                {
                  name: 'Hydrating Serum',
                  price: '$49.99',
                  image: '/images/products/hydserum/hydserum_main.jpg',
                },
                {
                  name: 'Vitamin C Serum',
                  price: '$59.99',
                  image: '/images/products/vitcserum/vitcserum_main.jpg',
                },
                {
                  name: 'Collagen Serum',
                  price: '$69.99',
                  image: '/images/products/collagenserum/collagenserum_main.jpg',
                },
                {
                  name: 'Anti-Age Serum',
                  price: '$79.99',
                  image: '/images/products/antiageserum/antiageserum_main.jpg',
                }
              ].map((fallbackProduct, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="relative h-48">
                    <Image
                      src={fallbackProduct.image}
                      alt={fallbackProduct.name}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 25vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-black mb-2">{fallbackProduct.name}</h3>
                    <p className="text-ava-accent font-bold">{fallbackProduct.price}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="text-center">
            <Link href="/products">
              <Button className="px-8 py-3 text-lg">
                View All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Real results from real people
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Johnson',
                role: 'Skincare Enthusiast',
                content: 'The hydrating serum completely transformed my dry skin. I can&apos;t imagine my routine without it!',
                rating: 5
              },
              {
                name: 'Michael Chen',
                role: 'Dermatologist',
                content: 'As a dermatologist, I&apos;m impressed with the quality and effectiveness of AVA products.',
                rating: 5
              },
              {
                name: 'Emma Davis',
                role: 'Beauty Blogger',
                content: 'I&apos;ve tried many brands, but AVA consistently delivers results. My skin has never looked better!',
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white shadow-lg p-6 rounded-xl">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400">⭐</span>
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">&quot;{testimonial.content}&quot;</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-gray-600 text-sm">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-white relative">
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="mb-8">
            <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Ready to Transform
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600">
                Your Skin?
              </span>
            </h2>
            <p className="text-xl lg:text-2xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join thousands of customers who have discovered the power of premium skincare
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/products">
              <Button className="px-10 py-4 text-lg bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold rounded-full shadow-2xl hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105">
                Start Shopping
              </Button>
            </Link>
            <Link href="/register">
              <Button className="px-10 py-4 text-lg bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold rounded-full shadow-2xl hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105">
                Create Account
              </Button>
            </Link>
          </div>
          
          <div className="mt-12 flex justify-center items-center space-x-8 text-gray-600 text-sm">
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              Free Shipping
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              30-Day Returns
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              Secure Checkout
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Stay Updated
          </h3>
          <p className="text-gray-700 mb-6">
            Get the latest skincare tips, product launches, and exclusive offers
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button className="px-6 py-3">
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
