'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'

import { Button } from '@/components/ui'
import { useCart } from '@/context'
import { IProduct } from '@/types'
import { formatPrice, getSubDir } from '@/utils/helpers'
import { localKeyToUrl, isLocalKey, extractKeyFromLocalUrl } from '@/lib/local-storage-client'
import toast from 'react-hot-toast'
import { 
  HeartIcon, 
  ShareIcon, 
  StarIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import { Minus, Plus } from 'lucide-react'
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
  const [id, setId] = useState<string>('')
  const [isClient, setIsClient] = useState(false)
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

  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
    showForm: false
  })
  const [submittingReview, setSubmittingReview] = useState(false)

  // Handle params on client side to prevent hydration issues
  useEffect(() => {
    setIsClient(true)
    const resolveParams = async () => {
      const resolvedParams = await params
      setId(resolvedParams.id)
    }
    resolveParams()
  }, [params])

  useEffect(() => {
    if (id && isClient) {
      fetchProduct()
      fetchReviews()
    }
  }, [id, isClient])

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
        checkWishlistStatus(responseData.data._id)
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
      const response = await fetch(`/api/wishlist/check/${productId}`)
      
      if (response.ok) {
        const responseData = await response.json()
        if (responseData.success) {
          setState(prev => ({ ...prev, isWishlisted: responseData.data.isWishlisted }))
        }
      } else {
        console.error('Failed to check wishlist status:', response.statusText)
      }
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
      const method = state.isWishlisted ? 'DELETE' : 'POST'
      const url = state.isWishlisted 
        ? `/api/wishlist?productId=${state.product._id}`
        : '/api/wishlist'
      
      const body = state.isWishlisted ? undefined : JSON.stringify({ productId: state.product._id })
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      })

      if (response.ok) {
        const newWishlistStatus = !state.isWishlisted
        setState(prev => ({ ...prev, isWishlisted: newWishlistStatus }))

        toast.success(
          newWishlistStatus 
            ? 'Added to wishlist' 
            : 'Removed from wishlist'
        )
      } else {
        toast.error('Failed to update wishlist')
      }

    } catch (error) {
      console.error('Error updating wishlist:', error)
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

  const handleSubmitReview = async () => {
    if (!reviewForm.comment.trim()) {
      toast.error('Please enter a review comment')
      return
    }

    try {
      setSubmittingReview(true)
      
      // In a real app, this would make an API call
      // const response = await fetch(`/api/products/${id}/reviews`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     rating: reviewForm.rating,
      //     comment: reviewForm.comment
      //   })
      // })

      // Mock successful review submission
      const newReview: ProductReview = {
        id: Date.now().toString(),
        userId: 'current-user',
        userName: 'You',
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        createdAt: new Date().toISOString(),
        verified: true
      }

      setState(prev => ({
        ...prev,
        reviews: [newReview, ...prev.reviews]
      }))

      setReviewForm({
        rating: 5,
        comment: '',
        showForm: false
      })

      toast.success('Review submitted successfully!')
    } catch (error) {
      console.error('Error submitting review:', error)
      toast.error('Failed to submit review')
    } finally {
      setSubmittingReview(false)
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
          <h1 className="text-2xl font-bold text-theme-primary mb-4">
            Product Not Found
          </h1>
          <p className="text-theme-secondary mb-8">
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
        <nav className="flex items-center space-x-2 text-sm text-theme-muted mb-8">
          <Link href="/" className="hover:ava-text-tertiary">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:ava-text-tertiary">Products</Link>
          <span>/</span>
          <span className="text-theme-primary">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
              <div className="relative w-full h-full"> {/* Defensive wrapper for Next.js fill */}
                <Image
                  src={(() => {
                    if (isLocalKey(product.image)) {
                      return localKeyToUrl(product.image)
                    } else if (product.image.includes('/images/products/') || product.image.includes('/uploads/')) {
                      const key = extractKeyFromLocalUrl(product.image)
                      return key ? localKeyToUrl(key) : product.image
                    } else {
                      return product.image
                    }
                  })()}
                  alt={product.name}
                  fill
                  sizes={product.sizes || '(max-width: 768px) 100vw, 50vw'}
                  className="object-cover"
                  priority
                />
              </div>

              {isOutOfStock && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <span className="text-theme-primary text-lg font-semibold">Out of Stock</span>
                </div>
              )}
            </div>

            {/* Additional product images would go here */}
            <div className="grid grid-cols-4 gap-2">
              {/* Show main image and additional images */}
              {[0, 1, 2, 3].map((index) => {
                let imageUrl = ''
                let hasImage = false
                
                if (index === 0) {
                  // First slot is always the main image
                  imageUrl = product.image
                  hasImage = true
                } else {
                  // Other slots are from the images array
                  const imageData = product.images && product.images[index - 1]
                  if (imageData) {
                    imageUrl = imageData
                    hasImage = true
                  }
                }
                
                if (hasImage) {
                  // Convert any format to URL
                  if (isLocalKey(imageUrl)) {
                    imageUrl = localKeyToUrl(imageUrl)
                  } else if (imageUrl.includes('/images/products/') || imageUrl.includes('/uploads/')) {
                    const key = extractKeyFromLocalUrl(imageUrl)
                    imageUrl = key ? localKeyToUrl(key) : imageUrl
                  }
                }
                
                return (
                  <div
                    key={index}
                    className="aspect-square bg-gray-100 rounded-lg cursor-pointer border-2 border-transparent hover:border-blue-500"
                    onClick={() => hasImage && setState(prev => ({ ...prev, selectedImageIndex: index }))}
                  >
                    {hasImage ? (
                      <Image
                        src={imageUrl}
                        alt={`${product.name} view ${index + 1}`}
                        width={100}
                        height={100}
                        sizes="100px"
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          // Hide failed image and show placeholder
                          e.currentTarget.style.display = 'none'
                          const parent = e.currentTarget.parentElement
                          if (parent) {
                            parent.innerHTML = '<div class="w-full h-full bg-theme-tertiary rounded-lg flex items-center justify-center"><span class="text-theme-muted text-xs">No Image</span></div>'
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-theme-tertiary rounded-lg flex items-center justify-center">
                        <span className="text-theme-muted text-xs">No Image</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Product Header */}
            <div>
              <h1 className="text-3xl font-bold text-theme-primary mb-2">
                {product.name}
              </h1>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  {renderStars(averageRating)}
                  <span className="text-sm text-theme-secondary ml-2">
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
                      <HeartIcon className="w-6 h-6 text-theme-secondary" />
                    )}
                  </button>
                  
                  <button
                    onClick={handleShare}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <ShareIcon className="w-6 h-6 text-theme-secondary" />
                  </button>
                </div>
              </div>

              <div className="text-3xl font-bold text-theme-primary mb-4">
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
                  <span className="text-theme-primary font-medium">In Stock</span>
                )}
              </div>
            </div>

            {/* Product Description */}
            <div>
              <h3 className="text-lg font-semibold text-theme-primary mb-2">Description</h3>
              <p className="text-theme-secondary leading-relaxed">{product.description}</p>
            </div>

            {/* Product Details */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-theme-primary mb-4">Product Details</h3>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-theme-muted">SKU</dt>
                  <dd className="mt-1 text-sm text-theme-primary">{product._id?.slice(-8).toUpperCase() || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-theme-muted">Availability</dt>
                  <dd className="mt-1 text-sm text-theme-primary">
                    {isOutOfStock ? 'Out of Stock' : `${product.stock} units`}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-theme-muted">Added</dt>
                  <dd className="mt-1 text-sm text-theme-primary">
                    {new Date(product.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Quantity and Add to Cart */}
            {!isOutOfStock && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium ava-text-tertiary mb-2">
                    Quantity
                  </label>
                  <div className="flex items-stretch border border-theme rounded-md bg-theme-primary w-fit">
                    <button
                      onClick={() => handleQuantityChange(state.quantity - 1)}
                      className="px-3 py-2 bg-theme-primary hover:bg-theme-tertiary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      aria-label="Decrease quantity"
                      disabled={state.quantity <= 1}
                    >
                      <Minus size={14} />
                    </button>
                    
                    <span className="px-4 py-2 text-center font-medium min-w-[2rem] border-x border-theme bg-theme-primary flex items-center justify-center">
                      {state.quantity}
                    </span>
                    
                    <button
                      onClick={() => handleQuantityChange(state.quantity + 1)}
                      className="px-3 py-2 bg-theme-primary hover:bg-theme-tertiary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      aria-label="Increase quantity"
                      disabled={state.quantity >= product.stock}
                    >
                      <Plus size={14} />
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
                <TruckIcon className="w-6 h-6 text-theme-secondary" />
                <div>
                  <h4 className="font-medium text-theme-primary">Free Shipping</h4>
                  <p className="text-sm text-theme-secondary">On orders over $100</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <ShieldCheckIcon className="w-6 h-6 text-theme-secondary" />
                <div>
                  <h4 className="font-medium text-theme-primary">30-Day Returns</h4>
                  <p className="text-sm text-theme-secondary">Easy returns and exchanges</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16 pt-16 bg-theme-secondary rounded-xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-theme-primary">Customer Reviews</h2>
            <Button
              onClick={() => setReviewForm(prev => ({ ...prev, showForm: !prev.showForm }))}
              variant="tertiary"
              size="sm"
            >
              {reviewForm.showForm ? 'Cancel' : 'Write a Review'}
            </Button>
          </div>

          {/* Review Form */}
          {reviewForm.showForm && (
            <div className="mb-8 bg-theme-tertiary rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-medium text-theme-primary mb-4">Write Your Review</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-theme-primary mb-2">Rating</label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                        className="focus:outline-none"
                      >
                        <StarIcon
                          className={`w-6 h-6 ${
                            star <= reviewForm.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-theme-secondary">
                      {reviewForm.rating} star{reviewForm.rating !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-theme-primary mb-2">Your Review</label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                    placeholder="Share your experience ewqwith this product..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-theme-primary"
                    rows={4}
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    onClick={() => setReviewForm(prev => ({ ...prev, showForm: false }))}
                    variant="ghost"
                    size="sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitReview}
                    loading={submittingReview}
                    disabled={submittingReview || !reviewForm.comment.trim()}
                    size="sm"
                  >
                    Submit Review
                  </Button>
                </div>
              </div>
            </div>
          )}
          
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
                <div key={review.id} className="border border-theme bg-theme-primary rounded-xl p-6 shadow-md mb-6">
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="w-10 h-10 bg-theme-tertiary rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-theme-primary">
                        {review.userName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-theme-primary">{review.userName}</h4>
                        {review.verified && null}
                      </div>
                      <div className="flex items-center space-x-2">
                        {renderStars(review.rating, 'sm')}
                        <span className="text-sm text-theme-muted">
                          {new Date(review.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="ml-14 text-theme-primary rounded-lg px-4 py-3 mt-2 inline-block w-fit">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
  )
}

export default ProductDetailsPage
