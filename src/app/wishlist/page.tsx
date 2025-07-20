'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ProductCard } from '@/components'
import { Button } from '@/components/ui'
import { IProduct } from '@/types'
import { useCart } from '@/context'
import toast from 'react-hot-toast'
import { 
  HeartIcon, 
  TrashIcon,
  ShoppingCartIcon,
  EyeIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'

interface WishlistItem {
  id: string
  product: IProduct
  addedAt: string
}

interface WishlistPageState {
  items: WishlistItem[]
  loading: boolean
  error: string | null
}

const WishlistPage: React.FC = () => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { addItem } = useCart()

  const [state, setState] = useState<WishlistPageState>({
    items: [],
    loading: true,
    error: null,
  })

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/signin?callbackUrl=/wishlist')
      return
    }

    fetchWishlist()
  }, [session, status, router])

  const fetchWishlist = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      const response = await fetch('/api/wishlist')
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/signin?callbackUrl=/wishlist')
          return
        }
        throw new Error(`Failed to fetch wishlist: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.success && data.data) {
        setState(prev => ({
          ...prev,
          items: data.data.items || [],
          loading: false,
        }))
      } else {
        throw new Error(data.message || 'Failed to fetch wishlist')
      }

    } catch (error) {
      console.error('Error fetching wishlist:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load wishlist',
        loading: false,
      }))
      toast.error('Failed to load wishlist')
    }
  }

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      const response = await fetch(`/api/wishlist?productId=${productId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to remove from wishlist')
      }

      // Remove item from local state
      setState(prev => ({
        ...prev,
        items: prev.items.filter(item => item.product._id !== productId),
      }))

      toast.success('Removed from wishlist')
    } catch (error) {
      console.error('Error removing from wishlist:', error)
      toast.error('Failed to remove from wishlist')
    }
  }

  const handleAddToCart = (product: IProduct) => {
    if (product.stock === 0) {
      toast.error('Product is out of stock')
      return
    }

    addItem(product)
    toast.success('Added to cart!')
  }

  const handleViewProduct = (productId: string) => {
    router.push(`/products/${productId}`)
  }

  const handleClearWishlist = async () => {
    if (!confirm('Are you sure you want to clear your wishlist?')) {
      return
    }

    try {
      // Remove all items one by one
      const promises = state.items.map(item => 
        fetch(`/api/wishlist?productId=${item.product._id}`, {
          method: 'DELETE',
        })
      )

      await Promise.all(promises)

      setState(prev => ({
        ...prev,
        items: [],
      }))

      toast.success('Wishlist cleared')
    } catch (error) {
      console.error('Error clearing wishlist:', error)
      toast.error('Failed to clear wishlist')
    }
  }

  // Show loading state
  if (status === 'loading' || state.loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-300 aspect-square rounded-lg mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  <div className="h-6 bg-gray-300 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (state.error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Error Loading Wishlist
          </h1>
          <p className="text-gray-600 mb-8">{state.error}</p>
          <Button onClick={fetchWishlist}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
          <p className="text-gray-600">
            {state.items.length} item{state.items.length !== 1 ? 's' : ''} in your wishlist
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Link href="/products">
            <Button variant="secondary">
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
          
          {state.items.length > 0 && (
            <Button 
              variant="danger" 
              onClick={handleClearWishlist}
            >
              <TrashIcon className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {state.items.length === 0 && (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <HeartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-gray-600 mb-6">
              Start adding products to your wishlist to save them for later.
            </p>
            <Link href="/products">
              <Button>
                Browse Products
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Wishlist Items */}
      {state.items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {state.items.map((item) => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {/* Product Image */}
              <div className="relative aspect-square">
                <Image
                  src={item.product.image}
                  alt={item.product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className="object-cover"
                />
                
                {/* Remove from wishlist button */}
                <button
                  onClick={() => handleRemoveFromWishlist(item.product._id)}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                  aria-label="Remove from wishlist"
                >
                  <TrashIcon className="w-4 h-4 text-red-500" />
                </button>

                {/* Out of stock overlay */}
                {item.product.stock === 0 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">Out of Stock</span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {item.product.name}
                </h3>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {item.product.description}
                </p>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold text-green-600">
                    ${item.product.price.toFixed(2)}
                  </span>
                  
                  <span className="text-sm text-gray-500">
                    Added {new Date(item.addedAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Stock Status */}
                <div className="mb-4">
                  {item.product.stock === 0 ? (
                    <span className="text-sm text-red-600 font-medium">Out of Stock</span>
                  ) : item.product.stock <= 5 ? (
                    <span className="text-sm text-orange-600 font-medium">
                      Only {item.product.stock} left
                    </span>
                  ) : (
                    <span className="text-sm text-green-600 font-medium">In Stock</span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleViewProduct(item.product._id)}
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                  >
                    <EyeIcon className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  
                  <Button
                    onClick={() => handleAddToCart(item.product)}
                    disabled={item.product.stock === 0}
                    size="sm"
                    className="flex-1"
                  >
                    <ShoppingCartIcon className="w-4 h-4 mr-1" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Share Wishlist */}
      {state.items.length > 0 && (
        <div className="mt-12 text-center">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Share Your Wishlist
            </h3>
            <p className="text-gray-600 mb-4">
              Let friends and family know what you're interested in.
            </p>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href)
                toast.success('Wishlist link copied to clipboard!')
              }}
              variant="secondary"
            >
              Copy Link
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default WishlistPage 