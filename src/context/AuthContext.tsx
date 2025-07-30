'use client'

import React, { createContext, useContext, useEffect, ReactNode, useCallback, useState } from 'react'
import { useSession, signIn, signOut, SessionProvider } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { IUser } from '@/types'
import toast from 'react-hot-toast'

// Define AuthUser extending IUser (which extends Mongoose Document)
interface AuthUser extends Omit<IUser, 'password' | 'comparePassword' | 'image'> {
  id: string
  role: 'user' | 'admin'
  image?: string | null
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

// Helper function to create AuthUser from session data
const createAuthUserFromSession = (sessionUser: any): AuthUser => {
  return {
    id: sessionUser.id || '',
    _id: sessionUser.id || '',
    name: sessionUser.name || '',
    email: sessionUser.email || '',
    role: (sessionUser.role as 'user' | 'admin') || 'user',
    image: sessionUser.image || null,
    createdAt: new Date(), // This would come from the actual user data
    updatedAt: new Date(),
    address: undefined, // This would be fetched separately if needed
  } as AuthUser
}

// Internal provider component that uses NextAuth session
const AuthProviderInternal: React.FC<AuthContextProviderProps> = ({ children }) => {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  // Set client flag on mount to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Create user from session directly
  const user = session?.user ? createAuthUserFromSession(session.user) : null
  const isLoading = status === 'loading' || !isClient
  const isAuthenticated = !!user && isClient && status !== 'unauthenticated'

  const login = async (credentials: LoginCredentials): Promise<AuthResult> => {
    try {
      const result = await signIn('credentials', {
        email: credentials.email.trim().toLowerCase(),
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
        // Force a session update
        update().catch(error => {
          console.error('AuthContext: Session update failed', error)
        })
        
        toast.success('Welcome back!')
        
        // Handle redirection based on role
        setTimeout(() => {
          const isAdmin = credentials.email === 'admin@ava.com'
          if (isAdmin) {
            window.location.href = '/admin/dashboard'
          } else {
            window.location.href = '/'
          }
        }, 100)
        
        return {
          success: true,
          message: 'Login successful',
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
    }
  }

  const logout = async (): Promise<void> => {
    try {
      // Clear any local storage or additional cleanup
      if (typeof window !== 'undefined') {
        localStorage.removeItem('ava-cart')
        localStorage.removeItem('wishlist')
        sessionStorage.clear()
        
        // Clear any other auth-related storage
        localStorage.removeItem('next-auth.csrf-token')
        localStorage.removeItem('next-auth.callback-url')
        
        // Clear all NextAuth related cookies
        document.cookie.split(";").forEach(function(c) { 
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
        });
      }
      
      // Sign out from NextAuth with proper error handling
      await signOut({ 
        redirect: false,
        callbackUrl: '/'
      })
      
      // Force multiple session updates to ensure state is cleared
      try {
        await update()
        // Force another update after a short delay
        setTimeout(async () => {
          await update()
        }, 50)
        // Force a third update to be sure
        setTimeout(async () => {
          await update()
        }, 100)
      } catch (updateError) {
        console.warn('Session update error during logout:', updateError)
      }
      
      toast.success('You have been logged out')
      
      // Force a hard refresh to ensure clean state
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      }
      
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Error during logout. Please try again.')
      
      // Force a hard refresh as fallback
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      }
    }
  }

  const register = async (userData: RegisterData): Promise<AuthResult> => {
    try {
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

      // Validate password strength
      if (userData.password.length < 6) {
        const errorMessage = 'Password must be at least 6 characters long'
        toast.error(errorMessage)
        return {
          success: false,
          message: errorMessage,
          error: 'WEAK_PASSWORD',
        }
      }

      // Call registration API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userData.name.trim(),
          email: userData.email.trim().toLowerCase(),
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
    }
  }

  const updateProfile = async (userData: Partial<AuthUser>): Promise<boolean> => {
    try {
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

      const result = await response.json()
      
      // Update session
      await update()
      
      toast.success('Profile updated successfully')
      return true

    } catch (error) {
      console.error('Profile update error:', error)
      toast.error('Failed to update profile')
      return false
    }
  }

  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      if (!user?.id) return

      const response = await fetch('/api/user/profile')
      if (!response.ok) return

      // Update session with fresh data
      await update()

    } catch (error) {
      console.error('Error refreshing user data:', error)
    }
  }, [user?.id, update])

  const hasRole = useCallback((role: 'user' | 'admin'): boolean => {
    if (!user) return false
    
    if (role === 'admin') {
      return user.role === 'admin'
    }
    
    return user.role === 'user' || user.role === 'admin'
  }, [user])

  const canAccess = useCallback((resource: string): boolean => {
    if (!user) return false

    // Define resource permissions
    const permissions: Record<string, string[]> = {
      'admin-dashboard': ['admin'],
      'user-profile': ['user', 'admin'],
      'orders': ['user', 'admin'],
      'products-manage': ['admin'],
      'users-manage': ['admin'],
      'settings': ['admin'],
      'cart': ['user', 'admin'],
      'checkout': ['user', 'admin'],
    }

    const requiredRoles = permissions[resource]
    if (!requiredRoles) return true // No restrictions

    return requiredRoles.includes(user.role)
  }, [user])

  const requireAuth = useCallback((redirectTo: string = '/signin'): boolean => {
    if (!user && !isLoading) {
      const currentPath = window.location.pathname
      const callbackUrl = encodeURIComponent(currentPath)
      router.push(`${redirectTo}?callbackUrl=${callbackUrl}`)
      return false
    }
    return !!user
  }, [user, isLoading, router])

  const requireRole = useCallback((role: 'user' | 'admin', redirectTo: string = '/'): boolean => {
    if (!requireAuth()) return false
    
    if (!hasRole(role)) {
      toast.error('You do not have permission to access this page')
      router.push(redirectTo)
      return false
    }
    
    return true
  }, [requireAuth, hasRole, router])

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
          <h1 className="text-2xl font-bold text-theme-primary mb-4">Access Denied</h1>
          <p className="text-theme-secondary">You do not have permission to access this page.</p>
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
    'PASSWORD_MISMATCH': 'Passwords do not match',
    'WEAK_PASSWORD': 'Password is too weak',
    'REGISTRATION_FAILED': 'Registration failed. Please try again.',
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
