'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Layout, ProductCard } from '../../components'
import { Button } from '../../components/ui'
import { IProduct, ProductFilters } from '../../types'
import { CATEGORIES } from '../../utils/constants'
import { 
  FunnelIcon, 
  Squares2X2Icon, 
  ListBulletIcon,
  MagnifyingGlassIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface ProductsPageState {
  products: IProduct[]
  loading: boolean
  error: string | null
  totalProducts: number
  currentPage: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

interface FilterState {
  category: string
  priceRange: [number, number]
  sortBy: string
  sortOrder: 'asc' | 'desc'
  searchTerm: string
  inStock: boolean
  featured: boolean
}

interface PriceRange {
  label: string
  min: number
  max: number
}

const ProductsPage: React.FC = () => {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [state, setState] = useState<ProductsPageState>({
    products: [],
    loading: true,
    error: null,
    totalProducts: 0,
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  })

  const [filters, setFilters] = useState<FilterState>({
    category: searchParams.get('category') || '',
    priceRange: [0, 1000],
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    searchTerm: searchParams.get('search') || '',
    inStock: searchParams.get('inStock') === 'true',
    featured: searchParams.get('featured') === 'true',
  })

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [productsPerPage] = useState(12)

  const priceRanges: PriceRange[] = [
    { label: 'All Prices', min: 0, max: 10000 },
    { label: 'Under $25', min: 0, max: 25 },
    { label: '$25 - $50', min: 25, max: 50 },
    { label: '$50 - $100', min: 50, max: 100 },
    { label: '$100 - $500', min: 100, max: 500 },
    { label: 'Over $500', min: 500, max: 10000 },
  ]

  const sortOptions = [
    { value: 'createdAt-desc', label: 'Newest First' },
    { value: 'createdAt-asc', label: 'Oldest First' },
    { value: 'name-asc', label: 'Name: A to Z' },
    { value: 'name-desc', label: 'Name: Z to A' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'featured-desc', label: 'Featured First' },
  ]

  useEffect(() => {
    fetchProducts()
  }, [filters, state.currentPage])

  useEffect(() => {
    updateURLParams()
  }, [filters])

  const fetchProducts = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      const queryParams = buildQueryParams()
      const response = await fetch(`/api/products?${queryParams}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.statusText}`)
      }

      const data = await response.json()
      
      setState(prev => ({
        ...prev,
        products: data.products || data,
        totalProducts: data.pagination?.totalProducts || data.length,
        totalPages: data.pagination?.totalPages || 1,
        hasNextPage: data.pagination?.hasNextPage || false,
        hasPrevPage: data.pagination?.hasPrevPage || false,
        loading: false,
      }))

    } catch (error) {
      console.error('Error fetching products:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load products',
        loading: false,
      }))
    }
  }

  const buildQueryParams = (): string => {
    const params = new URLSearchParams()

    if (filters.category) params.append('category', filters.category)
    if (filters.searchTerm) params.append('search', filters.searchTerm)
    if (filters.inStock) params.append('inStock', 'true')
    if (filters.featured) params.append('featured', 'true')
    if (filters.priceRange[0] > 0) params.append('minPrice', filters.priceRange[0].toString())
    if (filters.priceRange[1] < 10000) params.append('maxPrice', filters.priceRange[1].toString())
    
    params.append('sortBy', filters.sortBy)
    params.append('sortOrder', filters.sortOrder)
    params.append('page', state.currentPage.toString())
    params.append('limit', productsPerPage.toString())

    return params.toString()
  }

  const updateURLParams = () => {
    const params = new URLSearchParams()

    if (filters.category) params.set('category', filters.category)
    if (filters.searchTerm) params.set('search', filters.searchTerm)
    if (filters.sortBy !== 'createdAt') params.set('sortBy', filters.sortBy)
    if (filters.sortOrder !== 'desc') params.set('sortOrder', filters.sortOrder)
    if (filters.inStock) params.set('inStock', 'true')
    if (filters.featured) params.set('featured', 'true')

    const newURL = params.toString() ? `?${params.toString()}` : '/products'
    router.replace(newURL, { scroll: false })
  }

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }))
    setState(prev => ({ ...prev, currentPage: 1 }))
  }

  const handleSortChange = (sortValue: string) => {
    const [sortBy, sortOrder] = sortValue.split('-')
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder: sortOrder as 'asc' | 'desc',
    }))
  }

  const handlePageChange = (page: number) => {
    setState(prev => ({ ...prev, currentPage: page }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchProducts()
  }

  const clearFilters = () => {
    setFilters({
      category: '',
      priceRange: [0, 1000],
      sortBy: 'createdAt',
      sortOrder: 'desc',
      searchTerm: '',
      inStock: false,
      featured: false,
    })
    setState(prev => ({ ...prev, currentPage: 1 }))
  }

  const getActiveFilterCount = (): number => {
    let count = 0
    if (filters.category) count++
    if (filters.searchTerm) count++
    if (filters.inStock) count++
    if (filters.featured) count++
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) count++
    return count
  }

  const renderPagination = () => {
    if (state.totalPages <= 1) return null

    const maxVisiblePages = 5
    const startPage = Math.max(1, state.currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(state.totalPages, startPage + maxVisiblePages - 1)

    return (
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex flex-1 justify-between sm:hidden">
          <Button
            variant="secondary"
            onClick={() => handlePageChange(state.currentPage - 1)}
            disabled={!state.hasPrevPage}
          >
            Previous
          </Button>
          <Button
            variant="secondary"
            onClick={() => handlePageChange(state.currentPage + 1)}
            disabled={!state.hasNextPage}
          >
            Next
          </Button>
        </div>
        
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing{' '}
              <span className="font-medium">
                {(state.currentPage - 1) * productsPerPage + 1}
              </span>{' '}
              to{' '}
              <span className="font-medium">
                {Math.min(state.currentPage * productsPerPage, state.totalProducts)}
              </span>{' '}
              of{' '}
              <span className="font-medium">{state.totalProducts}</span> results
            </p>
          </div>
          
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
              <Button
                variant="ghost"
                onClick={() => handlePageChange(state.currentPage - 1)}
                disabled={!state.hasPrevPage}
                className="rounded-l-md"
              >
                Previous
              </Button>
              
              {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((page) => (
                <Button
                  key={page}
                  variant={page === state.currentPage ? 'primary' : 'ghost'}
                  onClick={() => handlePageChange(page)}
                  className="rounded-none"
                >
                  {page}
                </Button>
              ))}
              
              <Button
                variant="ghost"
                onClick={() => handlePageChange(state.currentPage + 1)}
                disabled={!state.hasNextPage}
                className="rounded-r-md"
              >
                Next
              </Button>
            </nav>
          </div>
        </div>
      </div>
    )
  }

  const renderProductGrid = () => {
    if (viewMode === 'grid') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {state.products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {state.products.map((product) => (
          <div key={product._id} className="bg-white border border-gray-200 rounded-lg p-6 flex items-center space-x-6">
            <div className="flex-shrink-0">
              <img
                src={product.image}
                alt={product.name}
                className="w-24 h-24 object-cover rounded-lg"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <Link href={`/products/${product._id}`}>
                <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
                  {product.name}
                </h3>
              </Link>
              <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                {product.description}
              </p>
              <div className="mt-2 flex items-center space-x-4">
                <span className="text-lg font-bold text-green-600">
                  ${product.price.toFixed(2)}
                </span>
                <span className="text-sm text-gray-500">
                  {product.category}
                </span>
                {product.stock === 0 ? (
                  <span className="text-sm text-red-600">Out of Stock</span>
                ) : (
                  <span className="text-sm text-green-600">In Stock</span>
                )}
              </div>
            </div>
            
            <div className="flex-shrink-0">
              <Link href={`/products/${product._id}`}>
                <Button>View Details</Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Products</h1>
          
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              placeholder="Search products..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </form>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <div className="flex items-center space-x-2">
                  {getActiveFilterCount() > 0 && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {getActiveFilterCount()}
                    </span>
                  )}
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Category</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      checked={filters.category === ''}
                      onChange={() => handleFilterChange('category', '')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">All Categories</span>
                  </label>
                  {CATEGORIES.map((category) => (
                    <label key={category} className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        checked={filters.category === category}
                        onChange={() => handleFilterChange('category', category)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Price Range</h3>
                <div className="space-y-2">
                  {priceRanges.map((range) => (
                    <label key={range.label} className="flex items-center">
                      <input
                        type="radio"
                        name="priceRange"
                        checked={
                          filters.priceRange[0] === range.min && 
                          filters.priceRange[1] === range.max
                        }
                        onChange={() => handleFilterChange('priceRange', [range.min, range.max])}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Additional Filters */}
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">In Stock Only</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.featured}
                    onChange={(e) => handleFilterChange('featured', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Featured Products</span>
                </label>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  <FunnelIcon className="h-4 w-4 mr-2" />
                  Filters
                  {getActiveFilterCount() > 0 && (
                    <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {getActiveFilterCount()}
                    </span>
                  )}
                </Button>
                
                <span className="text-sm text-gray-700">
                  {state.totalProducts} product{state.totalProducts !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="flex items-center space-x-4">
                {/* Sort Dropdown */}
                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                {/* View Toggle */}
                <div className="flex items-center border border-gray-300 rounded-md">
                  <Button
                    variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Squares2X2Icon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none border-l-0"
                  >
                    <ListBulletIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {state.loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
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
            )}

            {/* Error State */}
            {state.error && (
              <div className="text-center py-16">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                  <h3 className="text-lg font-medium text-red-900 mb-2">
                    Error Loading Products
                  </h3>
                  <p className="text-red-700 mb-4">{state.error}</p>
                  <Button onClick={fetchProducts} variant="danger">
                    Try Again
                  </Button>
                </div>
              </div>
            )}

            {/* No Products Found */}
            {!state.loading && !state.error && state.products.length === 0 && (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your filters or search terms to find what you're looking for.
                  </p>
                  <Button onClick={clearFilters}>Clear All Filters</Button>
                </div>
              </div>
            )}

            {/* Products Grid/List */}
            {!state.loading && !state.error && state.products.length > 0 && (
              <>
                {renderProductGrid()}
                {renderPagination()}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default ProductsPage
