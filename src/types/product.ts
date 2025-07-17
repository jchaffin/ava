import { Document } from 'mongoose'

export interface IProduct extends Document {
  _id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  stock: number
  featured: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateProductInput {
  name: string
  description: string
  price: number
  image: string
  category: string
  stock: number
  featured?: boolean
}

export interface ProductFilters {
  category?: string
  featured?: boolean
  limit?: number
}

export interface CartItem extends IProduct {
  quantity: number
}