'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { AdminLayout } from '@/components'
import { Button, Input, Textarea } from '@/components/ui'
import { useAuth } from '@/context'
import {
  ArrowLeft,
  Save,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'

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

const EditProduct: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  
  const [product, setProduct] = useState<Product | null>(null)
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    featured: false,
  })

  const [saving, setSaving] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${productId}`)
      const data = await response.json()
      
      if (data.success) {
        setProduct(data.data)
        setForm({
          name: data.data.name,
          description: data.data.description,
          price: data.data.price,
          stock: data.data.stock,
          featured: data.data.featured,
        })
      } else {
        toast.error(data.message || 'Failed to fetch product')
        router.push('/admin/products')
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      toast.error('Failed to fetch product')
      router.push('/admin/products')
    }
  }

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

    fetchProduct()
  }, [user, isAuthenticated, isLoading, router, productId])

  const handleInputChange = (field: keyof typeof form, value: string | number | boolean) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!form.name || !form.description || form.price <= 0) {
      toast.error('Please fill in all required fields')
      return
    }

    setSaving(true)
    try {
      // Update the product
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      const data = await response.json()

      if (data.success) {
        // If there's an image file, upload it
        if (imageFile) {
          const formData = new FormData()
          formData.append('image', imageFile)

          const imageResponse = await fetch(`/api/products/${productId}/image`, {
            method: 'POST',
            body: formData,
          })

          const imageData = await imageResponse.json()
          if (!imageData.success) {
            toast.error('Product updated but image upload failed')
          }
        }

        toast.success('Product updated successfully')
        router.push('/admin/products')
      } else {
        toast.error(data.message || 'Failed to update product')
      }
    } catch (error) {
      console.error('Error updating product:', error)
      toast.error('Failed to update product')
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-theme-secondary">Loading product...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!product) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-theme-secondary">Product not found</p>
            <Button onClick={() => router.push('/admin/products')} className="mt-4">
              Back to Products
            </Button>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  onClick={() => router.push('/admin/products')}
                  className="flex items-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Products
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-theme-primary">Edit Product</h1>
                  <p className="mt-1 text-sm text-theme-muted">
                    Update product information
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Name */}
              <div className="md:col-span-2">
                <Input
                  label="Product Name *"
                  value={form.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('name', e.target.value)}
                  placeholder="Enter product name"
                  required
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <Textarea
                  label="Description *"
                  value={form.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
                  placeholder="Enter product description"
                  rows={4}
                  required
                />
              </div>

              {/* Price */}
              <div>
                <Input
                  label="Price *"
                  type="number"
                  value={form.price}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              {/* Stock */}
              <div>
                <Input
                  label="Stock"
                  type="number"
                  value={form.stock}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  min="0"
                />
              </div>

              {/* Featured */}
              <div className="md:col-span-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={form.featured}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('featured', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="featured" className="ml-2 text-sm ava-text-tertiary">
                    Featured Product
                  </label>
                </div>
              </div>

              {/* Image Upload */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium ava-text-tertiary mb-2">
                  Product Image
                </label>
                <div className="flex items-center space-x-4">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-theme-primary rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={product?.image || '/images/placeholder.jpg'}
                        alt="Current"
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                      {imageFile && (
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-theme-primary rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="block w-full text-sm text-theme-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="mt-1 text-sm text-theme-muted">
                      Upload a new image to replace the current one
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 flex justify-end space-x-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push('/admin/products')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={saving}
                disabled={saving}
              >
                <Save className="w-4 h-4 mr-2" />
                Update Product
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}

export default EditProduct 