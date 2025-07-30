'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { AdminLayout } from '@/components'
import { Button, Input, Textarea } from '@/components/ui'
import { useAuth } from '@/context'
import {
  ArrowLeft,
  Save,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { localKeyToUrl, isLocalKey, extractKeyFromLocalUrl } from '@/lib/local-storage-client'

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

const EditProduct: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  console.log('EditProduct - productId from params:', productId)
  
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
  const [productImages, setProductImages] = useState<string[]>([])
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null)
  const [availableImages, setAvailableImages] = useState<string[]>([])
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [imageUpdateTrigger, setImageUpdateTrigger] = useState(0)

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${productId}`)
      const data = await response.json()
      
      if (data.success) {
        console.log('Product data:', data.data)
        console.log('Product image:', data.data.image)
        
        setProduct(data.data)
        setForm({
          name: data.data.name,
          description: data.data.description,
          price: data.data.price,
          stock: data.data.stock,
          featured: data.data.featured,
        })
        
        // Initialize with the 4 images that are shown in the product page modal
        const baseImage = data.data.image || ''
        console.log('Base image:', baseImage)
        console.log('Product images array:', data.data.images)
        
        // Generate the 4 images using the same logic as the product page
        const images = [1, 2, 3, 4].map((index) => {
          let imageUrl = ''
          
          // If product.images array exists, use those images
          if (data.data.images && data.data.images[index - 1]) {
            imageUrl = data.data.images[index - 1]
            console.log(`Using image from array for index ${index}:`, imageUrl)
          } else {
            // Otherwise, fallback to replacing "_main" with "_index" pattern
            // Handle different naming patterns: main.jpg, _main.jpg, etc.
            if (baseImage.includes('_main.')) {
              imageUrl = baseImage.replace('_main.', `_${index}.`)
            } else if (baseImage.includes('main.')) {
              imageUrl = baseImage.replace('main.', `${index}.`)
            } else {
              // Fallback: try to replace "main" with index
              imageUrl = baseImage.replace('main', index.toString())
            }
            
            // Ensure we're using the correct product ID in the path
            if (imageUrl.includes('/images/products/')) {
              const pathParts = imageUrl.split('/')
              const productIdIndex = pathParts.findIndex(part => part === 'products') + 1
              if (productIdIndex > 0 && pathParts[productIdIndex] !== data.data._id) {
                pathParts[productIdIndex] = data.data._id
                imageUrl = pathParts.join('/')
                console.log(`Updated product ID in path for index ${index}:`, imageUrl)
              }
            }
            
            console.log(`Generated image URL for index ${index}:`, imageUrl)
          }
          
          // Convert local storage keys to URLs
          let finalUrl = imageUrl
          
          // Handle local storage keys and URLs
          if (isLocalKey(imageUrl)) {
            finalUrl = localKeyToUrl(imageUrl)
            console.log(`Converted local key to URL for index ${index}:`, imageUrl, '->', finalUrl)
          } else if (imageUrl.includes('/images/products/') || imageUrl.includes('/uploads/')) {
            const key = extractKeyFromLocalUrl(imageUrl)
            finalUrl = key ? localKeyToUrl(key) : imageUrl
            console.log(`Extracted and converted URL for index ${index}:`, imageUrl, '->', finalUrl)
          }
          
          // Ensure the URL starts with / for local images
          if (finalUrl && !finalUrl.startsWith('http') && !finalUrl.startsWith('/')) {
            finalUrl = '/' + finalUrl
          }
          

          
          console.log(`Final image URL for index ${index}:`, finalUrl)
          return finalUrl
        })
        
        console.log('Initial images:', images)
        
        setProductImages(images)
        setAvailableImages(images)
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

  // Debug effect to monitor productImages changes
  useEffect(() => {
    console.log('productImages state changed:', productImages)
  }, [productImages])

  const handleInputChange = (field: keyof typeof form, value: string | number | boolean) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && editingImageIndex !== null) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
      
      // Automatically upload the image
      const uploadImage = async () => {
        try {
          const formData = new FormData()
          formData.append('image', file)
          formData.append('imageIndex', editingImageIndex.toString())

          const response = await fetch(`/api/admin/products/${productId}/images`, {
            method: 'POST',
            body: formData,
          })

          const data = await response.json()

          if (data.success) {
            toast.success(`Image ${editingImageIndex + 1} updated successfully`)
            
            // Update the local state with the returned imageUrl for immediate display
            const updatedImages = [...productImages]
            updatedImages[editingImageIndex] = data.data.imageUrl
            console.log('Updating productImages state:', { index: editingImageIndex, newUrl: data.data.imageUrl, allImages: updatedImages })
            setProductImages(updatedImages)
            setImageUpdateTrigger(prev => prev + 1) // Force re-render
            
            // Also update the product state to reflect the change
            if (product) {
              const updatedProduct = { ...product }
              if (editingImageIndex === 0) {
                updatedProduct.image = data.data.key // Use the key for the main image
              } else {
                updatedProduct.images = updatedImages
              }
              setProduct(updatedProduct)
            }
            
            // Reset state
            setImageFile(null)
            setImagePreview(null)
            setEditingImageIndex(null)
          } else {
            toast.error(data.message || 'Failed to update image')
          }
        } catch (error) {
          console.error('Error updating image:', error)
          toast.error('Failed to update image')
        }
      }
      
      uploadImage()
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const handleImageUpload = async () => {
    if (!imageFile && !selectedImage || editingImageIndex === null) return

    try {
      let response: Response
      
      if (imageFile) {
        // Upload new image to local storage
        const formData = new FormData()
        formData.append('image', imageFile)
        formData.append('imageIndex', editingImageIndex.toString())

        console.log('Uploading to endpoint:', `/api/admin/products/${productId}/images`)
        response = await fetch(`/api/admin/products/${productId}/images`, {
          method: 'POST',
          body: formData,
        })
      } else if (selectedImage) {
        // Use existing image
        response = await fetch(`/api/admin/products/${productId}/images`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            imageUrl: selectedImage,
            imageIndex: editingImageIndex 
          }),
        })
      } else {
        return
      }

      const data = await response.json()

      if (data.success) {
        toast.success(`Image ${editingImageIndex + 1} updated successfully`)
        
        // Update the local state with the returned imageUrl for immediate display
        const updatedImages = [...productImages]
        updatedImages[editingImageIndex] = data.data.imageUrl
        setProductImages(updatedImages)
        
        // Also update the product state to reflect the change
        if (product) {
          const updatedProduct = { ...product }
          if (editingImageIndex === 0) {
            updatedProduct.image = data.data.key // Use the key for the main image
          } else {
            updatedProduct.images = updatedImages
          }
          setProduct(updatedProduct)
        }
        
        // Reset editing state
        setImageFile(null)
        setImagePreview(null)
        setSelectedImage(null)
        setEditingImageIndex(null)
      } else {
        toast.error(data.message || 'Failed to update image')
      }
    } catch (error) {
      console.error('Error updating image:', error)
      toast.error('Failed to update image')
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!form.name || !form.description || form.price <= 0) {
      toast.error('Please fill in all required fields')
      return
    }

    setSaving(true)
    try {
      // Update the product with images array
      const updateData = {
        ...form,
        images: productImages
      }
      
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      const data = await response.json()

      if (data.success) {
        // If there's an image file, upload it
        if (imageFile) {
          const formData = new FormData()
          formData.append('image', imageFile)
          formData.append('imageIndex', '0') // Main image

          const imageResponse = await fetch(`/api/admin/products/${productId}/images`, {
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
        <div className="min-h-screen bg-theme-primary flex items-center justify-center">
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
        <div className="min-h-screen bg-theme-primary flex items-center justify-center">
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
      <div className="min-h-screen bg-theme-primary">
        {/* Header */}
        <div className="bg-theme-primary shadow-sm border-b border-theme">
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
          <form onSubmit={handleSubmit} className="bg-theme-secondary rounded-lg shadow border border-theme p-6">
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
                    className="h-4 w-4 text-ava-accent focus:ring-ava-accent border-theme rounded"
                  />
                  <label htmlFor="featured" className="ml-2 text-sm ava-text-tertiary">
                    Featured Product
                  </label>
                </div>
              </div>

                              {/* Product Images Management */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium ava-text-tertiary mb-4">
                  Product Images (Carousel)
                </label>
                
                {/* Product Images Grid */}
                <div className="mb-6">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {productImages.map((image, index) => {
                      // For display, use the image directly (it's already a URL from upload or converted from key)
                      const imageUrl = image;
                      
                      return (
                        <div key={`${index}-${image}-${imageUpdateTrigger}`} className="relative group">
                          <div className={`border-2 rounded-xl p-3 transition-all duration-200 ${
                            editingImageIndex === index ? 'border-theme-primary bg-theme-tertiary shadow-lg' : 'border-theme hover:border-theme-primary hover:shadow-md'
                          }`}>
                            {imageUrl ? (
                              <img 
                                src={imageUrl} 
                                alt={`Product Image ${index + 1}`} 
                                className="w-full h-40 object-cover rounded-lg"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                  e.currentTarget.nextElementSibling?.classList.remove('hidden')
                                }}
                              />
                            ) : (
                              <div className="w-full h-40 bg-theme-tertiary rounded-lg flex items-center justify-center">
                                <span className="text-theme-muted text-sm">No Image</span>
                              </div>
                            )}
                          {/* Fallback for failed images */}
                          <div className="hidden w-full h-40 bg-theme-tertiary rounded-lg flex items-center justify-center">
                            <span className="text-theme-muted text-sm">Failed to load</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingImageIndex(index)
                              document.getElementById('file-upload')?.click()
                            }}
                            className="absolute top-3 right-3 bg-theme-primary text-theme-secondary rounded-full w-8 h-8 flex items-center justify-center text-sm hover:bg-theme-secondary hover:text-theme-primary transition-all duration-200 shadow-lg opacity-0 group-hover:opacity-100"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-sm text-theme-muted text-center mt-2 font-medium">Image {index + 1}</p>
                        <p className="text-xs text-theme-muted text-center mt-1 truncate" title={image}>
                          {image ? image.split('/').pop() : 'No image'}
                        </p>
                      </div>
                    )
                    })}
                  </div>
                </div>

                                {/* Hidden file input for direct upload */}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden" 
                  id="file-upload"
                />
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
                variant="secondary"
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