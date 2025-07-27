'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui'
import { 
  StarIcon,
  BeakerIcon,
  SparklesIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  EnvelopeIcon
} from '@heroicons/react/24/solid'
import { 
  CheckCircleIcon
} from '@heroicons/react/24/outline'

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
  const [isClient, setIsClient] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setIsClient(true)
    setMounted(true)
    
    // Check for dark mode
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains('dark')
      setIsDarkMode(isDark)
    }
    
    // Initial check
    checkTheme()
    
    // Watch for theme changes
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })
    
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (isClient) {
      fetchFeaturedProducts()
    }
  }, [isClient])

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
      <section className="relative bg-theme-primary py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl lg:text-6xl font-bold text-theme-primary mb-6">
                Discover Your Perfect
                <span className="text-ava-accent block">Beauty Routine</span>
              </h1>
              <p className="text-xl text-theme-secondary mb-8 max-w-2xl">
                Transform your skincare journey with our premium collection of 
                scientifically-formulated products designed for radiant, healthy skin.
              </p>
              <div className="flex justify-center lg:justify-start">
                <Link href="/products">
                  <Button variant="primary" className="px-8 py-3 text-lg">
                    Shop Now
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="relative z-10">
                {mounted && (
                  <Image
                    src={isDarkMode ? "/images/home/main_dark.png" : "/images/home/main_light.png"}
                    alt="Premium skincare products"
                    width={600}
                    height={400}
                    className="rounded-2xl shadow-2xl w-full max-w-md md:max-w-lg lg:max-w-xl"
                    style={{ width: 'auto', height: 'auto' }}
                    priority
                  />
                )}
              </div>
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-yellow-200 rounded-full opacity-80 animate-bounce" />
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-pink-200 rounded-full opacity-80 animate-bounce" style={{ animationDelay: '0.5s' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-theme-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-theme-primary mb-4">
              Why Choose AVA?
            </h2>
            <p className="text-xl text-theme-secondary max-w-3xl mx-auto">
              Our commitment to quality, science, and your skin&apos;s health sets us apart
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: BeakerIcon,
                title: 'Scientifically Formulated',
                description: 'Every product is backed by dermatological research and clinical testing',
              },
              {
                icon: SparklesIcon,
                title: 'Natural Ingredients',
                description: 'Premium natural ingredients sourced from the finest suppliers worldwide',
              },
              {
                icon: StarIcon,
                title: 'Proven Results',
                description: 'Thousands of satisfied customers with visible improvements in their skin',
              }
            ].map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-xl bg-theme-primary shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex justify-center mb-4">
                  <feature.icon className={`w-12 h-12 text-theme-secondary`} />
                </div>
                <h3 className="text-xl font-semibold text-theme-secondary mb-3">{feature.title}</h3>
                <p className="text-theme-muted">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Preview */}
      <section className="py-20 px-4 bg-theme-primary">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-theme-primary mb-4">
              Featured Products
            </h2>
            <p className="text-xl text-theme-secondary max-w-3xl mx-auto">
              Discover our most popular skincare solutions
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {loading ? (
              // Loading skeletons
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="bg-theme-primary rounded-xl shadow-lg overflow-hidden animate-pulse">
                  <div className="relative h-48 bg-text-primary"></div>
                  <div className="p-4">
                    <div className="h-4 bg-theme-secondary rounded mb-2"></div>
                    <div className="h-4 bg-theme-secondary rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <div 
                  key={product._id} 
                  className="bg-theme-primary rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
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
                    <h3 className="font-semibold text-theme-primary mb-2">{product.name}</h3>
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
      <section className="py-20 px-4 bg-theme-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-theme-primary mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-theme-secondary max-w-3xl mx-auto">
              Real results from real people
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Johnson',
                role: 'Skincare Enthusiast',
                content: 'The hydrating serum completely transformed my dry skin. I can\'t imagine my routine without it!',
                rating: 5
              },
              {
                name: 'Michael Chen',
                role: 'Dermatologist',
                content: 'As a dermatologist, I\'m impressed with the quality and effectiveness of AVA products.',
                rating: 5
              },
              {
                name: 'Emma Davis',
                role: 'Beauty Blogger',
                content: 'I\'ve tried many brands, but AVA consistently delivers results. My skin has never looked better!',
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-theme-primary shadow-lg p-6 rounded-xl">
                <div className="flex mb-4 space-x-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon 
                      key={i} 
                      className="w-4 h-4 text-[var(--ava-primary)]" 
                    />
                  ))}
                </div>
                <p className="ava-text-tertiary mb-4 italic">&quot;{testimonial.content}&quot;</p>
                <div>
                  <p className="font-semibold text-theme-primary">{testimonial.name}</p>
                  <p className="text-theme-secondary text-sm">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-theme-primary relative">
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="mb-8">
            <h2 className="text-4xl lg:text-6xl font-bold text-theme-primary mb-6 leading-tight">
              Ready to Transform
              <span className="block text-gradient">
                Your Skin
              </span>
            </h2>
            <p className="text-xl lg:text-2xl text-theme-secondary mb-12 max-w-3xl mx-auto leading-relaxed">
              Join thousands of customers who have discovered the power of premium skincare
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/products">
              <Button className="px-10 py-4 text-lg theme-bg-primary text-theme-primary font-bold rounded-full shadow-2xl hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105">
                Start Shopping
              </Button>
            </Link>
            <Link href="/register">
              <Button className="px-10 py-4 text-lg bg-theme-primary text-theme-primary font-bold rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105">
                Create Account
              </Button>
            </Link>
          </div>
          
          <div className="mt-12 flex justify-center items-center space-x-8 text-theme-secondary text-sm">
            <div className="flex items-center">
              <TruckIcon className="w-4 h-4 text-theme-primary mr-2" />
              Free Shipping
            </div>
            <div className="flex items-center">
              <ArrowPathIcon className="w-4 h-4 text-theme-primary mr-2" />
              30-Day Returns
            </div>
            <div className="flex items-center">
              <ShieldCheckIcon className="w-4 h-4 text-theme-primary mr-2" />
              Secure Checkout
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 px-4 bg-theme-primary">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-theme-primary mb-4">
            Stay Updated
          </h3>
          <p className="ava-text-tertiary mb-6">
            Get the latest skincare tips, product launches, and exclusive offers
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <div className="flex-1 flex items-center rounded-lg border border-theme bg-theme-tertiary">
              <EnvelopeIcon className="w-5 h-5 text-theme-muted ml-3 mr-2" />
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-3 py-3 outline-none focus:ring-0 focus:border-0 focus:shadow-none border-0 bg-transparent text-theme-primary placeholder-theme-muted"
              />
            </div>
            <Button variant="primary" className="px-6 py-3 whitespace-nowrap">
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
