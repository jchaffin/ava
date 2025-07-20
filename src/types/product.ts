// Interface for Mongoose Document (when not using .lean())
export interface IProductDocument {
  _id: string
  name: string
  description: string
  price: number
  image: string
  sizes?: string
  stock: number
  featured: boolean
  createdAt: Date
  updatedAt: Date
}

// Interface for MongoDB lean() objects (plain JavaScript objects)
export interface IProduct {
  _id: string
  name: string
  description: string
  price: number
  image: string
  sizes?: string
  stock: number
  featured: boolean
  createdAt: Date
  updatedAt: Date
  __v?: number // MongoDB version key
}

// Type for MongoDB lean() results - more flexible to handle MongoDB's complex types
export type ProductLeanResult = {
  _id: string
  name: string
  description: string
  price: number
  image: string
  sizes?: string
  stock: number
  featured: boolean
  createdAt: Date
  updatedAt: Date
  __v?: number
  [key: string]: any // Allow additional MongoDB-specific properties
}

export interface CreateProductInput {
  name: string
  description: string
  price: number
  image: string
  sizes?: string
  stock: number
  featured?: boolean
}

export interface ProductFilters {
  featured?: boolean
  limit?: number
}

// ProductCartItem as a plain object for cart operations
export interface ProductCartItem {
  _id: string
  name: string
  description: string
  price: number
  image: string
  sizes?: string
  stock: number
  featured: boolean
  createdAt: Date
  updatedAt: Date
  quantity: number
}