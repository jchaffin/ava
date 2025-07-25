import mongoose, { Schema } from 'mongoose'
import { IProductDocument } from '@/types'

const ProductSchema = new Schema<IProductDocument>({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative'],
  },
  image: {
    type: String,
    required: [true, 'Product image is required'],
  },
  sizes: {
    type: String,
    default: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  },

  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0,
  },
  featured: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
})

// Index for better query performance
ProductSchema.index({ featured: 1 })
ProductSchema.index({ price: 1 })

export default mongoose.models.Product || mongoose.model<IProductDocument>('Product', ProductSchema)