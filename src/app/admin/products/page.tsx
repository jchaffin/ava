'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components'
import { Button, Input } from '@/components/ui'
import { useAuth } from '@/context'
import { localKeyToUrl, extractKeyFromLocalUrl } from '@/lib/local-storage-client'
import { getProductImageUrl } from '@/utils/helpers'
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
  Upload,
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
  images?: string[]
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

  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null)
  const [productImages, setProductImages] = useState<string[]>([])
  const [productImageKeys, setProductImageKeys] = useState<string[]>([])

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
              console.log('Fetched products:', data.data.length)
      console.log('Sample product:', {
        id: data.data[0]?._id,
        name: data.data[0]?.name,
        image: data.data[0]?.image,
        images: data.data[0]?.images
      })
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
    const date = new Date(dateString)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const month = months[date.getMonth()]
    const day = date.getDate()
    const year = date.getFullYear()
    return `${month} ${day}, ${year}`
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

  // Helper function to validate and normalize image arrays
  const normalizeImageArray = (images: string[]): string[] => {
    if (!Array.isArray(images)) return ['', '', '', '']
    
    // Filter out empty strings and normalize
    const validImages = images
      .filter(img => img && typeof img === 'string' && img.trim() !== '')
      .map(img => img.trim())
    
    // Pad to 4 images
    while (validImages.length < 4) {
      validImages.push('')
    }
    
    return validImages.slice(0, 4) // Ensure max 4 images
  }

  // Image upload logic
  const handleImageClick = async (product: Product) => {
    setImageModal({ open: true, product })
    
    // Initialize arrays for keys and display URLs
    let keys: string[] = []
    let images: string[] = []

    // Simple function to extract clean key from any image string
    const extractCleanKey = (img: string): string => {
      if (!img) return ''
      
      // If it's already a simple key like "0.jpg", return it
      if (!img.includes('/images/products/') && !img.includes('/uploads/') && !img.includes('http')) {
        return img
      }
      
      // Handle local URLs
      if (img.includes('/images/products/') || img.includes('/uploads/')) {
        const extractedKey = extractKeyFromLocalUrl(img)
        return extractedKey || img
      }
      
      // Handle external URLs (just return as is for now)
      if (img.startsWith('http')) {
        return img
      }
      
      return img
    }

    // Simple function to convert key to clean URL
    const keyToCleanUrl = (key: string): string => {
      if (!key) return ''
      
      // If it's already a full URL, return it
      if (key.startsWith('http')) return key
      
      // If it's just a filename like "2.jpg", "3.jpg", "4.jpg", or "main.jpg", construct the full product path
      if (key.match(/^(main|\d+)\.jpg$/)) {
        return localKeyToUrl(`products/${product._id}/${key}`)
      }
      
      // If it's a local storage key, convert to URL
      if (key.startsWith('products/')) {
        return localKeyToUrl(key)
      }
      
      // Otherwise, assume it's a filename and construct the path
      return localKeyToUrl(`products/${product._id}/${key}`)
    }

    if (product.images && product.images.length > 0) {
      // Normalize the image array first
      const normalizedImages = normalizeImageArray(product.images)
      
      // Extract clean keys from normalized images
      const cleanKeys = normalizedImages.map(extractCleanKey)
      
      // Convert existing keys to URLs for display
      images = cleanKeys.map(keyToCleanUrl)
      keys = cleanKeys
    } else {
      // No images array, start with empty slots
      keys = ['', '', '', '']
      images = ['', '', '', '']
    }
    
    console.log('Image modal data:', {
      productId: product._id,
      keys: keys,
      images: images,
      originalImages: product.images,
      originalImage: product.image
    })
    
    setProductImages(images)
    setProductImageKeys(keys)
    
    // Debug: Log the final state
    console.log('Final modal state:', {
      productImages: images,
      productImageKeys: keys,
      editingIndex: editingImageIndex
    })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      console.log('Selected file:', {
        name: file.name,
        size: file.size,
        type: file.type,
        editingIndex: editingImageIndex
      })
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleImageUpload = async () => {
    if (!imageFile || !imageModal.product || editingImageIndex === null) return

    try {
      console.log('=== UPLOAD DEBUG ===')
      console.log('Uploading image:', {
        productId: imageModal.product._id,
        imageIndex: editingImageIndex,
        fileName: imageFile.name,
        fileSize: imageFile.size,
        fileType: imageFile.type
      })
      console.log('Current productImages before upload:', productImages)
      console.log('Current productImageKeys before upload:', productImageKeys)
      console.log('Product data before upload:', {
        id: imageModal.product._id,
        name: imageModal.product.name,
        image: imageModal.product.image,
        images: imageModal.product.images
      })

      // Upload new image to local storage
      const formData = new FormData()
      formData.append('image', imageFile)
      formData.append('imageIndex', editingImageIndex.toString())

      const response = await fetch(`/api/admin/products/${imageModal.product._id}/images`, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      console.log('Upload response:', data)

      if (data.success) {
        toast.success(`Image ${editingImageIndex + 1} updated successfully`)
        
        console.log('Upload successful:', {
          editingIndex: editingImageIndex,
          returnedUrl: data.data.imageUrl,
          returnedKey: data.data.key
        })
        
        // Update the local state
        const updatedImages = [...productImages]
        const updatedKeys = [...productImageKeys]
        updatedImages[editingImageIndex] = data.data.imageUrl
        updatedKeys[editingImageIndex] = data.data.key
        
        console.log('Updated arrays:', {
          updatedImages,
          updatedKeys,
          editingIndex: editingImageIndex
        })
        
        setProductImages(updatedImages)
        setProductImageKeys(updatedKeys)
        
        console.log('Updated productImages:', updatedImages)
        console.log('Updated productImageKeys:', updatedKeys)
        
        // Reset editing state
        setImageFile(null)
        setImagePreview(null)
        setEditingImageIndex(null)
        
        // Refresh the product data to show the updated image
        fetchProducts()
      } else {
        toast.error(data.message || 'Failed to update image')
      }
    } catch (error) {
      console.error('Error updating image:', error)
      toast.error('Failed to update image')
    }
  }

  const handleSaveAllImages = async () => {
    if (!imageModal.product) return

    try {
      console.log('Saving all images:', {
        productId: imageModal.product._id,
        originalKeys: productImageKeys,
        productImages: productImages
      })

      // Clean and prepare the images array for saving
      // We want to save local storage keys, not URLs
      const cleanImages = productImageKeys
        .filter(key => key && key.trim() !== '')
        .map(key => {
          // If it's a full URL, extract the key
          if (key.includes('/images/products/') || key.includes('/uploads/')) {
            const extractedKey = extractKeyFromLocalUrl(key)
            return extractedKey || key
          }
          // If it's an external URL, keep it as is
          if (key.startsWith('http')) {
            return key
          }
          // If it's already a key, return it
          return key
        })

      console.log('Cleaned images for saving:', cleanImages)

      const response = await fetch(`/api/admin/products/${imageModal.product._id}/images`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          images: cleanImages 
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('All images saved successfully')
        setImageModal({ open: false, product: null })
        setImageFile(null)
        setImagePreview(null)
        setEditingImageIndex(null)
        fetchProducts()
      } else {
        toast.error(data.message || 'Failed to save images')
      }
    } catch (error) {
      console.error('Error saving images:', error)
      toast.error('Failed to save images')
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
        <div className="bg-theme-primary shadow-sm border-b border-theme">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-theme-primary">Products</h1>
                <p className="mt-1 text-sm text-theme-muted">
                  Manage your product catalog
                </p>
              </div>
              <Button variant="primary" onClick={() => router.push('/admin/products/new')}>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters and Search */}
          <div className="bg-theme-secondary rounded-lg shadow p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex border border-theme rounded-lg bg-theme-tertiary shadow-sm">
                <div className="pl-4 pr-3 py-3">
                  <Search className="w-4 h-4 text-theme-primary" />
                </div>
                <input
                  type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-3 py-3 bg-transparent focus:outline-none focus:ring-0 focus:border-0 text-theme-primary placeholder:text-theme-muted"
                  />
              </div>

                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as 'all' | 'low-stock' | 'featured')}
                className="border border-theme rounded-md px-3 py-2 focus:outline-none focus:ring-0 focus:border-0 bg-theme-tertiary text-theme-primary"
                >
                  <option value="all">All Products</option>
                  <option value="low-stock">Low Stock</option>
                  <option value="featured">Featured</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'stock' | 'createdAt')}
                className="border border-theme rounded-md px-3 py-2 focus:outline-none focus:ring-0 focus:border-0 bg-theme-tertiary text-theme-primary"
                >
                  <option value="name">Name</option>
                  <option value="price">Price</option>
                  <option value="stock">Stock</option>
                  <option value="createdAt">Date Created</option>
                </select>

                <Button
                  variant="ghost"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="flex items-center justify-center"
                >
                {sortOrder === 'asc' ? '↑' : '↓'}
                </Button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="bg-theme-secondary rounded-lg shadow border border-theme overflow-hidden">
            
            {filteredAndSortedProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-theme">
                  <thead className="bg-theme-secondary">
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
                        <tr key={product._id} className="hover:bg-theme-tertiary border border-theme rounded-lg transition-colors duration-200">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img
                                src={getProductImageUrl(product.image, product._id)}
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
                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-theme-tertiary text-theme-primary">
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
                                variant="secondary"
                                size="sm"
                                onClick={() => router.push(`/products/${product._id}`)}
                              >
                                <Eye className="w-4 h-4 text-theme-primary" />
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => router.push(`/admin/products/${product._id}/edit`)}
                              >
                                <Edit className="w-4 h-4 text-theme-primary" />
                              </Button>
                              <Button
                                variant="secondary"
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
                        <Dialog.Title className="text-lg font-bold text-theme-primary mb-4">Manage Product Images</Dialog.Title>
            
            {/* Product Images Grid */}
            <div className="mb-6">
              <p className="text-sm font-medium text-theme-primary mb-3">Product Images</p>
              <div className="grid grid-cols-2 gap-3">
                {productImages.map((image, index) => {
                  return (
                    <div key={index} className="relative">
                      <div className={`border-2 rounded-lg p-2 transition-colors ${
                        editingImageIndex === index ? 'border-theme-primary bg-theme-tertiary' : 'border-theme'
                      }`}>
                        {image ? (
                          <img 
                            src={image} 
                            alt={`Product Image ${index + 1}`} 
                            className="w-full h-24 object-cover rounded"
                          />
                        ) : (
                          <div className="w-full h-24 bg-theme-tertiary rounded flex items-center justify-center">
                            <span className="text-theme-muted text-sm">No Image</span>
                          </div>
                        )}
                        <button
                          onClick={() => setEditingImageIndex(index)}
                          className="absolute top-1 right-1 bg-theme-primary text-theme-secondary rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-theme-secondary hover:text-theme-primary transition-colors"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-xs text-theme-muted text-center mt-1">Image {index + 1}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Image Editor */}
            {editingImageIndex !== null && (
              <div className="mb-6 p-4 border border-theme rounded-lg bg-theme-tertiary">
                <p className="text-sm font-medium text-theme-primary mb-3">
                  Editing Image {editingImageIndex + 1}
                </p>
                


                {/* Upload New Image */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-theme-primary mb-2">Or upload new image:</p>
                  {imagePreview && (
                    <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded mb-2 mx-auto" />
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                    className="hidden" 
                    id="file-upload"
                  />
                  <label 
                    htmlFor="file-upload" 
                    className="flex items-center justify-center w-full p-2 border bg-theme-secondary border-theme rounded cursor-pointer hover:bg-theme-secondary transition-colors"
                  >
                    <Upload className="w-3 h-3 text-theme-muted mr-1" />
                    <span className="text-xs text-theme-primary">Choose Image</span>
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <Button 
                    variant="primary"
                    size="sm" 
                    className="btn-primary"
                    onClick={handleImageUpload} 
                    disabled={!imageFile}
                  >
                    Update Image {editingImageIndex + 1}
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => {
                      setEditingImageIndex(null)
                      setImageFile(null)
                      setImagePreview(null)
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Save All Button */}
            <div className="flex justify-end space-x-2">
              <Button variant="secondary" onClick={() => setImageModal({ open: false, product: null })}>
                Close
              </Button>
              <Button variant="secondary" onClick={handleSaveAllImages}>
                Save All Images
              </Button>
            </div>
          </div>
        </div>
      </Dialog>
    </AdminLayout>
  )
}

export default AdminProducts 