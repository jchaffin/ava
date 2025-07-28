'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui'
import { getProductImageUrl } from '@/utils/helpers'
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
      <section className="relative bg-theme-primary py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-center lg:text-left order-2 lg:order-1">
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-theme-primary mb-4 sm:mb-6 leading-tight">
                Discover Your Perfect
                <span className="text-ava-accent block mt-1 sm:mt-2">Beauty Routine</span>
              </h1>
              <p className="text-lg sm:text-xl text-theme-secondary mb-6 sm:mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Transform your skincare journey with our premium collection of 
                scientifically-formulated products designed for radiant, healthy skin.
              </p>
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                <Link href="/products" className="w-full sm:w-auto">
                  <Button variant="primary" className="w-full sm:w-auto px-6 sm:px-8 py-3 text-base sm:text-lg">
                    Shop Now
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative order-1 lg:order-2">
              <div className="relative z-10 flex justify-center lg:justify-end">
                {mounted && (
                  <Image
                    src={isDarkMode ? "/images/home/main_dark.png" : "/images/home/main_light.png"}
                    alt="Premium skincare products"
                    width={600}
                    height={400}
                    className="rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl"
                    style={{ width: 'auto', height: 'auto' }}
                    priority
                    onError={(e) => {
                      console.error('Image failed to load:', e);
                      // Fallback to a different image if needed
                    }}
                    onLoad={() => {
                      console.log('Image loaded successfully');
                    }}
                  />
                )}
              </div>
              {/* Floating elements - hidden on mobile for cleaner look */}
              <div className="hidden lg:block absolute -top-4 -right-4 w-20 h-20 bg-yellow-200 rounded-full opacity-80 animate-bounce" />
              <div className="hidden lg:block absolute -bottom-4 -left-4 w-16 h-16 bg-pink-200 rounded-full opacity-80 animate-bounce" style={{ animationDelay: '0.5s' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-theme-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-theme-primary mb-3 sm:mb-4">
              Why Choose AVA?
            </h2>
            <p className="text-lg sm:text-xl text-theme-secondary max-w-3xl mx-auto px-4">
              Our commitment to quality, science, and your skin&apos;s health sets us apart
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
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
              <div key={index} className="text-center p-6 sm:p-8 rounded-xl bg-theme-primary shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex justify-center mb-4 sm:mb-6">
                  <feature.icon className={`w-10 h-10 sm:w-12 sm:h-12 text-theme-secondary`} />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-theme-secondary mb-3">{feature.title}</h3>
                <p className="text-theme-muted text-sm sm:text-base leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Preview */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-theme-primary">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-theme-primary mb-3 sm:mb-4">
              Featured Products
            </h2>
            <p className="text-lg sm:text-xl text-theme-secondary max-w-3xl mx-auto px-4">
              Discover our most popular skincare solutions
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-12">
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
                  <div className="relative h-48 sm:h-56">
                    <Image
                      src={getProductImageUrl(product.image, product._id)}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 25vw, 25vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4 sm:p-6">
                    <h3 className="font-semibold text-theme-primary mb-2 text-sm sm:text-base">{product.name}</h3>
                    <p className="text-ava-accent font-bold text-lg sm:text-xl">${product.price.toFixed(2)}</p>
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
                <div key={index} className="bg-theme-secondary rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="relative h-48 sm:h-56">
                    <Image
                      src={fallbackProduct.image}
                      alt={fallbackProduct.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 25vw, 25vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4 sm:p-6">
                    <h3 className="font-semibold text-black mb-2 text-sm sm:text-base">{fallbackProduct.name}</h3>
                    <p className="text-ava-accent font-bold text-lg sm:text-xl">{fallbackProduct.price}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="text-center">
            <Link href="/products">
              <Button className="px-6 sm:px-8 py-3 text-base sm:text-lg">
                View All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-theme-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-theme-primary mb-3 sm:mb-4">
              What Our Customers Say
            </h2>
            <p className="text-lg sm:text-xl text-theme-secondary max-w-3xl mx-auto px-4">
              Real results from real people
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
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
              <div key={index} className="bg-theme-primary shadow-lg p-6 sm:p-8 rounded-xl">
                <div className="flex mb-4 space-x-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon 
                      key={i} 
                      className="w-4 h-4 text-[var(--ava-primary)]" 
                    />
                  ))}
                </div>
                <p className="ava-text-tertiary mb-4 italic text-sm sm:text-base leading-relaxed">&quot;{testimonial.content}&quot;</p>
                <div>
                  <p className="font-semibold text-theme-primary text-sm sm:text-base">{testimonial.name}</p>
                  <p className="text-theme-secondary text-xs sm:text-sm">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-theme-primary relative">
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-theme-primary mb-4 sm:mb-6 leading-tight">
              Ready to Transform
              <span className="block text-gradient mt-1 sm:mt-2">
                Your Skin
              </span>
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl text-theme-secondary mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
              Join thousands of customers who have discovered the power of premium skincare
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4">
            <Link href="/products" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 text-base sm:text-lg theme-bg-primary text-theme-primary font-bold rounded-full shadow-2xl hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105">
                Start Shopping
              </Button>
            </Link>
            <Link href="/register" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 text-base sm:text-lg bg-theme-primary text-theme-primary font-bold rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105">
                Create Account
              </Button>
            </Link>
          </div>
          
          <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8 text-theme-secondary text-xs sm:text-sm px-4">
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
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-theme-primary">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-xl sm:text-2xl font-bold text-theme-primary mb-3 sm:mb-4">
            Stay Updated
          </h3>
          <p className="ava-text-tertiary mb-6 text-sm sm:text-base">
            Get the latest skincare tips, product launches, and exclusive offers
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <div className="flex-1 flex items-center rounded-lg border border-theme bg-theme-tertiary">
              <EnvelopeIcon className="w-5 h-5 text-theme-muted ml-3 mr-2" />
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-3 py-3 outline-none focus:ring-0 focus:border-0 focus:shadow-none border-0 bg-transparent text-theme-primary placeholder-theme-muted text-sm sm:text-base"
              />
            </div>
            <Button variant="primary" className="px-6 py-3 whitespace-nowrap text-sm sm:text-base">
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
