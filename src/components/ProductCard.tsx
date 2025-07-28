'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useCart } from '@/context'
import { Button } from './ui'
import { IProduct } from '@/types'
import { formatPrice, getProductImageUrl } from '@/utils/helpers'
import toast from 'react-hot-toast'
import {
  HeartIcon,
  ShoppingCartIcon,
  EyeIcon,
  StarIcon,
  TruckIcon,
} from '@heroicons/react/24/outline'
import {
  HeartIcon as HeartSolidIcon,
  StarIcon as StarSolidIcon,
} from '@heroicons/react/24/solid'

interface ProductCardProps {
  product: IProduct
  variant?: 'default' | 'compact' | 'featured' | 'list'
  showQuickActions?: boolean
  showWishlist?: boolean
  showRating?: boolean

  showStock?: boolean
  onWishlistToggle?: (productId: string, isWishlisted: boolean) => void
  onQuickView?: (product: IProduct) => void
  className?: string
}

interface ProductCardState {
  isWishlisted: boolean
  isLoading: boolean
  imageLoading: boolean
  imageError: boolean
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  variant = 'default',
  showQuickActions = true,
  showWishlist = true,
  showRating = true,

  showStock = true,
  onWishlistToggle,
  onQuickView,
  className = '',
}) => {
  const router = useRouter()
  const { data: session } = useSession()
  const { addItem } = useCart()

  const [state, setState] = useState<ProductCardState>({
    isWishlisted: false, // In a real app, this would be fetched from user's wishlist
    isLoading: false,
    imageLoading: true,
    imageError: false,
  })

  // Derived state
  const isOutOfStock = product.stock === 0
  const isLowStock = product.stock > 0 && product.stock <= 5
  const discountPercentage = 0 // Could be calculated if original price is available
  const averageRating = 4.2 // In a real app, this would come from reviews
  const reviewCount = 124 // In a real app, this would come from reviews

  // Variant-specific styling
  const getCardClasses = (): string => {
    const baseClasses = 'bg-theme-secondary rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg'
    
    switch (variant) {
      case 'compact':
        return `${baseClasses} max-w-xs`
      case 'featured':
        return `${baseClasses} ring-2 ring-blue-500 ring-opacity-50`
      case 'list':
        return `${baseClasses} flex flex-row items-center p-4`
      default:
        return baseClasses
    }
  }

  const getImageClasses = (): string => {
    if (variant === 'list') {
      return 'w-24 h-24 object-cover rounded-lg flex-shrink-0'
    }
    if (variant === 'compact') {
      return 'w-full h-32 sm:h-40 object-cover'
    }
    return 'w-full h-48 object-cover'
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isOutOfStock) {
      toast.error('Product is out of stock')
      return
    }

    setState(prev => ({ ...prev, isLoading: true }))

    try {
      addItem(product)
      toast.success(`${product.name} added to cart!`)
    } catch {
      toast.error('Failed to add item to cart')
    } finally {
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!session) {
      toast.error('Please sign in to add to wishlist')
      router.push('/signin')
      return
    }

    setState(prev => ({ ...prev, isLoading: true }))

    try {
      // In a real app, this would make an API call
      const newWishlistState = !state.isWishlisted
      setState(prev => ({ ...prev, isWishlisted: newWishlistState }))
      
      if (onWishlistToggle) {
        onWishlistToggle(product._id, newWishlistState)
      }

      toast.success(
        newWishlistState 
          ? 'Added to wishlist' 
          : 'Removed from wishlist'
      )
    } catch {
      toast.error('Failed to update wishlist')
    } finally {
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (onQuickView) {
      onQuickView(product)
    } else {
      router.push(`/products/${product._id}`)
    }
  }

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!session) {
      router.push('/signin')
      return
    }

    if (isOutOfStock) {
      toast.error('Product is out of stock')
      return
    }

    addItem(product)
    router.push('/cart')
  }

  const handleImageLoad = () => {
    setState(prev => ({ ...prev, imageLoading: false }))
  }

  const handleImageError = () => {
    setState(prev => ({ 
      ...prev, 
      imageLoading: false, 
      imageError: true 
    }))
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <div key={star} className="relative">
            {star <= Math.floor(rating) ? (
              <StarSolidIcon className="w-4 h-4 text-yellow-400" />
            ) : star === Math.ceil(rating) && rating % 1 !== 0 ? (
              <div className="relative">
                <StarIcon className="w-4 h-4 text-gray-300" />
                <div 
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${(rating % 1) * 100}%` }}
                >
                  <StarSolidIcon className="w-4 h-4 text-yellow-400" />
                </div>
              </div>
            ) : (
              <StarIcon className="w-4 h-4 text-gray-300" />
            )}
          </div>
        ))}
        <span className="text-sm text-theme-secondary ml-1">
          ({reviewCount})
        </span>
      </div>
    )
  }

  const renderBadges = () => (
    <div className="absolute top-3 left-3 flex flex-col space-y-2">
      {product.featured && (
        <span className="bg-theme-secondary text-theme-primary text-xs px-2 py-1 rounded-full font-medium">
          Featured
        </span>
      )}
      {discountPercentage > 0 && (
        <span className="bg-red-500 text-theme-primary text-xs px-2 py-1 rounded-full font-medium">
          -{discountPercentage}%
        </span>
      )}
      {isLowStock && !isOutOfStock && (
        <span className="bg-orange-500 text-theme-primary text-xs px-2 py-1 rounded-full font-medium">
          Low Stock
        </span>
      )}
      {isOutOfStock && (
        <span className="bg-gray-500 text-theme-primary text-xs px-2 py-1 rounded-full font-medium">
          Out of Stock
        </span>
      )}
    </div>
  )

  const renderQuickActions = () => {
    if (!showQuickActions || variant === 'list') return null

    return (
      <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {showWishlist && (
          <button
            onClick={handleWishlistToggle}
            disabled={state.isLoading}
            className="p-2 bg-theme-secondary rounded-full shadow-md hover:shadow-lg transition-shadow duration-200 disabled:opacity-50"
            aria-label={state.isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            {state.isWishlisted ? (
              <HeartSolidIcon className="w-5 h-5 text-red-500" />
            ) : (
              <HeartIcon className="w-5 h-5 text-theme-secondary hover:text-red-500" />
            )}
          </button>
        )}
        
        <button
          onClick={handleQuickView}
                      className="p-2 bg-theme-secondary rounded-full shadow-md hover:shadow-lg transition-shadow duration-200"
          aria-label="Quick view product"
        >
          <EyeIcon className="w-5 h-5 text-theme-secondary hover:text-blue-500" />
        </button>
      </div>
    )
  }

  const renderProductInfo = () => (
    <div className={`${variant === 'compact' ? 'p-2 sm:p-4' : 'p-4'} ${variant === 'list' ? 'flex-1 ml-4' : ''}`}>


      {/* Product Name */}
      <Link href={`/products/${product._id}`}>
        <h3 className={`font-semibold text-theme-primary hover:text-blue-600 transition-colors line-clamp-2 ${
          variant === 'compact' ? 'text-xs sm:text-sm' : 'text-lg'
        }`}>
          {product.name}
        </h3>
      </Link>

      {/* Description */}
      {variant !== 'compact' && (
        <p className="text-theme-secondary text-sm mt-2 line-clamp-2">
          {product.description}
        </p>
      )}

      {/* Rating */}
      {showRating && variant !== 'compact' && (
        <div className="mt-2">
          {renderStars(averageRating)}
        </div>
      )}

      {/* Price */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className={`font-bold text-theme-primary ${
            variant === 'compact' ? 'text-sm sm:text-lg' : 'text-xl'
          }`}>
            {formatPrice(product.price)}
          </span>
          {discountPercentage > 0 && (
            <span className="text-sm text-theme-muted line-through">
              {formatPrice(product.price * (1 + discountPercentage / 100))}
            </span>
          )}
        </div>

        {/* Free shipping indicator */}
        {product.price >= 100 && (
          <div className="flex items-center text-theme-secondary text-xs">
            <TruckIcon className="w-4 h-4 mr-1" />
            <span>Free Shipping</span>
          </div>
        )}
      </div>

      {/* Stock Info */}
      {showStock && (
        <div className="mt-2">
          {isOutOfStock ? (
            <span className="text-red-600 text-sm font-medium">Out of Stock</span>
          ) : isLowStock ? (
            <span className="text-orange-600 text-sm font-medium">
              Only {product.stock} left
            </span>
          ) : null}
        </div>
      )}

      {/* Action Buttons */}
      <div className={`mt-4 ${variant === 'list' ? 'flex space-x-2' : 'space-y-2'}`}>
        <Button
          onClick={handleAddToCart}
          disabled={isOutOfStock || state.isLoading}
          loading={state.isLoading}
          variant="secondary"
          className={`${variant === 'list' ? 'flex-1' : 'w-full'}`}
          size={variant === 'compact' ? 'sm' : 'md'}
        >
          <ShoppingCartIcon className="w-4 h-4 mr-2" />
          Add to Cart
        </Button>

        {variant !== 'compact' && (
          <Button
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            variant="secondary"
            className={`${variant === 'list' ? 'flex-1' : 'w-full'}`}
            size="md"
          >
            Buy Now
          </Button>
        )}
      </div>
    </div>
  )

  if (variant === 'list') {
    return (
      <div className={`group ${getCardClasses()} ${className}`}>
        {/* Image */}
        <div className="relative">
          {state.imageLoading && (
            <div className="w-24 h-24 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
              <div className="text-gray-400 text-xs">Loading...</div>
            </div>
          )}
          
          {!state.imageError ? (
            <Image
              src={getProductImageUrl(product.image, product._id)}
              alt={product.name}
              width={96}
              height={96}
              sizes={product.sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
              className={`${getImageClasses()} ${state.imageLoading ? 'hidden' : 'block'}`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              priority={product.featured}
            />
          ) : (
            <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-400 text-xs">No Image</span>
            </div>
          )}

          {isOutOfStock && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
              <span className="text-theme-primary text-xs font-medium">Out of Stock</span>
            </div>
          )}
        </div>

        {renderProductInfo()}
      </div>
    )
  }

  return (
    <div className={`group ${getCardClasses()} ${className}`}>
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden">
        {state.imageLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="text-gray-400">Loading...</div>
          </div>
        )}
        
        {!state.imageError ? (
          <Link href={`/products/${product._id}`}>
            <Image
              src={getProductImageUrl(product.image, product._id)}
              alt={product.name}
              fill
              sizes={product.sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
              className={`${getImageClasses()} transition-transform duration-300 group-hover:scale-105 ${
                state.imageLoading ? 'opacity-0' : 'opacity-100'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              priority={product.featured}
            />
          </Link>
        ) : (
          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No Image Available</span>
          </div>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-theme-primary text-lg font-semibold">Out of Stock</span>
          </div>
        )}

        {renderBadges()}
        {renderQuickActions()}
      </div>

      {renderProductInfo()}
    </div>
  )
}

export default ProductCard

// Additional helper components that could be used with ProductCard

// Loading skeleton for ProductCard
export const ProductCardSkeleton: React.FC<{ variant?: 'default' | 'compact' | 'list' }> = ({ 
  variant = 'default' 
}) => {
  if (variant === 'list') {
    return (
      <div className="bg-theme-secondary border border-gray-200 rounded-lg p-6 flex items-center space-x-6 animate-pulse">
        <div className="w-24 h-24 bg-gray-300 rounded-lg"></div>
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
          <div className="h-5 bg-gray-300 rounded w-1/4"></div>
          <div className="flex space-x-2">
            <div className="h-8 bg-gray-300 rounded w-24"></div>
            <div className="h-8 bg-gray-300 rounded w-20"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-theme-secondary rounded-lg shadow-md overflow-hidden animate-pulse">
      <div className={`bg-gray-300 ${variant === 'compact' ? 'h-32' : 'h-48'}`}></div>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        <div className="h-3 bg-gray-300 rounded w-full"></div>
        <div className="h-3 bg-gray-300 rounded w-2/3"></div>
        <div className="h-6 bg-gray-300 rounded w-1/3"></div>
        <div className="space-y-2">
          <div className="h-8 bg-gray-300 rounded"></div>
          {variant !== 'compact' && <div className="h-8 bg-gray-300 rounded"></div>}
        </div>
      </div>
    </div>
  )
}

// Grid container for ProductCards
export const ProductGrid: React.FC<{ 
  children: React.ReactNode
  variant?: 'default' | 'compact'
  className?: string
}> = ({ 
  children, 
  variant = 'default',
  className = '' 
}) => {
  const gridClasses = variant === 'compact' 
    ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
    : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'

  return (
    <div className={`grid ${gridClasses} gap-6 ${className}`}>
      {children}
    </div>
  )
}