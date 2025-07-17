'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useSession, signIn, signOut, SessionProvider } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { IUser } from '../types'
import toast from 'react-hot-toast'

interface AuthUser extends Omit<IUser, 'password' | 'comparePassword'> {
  id: string
  role: 'user' | 'admin'
}

interface AuthContextType {
  // User state
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  
  // Authentication methods
  login: (credentials: LoginCredentials) => Promise<AuthResult>
  logout: () => Promise<void>
  register: (userData: RegisterData) => Promise<AuthResult>
  
  // User management
  updateProfile: (userData: Partial<AuthUser>) => Promise<boolean>
  refreshUser: () => Promise<void>
  
  // Permission helpers
  hasRole: (role: 'user' | 'admin') => boolean
  canAccess: (resource: string) => boolean
  
  // Auth state helpers
  requireAuth: (redirectTo?: string) => boolean
  requireRole: (role: 'user' | 'admin', redirectTo?: string) => boolean
}

interface LoginCredentials {
  email: string
  password: string
  remember?: boolean
}

interface RegisterData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

interface AuthResult {
  success: boolean
  message: string
  user?: AuthUser
  error?: string
}

interface AuthContextProviderProps {
  children: ReactNode
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Internal provider component that uses NextAuth session
const AuthProviderInternal: React.FC<AuthContextProviderProps> = ({ children }) => {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<AuthUser | null>(null)

  // Update user state when session changes
  useEffect(() => {
    if (status === 'loading') {
      setIsLoading(true)
      return
    }

    setIsLoading(false)

    if (session?.user) {
      const authUser: AuthUser = {
        id: session.user.id,
        _id: session.user.id,
        name: session.user.name || '',
        email: session.user.email || '',
        role: session.user.role || 'user',
        createdAt: new Date(), // This would come from the actual user data
        updatedAt: new Date(),
        address: undefined, // This would be fetched separately if needed
      }
      setUser(authUser)
    } else {
      setUser(null)
    }
  }, [session, status])

  const login = async (credentials: LoginCredentials): Promise<AuthResult> => {
    try {
      setIsLoading(true)

      const result = await signIn('credentials', {
        email: credentials.email,
        password: credentials.password,
        redirect: false,
      })

      if (result?.error) {
        const errorMessage = getAuthErrorMessage(result.error)
        toast.error(errorMessage)
        return {
          success: false,
          message: errorMessage,
          error: result.error,
        }
      }

      if (result?.ok) {
        // Refresh session to get updated user data
        await update()
        toast.success('Welcome back!')
        
        return {
          success: true,
          message: 'Login successful',
          user: user,
        }
      }

      return {
        success: false,
        message: 'Login failed',
        error: 'UNKNOWN_ERROR',
      }

    } catch (error) {
      console.error('Login error:', error)
      const errorMessage = 'An unexpected error occurred during login'
      toast.error(errorMessage)
      
      return {
        success: false,
        message: errorMessage,
        error: 'NETWORK_ERROR',
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true)
      
      // Clear any local storage or additional cleanup
      localStorage.removeItem('cart')
      localStorage.removeItem('wishlist')
      
      await signOut({ redirect: false })
      setUser(null)
      
      toast.success('You have been logged out')
      router.push('/')
      
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Error during logout')
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: RegisterData): Promise<AuthResult> => {
    try {
      setIsLoading(true)

      // Validate passwords match
      if (userData.password !== userData.confirmPassword) {
        const errorMessage = 'Passwords do not match'
        toast.error(errorMessage)
        return {
          success: false,
          message: errorMessage,
          error: 'PASSWORD_MISMATCH',
        }
      }

      // Call registration API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          password: userData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMessage = data.message || 'Registration failed'
        toast.error(errorMessage)
        return {
          success: false,
          message: errorMessage,
          error: data.error || 'REGISTRATION_FAILED',
        }
      }

      // Auto-login after successful registration
      const loginResult = await login({
        email: userData.email,
        password: userData.password,
      })

      if (loginResult.success) {
        toast.success('Account created and logged in successfully!')
        return {
          success: true,
          message: 'Registration and login successful',
          user: loginResult.user,
        }
      }

      // Registration successful but login failed
      toast.success('Account created successfully! Please sign in.')
      return {
        success: true,
        message: 'Registration successful',
      }

    } catch (error) {
      console.error('Registration error:', error)
      const errorMessage = 'An unexpected error occurred during registration'
      toast.error(errorMessage)
      
      return {
        success: false,
        message: errorMessage,
        error: 'NETWORK_ERROR',
      }
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = async (userData: Partial<AuthUser>): Promise<boolean> => {
    try {
      setIsLoading(true)

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        const data = await response.json()
        toast.error(data.message || 'Failed to update profile')
        return false
      }

      const updatedUser = await response.json()
      
      // Update local user state
      setUser(prev => prev ? { ...prev, ...updatedUser.data } : null)
      
      // Update session
      await update()
      
      toast.success('Profile updated successfully')
      return true

    } catch (error) {
      console.error('Profile update error:', error)
      toast.error('Failed to update profile')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const refreshUser = async (): Promise<void> => {
    try {
      if (!user?.id) return

      const response = await fetch('/api/user/profile')
      if (!response.ok) return

      const userData = await response.json()
      setUser(prev => prev ? { ...prev, ...userData.data } : null)
      
      // Update session with fresh data
      await update()

    } catch (error) {
      console.error('Error refreshing user data:', error)
    }
  }

  const hasRole = (role: 'user' | 'admin'): boolean => {
    if (!user) return false
    
    if (role === 'admin') {
      return user.role === 'admin'
    }
    
    return user.role === 'user' || user.role === 'admin'
  }

  const canAccess = (resource: string): boolean => {
    if (!user) return false

    // Define resource permissions
    const permissions: Record<string, string[]> = {
      'admin-dashboard': ['admin'],
      'user-profile': ['user', 'admin'],
      'orders': ['user', 'admin'],
      'products-manage': ['admin'],
      'users-manage': ['admin'],
      'settings': ['admin'],
    }

    const requiredRoles = permissions[resource]
    if (!requiredRoles) return true // No restrictions

    return requiredRoles.includes(user.role)
  }

  const requireAuth = (redirectTo: string = '/signin'): boolean => {
    if (!user && !isLoading) {
      const currentPath = window.location.pathname
      const callbackUrl = encodeURIComponent(currentPath)
      router.push(`${redirectTo}?callbackUrl=${callbackUrl}`)
      return false
    }
    return !!user
  }

  const requireRole = (role: 'user' | 'admin', redirectTo: string = '/'): boolean => {
    if (!requireAuth()) return false
    
    if (!hasRole(role)) {
      toast.error('You do not have permission to access this page')
      router.push(redirectTo)
      return false
    }
    
    return true
  }

  const contextValue: AuthContextType = {
    // User state
    user,
    isAuthenticated: !!user,
    isLoading,
    
    // Authentication methods
    login,
    logout,
    register,
    
    // User management
    updateProfile,
    refreshUser,
    
    // Permission helpers
    hasRole,
    canAccess,
    
    // Auth state helpers
    requireAuth,
    requireRole,
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

// Main provider component that wraps with SessionProvider
export const AuthProvider: React.FC<AuthContextProviderProps> = ({ children }) => {
  return (
    <SessionProvider>
      <AuthProviderInternal>
        {children}
      </AuthProviderInternal>
    </SessionProvider>
  )
}

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Higher-order component for protected routes
interface ProtectedRouteProps {
  children: ReactNode
  requireRole?: 'user' | 'admin'
  fallback?: ReactNode
  redirectTo?: string
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireRole,
  fallback,
  redirectTo = '/signin',
}) => {
  const { isAuthenticated, hasRole, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    if (fallback) return <>{fallback}</>
    return null // Will redirect in requireAuth
  }

  if (requireRole && !hasRole(requireRole)) {
    if (fallback) return <>{fallback}</>
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You do not have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Hook for conditional rendering based on auth state
export const useAuthGuard = () => {
  const { isAuthenticated, hasRole, isLoading } = useAuth()

  return {
    isAuthenticated,
    isLoading,
    hasRole,
    showForAuth: (content: ReactNode) => isAuthenticated ? content : null,
    showForGuest: (content: ReactNode) => !isAuthenticated ? content : null,
    showForRole: (role: 'user' | 'admin', content: ReactNode) => 
      isAuthenticated && hasRole(role) ? content : null,
  }
}

// Utility function to get user-friendly error messages
function getAuthErrorMessage(error: string): string {
  const errorMessages: Record<string, string> = {
    'CredentialsSignin': 'Invalid email or password',
    'EmailNotVerified': 'Please verify your email address',
    'AccountNotLinked': 'Account linking failed',
    'SessionRequired': 'Please sign in to continue',
    'InvalidCredentials': 'Invalid email or password',
    'UserNotFound': 'No account found with this email',
    'PasswordMismatch': 'Incorrect password',
    'TooManyRequests': 'Too many login attempts. Please try again later.',
    'NetworkError': 'Network error. Please check your connection.',
  }

  return errorMessages[error] || 'An error occurred during authentication'
}

// Helper hooks for specific auth states
export const useRequireAuth = (redirectTo?: string) => {
  const { requireAuth } = useAuth()
  
  useEffect(() => {
    requireAuth(redirectTo)
  }, [requireAuth, redirectTo])
}

export const useRequireRole = (role: 'user' | 'admin', redirectTo?: string) => {
  const { requireRole } = useAuth()  
  useEffect(() => {
    requireRole(role, redirectTo)
  }, [requireRole, role, redirectTo])
}

// Type exports
export type { AuthUser, LoginCredentials, RegisterData, AuthResult, AuthContextType }
