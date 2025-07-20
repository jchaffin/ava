import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, extractTokenFromHeader } from './jwt'
import { TokenPayload } from './jwt'

// Middleware to verify JWT token
export const withAuth = (handler: Function) => {
  return async (request: NextRequest) => {
    try {
      const authHeader = request.headers.get('authorization')
      const token = extractTokenFromHeader(authHeader || undefined)
      
      if (!token) {
        return NextResponse.json(
          { error: 'No token provided' },
          { status: 401 }
        )
      }

      const decoded = verifyToken(token)
      request.headers.set('user', JSON.stringify(decoded))
      
      return handler(request)
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }
  }
}

// Middleware to verify admin role
export const withAdminAuth = (handler: Function) => {
  return async (request: NextRequest) => {
    try {
      const authHeader = request.headers.get('authorization')
      const token = extractTokenFromHeader(authHeader || undefined)
      
      if (!token) {
        return NextResponse.json(
          { error: 'No token provided' },
          { status: 401 }
        )
      }

      const decoded = verifyToken(token)
      
      if (decoded.role !== 'admin') {
        return NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 }
        )
      }

      request.headers.set('user', JSON.stringify(decoded))
      return handler(request)
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }
  }
}

// Helper to get user from request
export const getUserFromRequest = (request: NextRequest): TokenPayload | null => {
  try {
    const userStr = request.headers.get('user')
    if (!userStr) return null
    return JSON.parse(userStr) as TokenPayload
  } catch (error) {
    return null
  }
}

// Helper to check if user has required role
export const hasRole = (user: TokenPayload | null, requiredRole: string): boolean => {
  return user?.role === requiredRole
}

// Helper to check if user is admin
export const isAdmin = (user: TokenPayload | null): boolean => {
  return hasRole(user, 'admin')
} 