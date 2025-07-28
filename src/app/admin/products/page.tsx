'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components'
import { Button, Input } from '@/components/ui'
import { useAuth } from '@/context'
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Package,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Dialog } from '@headlessui/react'

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

const AdminProducts: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])

  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'low-stock' | 'featured'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock' | 'createdAt'>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [imageModal, setImageModal] = useState<{ open: boolean; product: Product | null }>({ open: false, product: null })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated || !user?.id) {
      router.push('/signin?callbackUrl=/admin/products')
      return
    }

    if (user.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.')
      router.push('/')
      return
    }

    fetchProducts()
  }, [user, isAuthenticated, isLoading, router])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products')
      const data = await response.json()
      
      if (data.success) {
        setProducts(data.data)
      } else {
        toast.error(data.message || 'Failed to fetch products')
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to fetch products')
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (data.success) {
        toast.success('Product deleted successfully')
        fetchProducts()
      } else {
        toast.error(data.message || 'Failed to delete product')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Failed to delete product')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { color: 'text-red-600', text: 'Out of Stock' }
    if (stock <= 5) return { color: 'text-yellow-600', text: 'Low Stock' }
    return { color: 'text-green-600', text: 'In Stock' }
  }

  // Filter and sort products
  const filteredAndSortedProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase())
      
      let matchesFilter = true
      if (filter === 'low-stock') matchesFilter = product.stock <= 5 && product.stock > 0
      if (filter === 'featured') matchesFilter = product.featured

      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      let aValue: string | number = a[sortBy]
      let bValue: string | number = b[sortBy]

      if (sortBy === 'price' || sortBy === 'stock') {
        aValue = Number(aValue)
        bValue = Number(bValue)
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  // Image upload logic
  const handleImageClick = (product: Product) => {
    setImageModal({ open: true, product })
    setImageFile(null)
    setImagePreview(null)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleImageUpload = async () => {
    if (!imageFile || !imageModal.product) return

    try {
      const formData = new FormData()
      formData.append('image', imageFile)

      const response = await fetch(`/api/products/${imageModal.product._id}/image`, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Image uploaded successfully')
        setImageModal({ open: false, product: null })
        setImageFile(null)
        setImagePreview(null)
        fetchProducts()
      } else {
        toast.error(data.message || 'Failed to upload image')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload image')
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-theme-secondary">Loading products...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-theme-primary">
        {/* Header */}
        <div className="bg-theme-secondary shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-theme-primary">Products</h1>
                <p className="mt-1 text-sm text-theme-muted">
                  Manage your product catalog
                </p>
              </div>
              <Button onClick={() => router.push('/admin/products/new')}>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters and Search */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-muted w-4 h-4 z-10" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 relative"
                  />
                </div>
              </div>

              {/* Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as 'all' | 'low-stock' | 'featured')}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Products</option>
                  <option value="low-stock">Low Stock</option>
                  <option value="featured">Featured</option>
                </select>
              </div>

              {/* Sort */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-theme-muted">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'stock' | 'createdAt')}
                  className="border border-theme rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-0 focus:border-theme bg-theme-tertiary text-theme-primary"
                >
                  <option value="name">Name</option>
                  <option value="price">Price</option>
                  <option value="stock">Stock</option>
                  <option value="createdAt">Date Created</option>
                </select>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="bg-theme-secondary rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-theme">
              <h3 className="text-lg font-medium text-theme-primary">
                Products ({filteredAndSortedProducts.length})
              </h3>
            </div>
            
            {filteredAndSortedProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-theme-tertiary">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-theme-muted uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-theme-muted uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-theme-muted uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-theme-muted uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-theme-muted uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-theme-muted uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-theme-secondary divide-y divide-theme">
                    {filteredAndSortedProducts.map((product) => {
                      const stockStatus = getStockStatus(product.stock)
                      return (
                        <tr key={product._id} className="hover:bg-theme-tertiary">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded-lg mr-4 cursor-pointer hover:opacity-80"
                                onClick={() => handleImageClick(product)}
                              />
                              <div>
                                <div className="text-sm font-medium text-theme-primary">
                                  <span className="text-theme-primary">
                                    {product.name}
                                  </span>
                                  {product.featured && (
                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                      Featured
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-theme-muted truncate max-w-xs">
                                  {product.description}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-theme-primary">
                            <span className="text-theme-primary">
                              {formatCurrency(product.price)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-theme-primary">
                            <span className="text-theme-primary">
                              {product.stock}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm font-medium ${stockStatus.color}`}>
                              {stockStatus.text}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-theme-muted">
                            {formatDate(product.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/products/${product._id}`)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/admin/products/${product._id}/edit`)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteProduct(product._id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-theme-muted mx-auto mb-4" />
                <p className="text-theme-muted">
                  {searchTerm || filter !== 'all' 
                    ? 'No products match your filters' 
                    : 'No products found'
                  }
                </p>
                {(searchTerm || filter !== 'all') && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSearchTerm('')
                      setFilter('all')
                    }}
                    className="mt-2"
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Image upload modal */}
      <Dialog open={imageModal.open} onClose={() => setImageModal({ open: false, product: null })} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="fixed inset-0 bg-black opacity-30" />
          <div className="bg-theme-secondary rounded-lg shadow-lg p-6 z-10 max-w-md w-full">
            <Dialog.Title className="text-lg font-bold text-theme-primary mb-4">Upload Product Image</Dialog.Title>
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded mb-4 mx-auto" />
            ) : (
              <img src={imageModal.product?.image} alt="Current" className="w-32 h-32 object-cover rounded mb-4 mx-auto" />
            )}
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange} 
              className="mb-4 block w-full text-sm text-theme-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-theme-tertiary file:text-theme-primary hover:file:bg-theme-secondary" 
            />
            <div className="flex justify-end space-x-2">
              <Button variant="secondary" onClick={() => setImageModal({ open: false, product: null })}>Cancel</Button>
              <Button onClick={handleImageUpload} disabled={!imageFile}>Upload</Button>
            </div>
          </div>
        </div>
      </Dialog>
    </AdminLayout>
  )
}

export default AdminProducts 