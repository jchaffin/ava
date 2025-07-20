'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'

import { Button } from '@/components/ui'
import { useCart } from '@/context'
import { IProduct } from '@/types'
import { formatPrice } from '@/utils/helpers'
import toast from 'react-hot-toast'
import { 
  HeartIcon, 
  ShareIcon, 
  StarIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'

interface ProductDetailsPageProps {
  params: Promise<{
    id: string
  }>
}

interface ProductPageState {
  product: IProduct | null
  loading: boolean
  error: string | null
  quantity: number
  selectedImageIndex: number
  isWishlisted: boolean
  reviews: ProductReview[]
  loadingReviews: boolean
}

interface ProductReview {
  id: string
  userId: string
  userName: string
  rating: number
  comment: string
  createdAt: string
  verified: boolean
}

const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({ params }) => {
  const { id } = React.use(params)
  const router = useRouter()
  const { data: session } = useSession()
  const { addItem } = useCart()

  const [state, setState] = useState<ProductPageState>({
    product: null,
    loading: true,
    error: null,
    quantity: 1,
    selectedImageIndex: 0,
    isWishlisted: false,
    reviews: [],
    loadingReviews: false,
  })

  useEffect(() => {
    if (id) {
      fetchProduct()
      fetchReviews()
    }
  }, [id])

  const fetchProduct = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      const response = await fetch(`/api/products/${id}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          router.push('/products')
          toast.error('Product not found')
          return
        }
        throw new Error(`Failed to fetch product: ${response.statusText}`)
      }

      const responseData = await response.json()
      
      if (responseData.success && responseData.data) {
        setState(prev => ({
          ...prev,
          product: responseData.data,
          loading: false,
        }))
      } else {
        throw new Error(responseData.message || 'Failed to fetch product')
      }

      // Check if product is in wishlist (if user is logged in)
      if (session?.user?.id) {
        checkWishlistStatus(product._id)
      }

    } catch (error) {
      console.error('Error fetching product:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load product',
        loading: false,
      }))
      toast.error('Failed to load product')
    }
  }

  const fetchReviews = async () => {
    try {
      setState(prev => ({ ...prev, loadingReviews: true }))

      // In a real app, this would fetch actual reviews
      // const response = await fetch(`/api/products/${id}/reviews`)
      // const reviews = await response.json()

      // Mock reviews for demo
      const mockReviews: ProductReview[] = [
        {
          id: '1',
          userId: 'user1',
          userName: 'John Doe',
          rating: 5,
          comment: 'Excellent product! Highly recommended.',
          createdAt: '2024-01-15T10:30:00Z',
          verified: true,
        },
        {
          id: '2',
          userId: 'user2',
          userName: 'Jane Smith',
          rating: 4,
          comment: 'Good quality, fast shipping.',
          createdAt: '2024-01-10T15:45:00Z',
          verified: true,
        },
      ]

      setState(prev => ({
        ...prev,
        reviews: mockReviews,
        loadingReviews: false,
      }))

    } catch (error) {
      console.error('Error fetching reviews:', error)
      setState(prev => ({ ...prev, loadingReviews: false }))
    }
  }

  const checkWishlistStatus = async (productId: string) => {
    try {
      // In a real app, check if product is in user's wishlist
      // const response = await fetch(`/api/wishlist/check/${productId}`)
      // const { isWishlisted } = await response.json()
      
      // Mock wishlist status
      const isWishlisted = false
      setState(prev => ({ ...prev, isWishlisted }))

    } catch (error) {
      console.error('Error checking wishlist status:', error)
    }
  }

  const handleQuantityChange = (newQuantity: number) => {
    if (!state.product) return

    const validQuantity = Math.max(1, Math.min(state.product.stock, newQuantity))
    setState(prev => ({ ...prev, quantity: validQuantity }))
  }

  const handleAddToCart = () => {
    if (!state.product) return

    if (state.product.stock === 0) {
      toast.error('Product is out of stock')
      return
    }

    if (state.quantity > state.product.stock) {
      toast.error(`Only ${state.product.stock} items available`)
      return
    }

    for (let i = 0; i < state.quantity; i++) {
      addItem(state.product)
    }

    toast.success(`${state.quantity} item(s) added to cart!`)
  }

  const handleBuyNow = () => {
    if (!session) {
      router.push('/signin?callbackUrl=' + encodeURIComponent(window.location.pathname))
      return
    }

    handleAddToCart()
    router.push('/cart')
  }

  const handleWishlistToggle = async () => {
    if (!session) {
      toast.error('Please sign in to add to wishlist')
      return
    }

    if (!state.product) return

    try {
      // In a real app, toggle wishlist status
      // const response = await fetch(`/api/wishlist/${state.product._id}`, {
      //   method: state.isWishlisted ? 'DELETE' : 'POST'
      // })

      const newWishlistStatus = !state.isWishlisted
      setState(prev => ({ ...prev, isWishlisted: newWishlistStatus }))

      toast.success(
        newWishlistStatus 
          ? 'Added to wishlist' 
          : 'Removed from wishlist'
      )

    } catch (error) {
      toast.error('Failed to update wishlist')
    }
  }

  const handleShare = async () => {
    if (!state.product) return

    if (navigator.share) {
      try {
        await navigator.share({
          title: state.product.name,
          text: state.product.description,
          url: window.location.href,
        })
      } catch (error) {
        // User cancelled share
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Product link copied to clipboard!')
    }
  }

  const calculateAverageRating = (): number => {
    if (state.reviews.length === 0) return 0
    const sum = state.reviews.reduce((acc, review) => acc + review.rating, 0)
    return Math.round((sum / state.reviews.length) * 10) / 10
  }

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
    }

    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  if (state.loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="aspect-square bg-gray-300 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              <div className="h-6 bg-gray-300 rounded w-1/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (state.error || !state.product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Product Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            {state.error || 'The product you are looking for does not exist.'}
          </p>
          <Link href="/products">
            <Button>
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Products
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const { product } = state
  const averageRating = calculateAverageRating()
  const isOutOfStock = product.stock === 0
  const isLowStock = product.stock > 0 && product.stock <= 5

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-gray-700">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-gray-700">Products</Link>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes={product.sizes || '(max-width: 768px) 100vw, 50vw'}
                className="object-cover"
                priority
              />
              {product.featured && (
                <div className="absolute top-4 left-4 bg-blue-500 text-white px-2 py-1 rounded text-sm font-medium">
                  Featured
                </div>
              )}
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <span className="text-white text-lg font-semibold">Out of Stock</span>
                </div>
              )}
            </div>

            {/* Additional product images would go here */}
            <div className="grid grid-cols-4 gap-2">
              {/* Mock additional images */}
              {[1, 2, 3, 4].map((index) => (
                <div
                  key={index}
                  className="aspect-square bg-gray-100 rounded-lg cursor-pointer border-2 border-transparent hover:border-blue-500"
                  onClick={() => setState(prev => ({ ...prev, selectedImageIndex: index }))}
                >
                  <Image
                    src={product.image}
                    alt={`${product.name} view ${index}`}
                    width={100}
                    height={100}
                    sizes="100px"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Product Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  {renderStars(averageRating)}
                  <span className="text-sm text-gray-600 ml-2">
                    ({state.reviews.length} reviews)
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleWishlistToggle}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    {state.isWishlisted ? (
                      <HeartSolidIcon className="w-6 h-6 text-red-500" />
                    ) : (
                      <HeartIcon className="w-6 h-6 text-gray-400" />
                    )}
                  </button>
                  
                  <button
                    onClick={handleShare}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <ShareIcon className="w-6 h-6 text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="text-3xl font-bold text-green-600 mb-4">
                {formatPrice(product.price)}
              </div>

              {/* Stock Status */}
              <div className="mb-4">
                {isOutOfStock ? (
                  <span className="text-red-600 font-medium">Out of Stock</span>
                ) : isLowStock ? (
                  <span className="text-orange-600 font-medium">
                    Only {product.stock} left in stock
                  </span>
                ) : (
                  <span className="text-green-600 font-medium">In Stock</span>
                )}
              </div>
            </div>

            {/* Product Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Product Details */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h3>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">SKU</dt>
                  <dd className="mt-1 text-sm text-gray-900">{product._id?.slice(-8).toUpperCase() || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Availability</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {isOutOfStock ? 'Out of Stock' : `${product.stock} units`}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Added</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Quantity and Add to Cart */}
            {!isOutOfStock && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleQuantityChange(state.quantity - 1)}
                      disabled={state.quantity <= 1}
                      className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Decrease quantity</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                      </svg>
                    </button>
                    
                    <span className="px-4 py-2 border border-gray-300 rounded-md min-w-[60px] text-center">
                      {state.quantity}
                    </span>
                    
                    <button
                      onClick={() => handleQuantityChange(state.quantity + 1)}
                      disabled={state.quantity >= product.stock}
                      className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Increase quantity</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button
                    onClick={handleAddToCart}
                    className="flex-1"
                    size="lg"
                  >
                    Add to Cart
                  </Button>
                  
                  <Button
                    onClick={handleBuyNow}
                    variant="secondary"
                    className="flex-1"
                    size="lg"
                  >
                    Buy Now
                  </Button>
                </div>
              </div>
            )}

            {/* Shipping and Returns */}
            <div className="border-t border-gray-200 pt-6 space-y-4">
              <div className="flex items-center space-x-3">
                <TruckIcon className="w-6 h-6 text-gray-400" />
                <div>
                  <h4 className="font-medium text-gray-900">Free Shipping</h4>
                  <p className="text-sm text-gray-600">On orders over $100</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <ShieldCheckIcon className="w-6 h-6 text-gray-400" />
                <div>
                  <h4 className="font-medium text-gray-900">30-Day Returns</h4>
                  <p className="text-sm text-gray-600">Easy returns and exchanges</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16 border-t border-gray-200 pt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Customer Reviews</h2>
          
          {state.loadingReviews ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center space-x-4 mb-2">
                    <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-32"></div>
                      <div className="h-3 bg-gray-300 rounded w-20"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-gray-300 rounded w-3/4 ml-14"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {state.reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-6">
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {review.userName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900">{review.userName}</h4>
                        {review.verified && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {renderStars(review.rating, 'sm')}
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 ml-14">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
  )
}

export default ProductDetailsPage
