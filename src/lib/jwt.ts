import jwt from 'jsonwebtoken'
import { IUser } from '@/types'

// JWT secret key - in production, this should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

// Token payload interface
export interface TokenPayload {
  userId: string
  email: string
  role: string
  iat?: number
  exp?: number
}

// Generate JWT token for user
export const generateToken = (user: IUser): string => {
  const payload = {
    userId: user._id,
    email: user.email,
    role: user.role,
  }

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] })
}

// Verify JWT token
export const verifyToken = (token: string): TokenPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload
    return decoded
  } catch (error) {
    throw new Error('Invalid or expired token')
  }
}

// Decode JWT token without verification (for debugging)
export const decodeToken = (token: string): TokenPayload | null => {
  try {
    return jwt.decode(token) as TokenPayload
  } catch (error) {
    return null
  }
}

// Generate refresh token
export const generateRefreshToken = (user: IUser): string => {
  const payload = {
    userId: user._id,
    email: user.email,
    role: user.role,
  }

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' as jwt.SignOptions['expiresIn'] })
}

// Generate short-lived token (for password reset, email verification, etc.)
export const generateShortToken = (user: IUser, expiresIn: string = '1h'): string => {
  const payload = {
    userId: user._id,
    email: user.email,
    role: user.role,
  }

  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] })
}

// Extract token from Authorization header
export const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7) // Remove 'Bearer ' prefix
}

// Middleware helper for token verification
export const verifyAuthToken = (token: string): TokenPayload => {
  if (!token) {
    throw new Error('No token provided')
  }
  return verifyToken(token)
} 