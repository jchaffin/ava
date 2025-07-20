import { Document } from 'mongoose'

export interface IUser extends Document {
  _id: string
  name: string
  email: string
  password: string
  role: 'user' | 'admin'
  image?: string
  emailVerified?: boolean
  lastLoginAt?: Date
  address?: {
    street?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
  }
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

export interface CreateUserInput {
  name: string
  email: string
  password: string
  role?: 'user' | 'admin'
  image?: string
  emailVerified?: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

