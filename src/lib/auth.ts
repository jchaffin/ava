import NextAuth, { NextAuthOptions, User as NextAuthUser } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import connectDB from '@/lib/mongoose'
import { User } from '@/models'
import { AuthCredentials } from '@/types'
import bcrypt from 'bcryptjs'

// Global type declaration for gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}

// Environment variable validation
const requiredEnvVars = {
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
}

// Check for required environment variables
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    console.warn(`Missing required environment variable: ${key}`)
  }
})

// Optional environment variables for OAuth
const optionalEnvVars = {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'credentials',
      credentials: {
        email: { 
          label: 'Email', 
          type: 'email',
          placeholder: 'john@example.com'
        },
        password: { 
          label: 'Password', 
          type: 'password',
          placeholder: 'Your password'
        },
      },
      async authorize(credentials): Promise<NextAuthUser | null> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter both email and password')
        }

        try {
          await connectDB()
          
          // Find user by email (case-insensitive)
          const user = await User.findOne({ 
            email: credentials.email.toLowerCase().trim() 
          }).select('+password')
          
          if (!user) {
            throw new Error('No user found with this email')
          }

          // Check if user is active
          if (user.role === 'banned') {
            throw new Error('Account has been suspended')
          }

          // Verify password
          const isPasswordValid = await user.comparePassword(credentials.password)
          
          if (!isPasswordValid) {
            throw new Error('Invalid password')
          }

          // Update last login
          await User.findByIdAndUpdate(user._id, {
            lastLoginAt: new Date(),
          })

          // Return user object (exclude password)
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image || null,
          }
        } catch (error) {
          console.error('Authentication error:', error)
          
          // Return null to show error on client
          return null
        }
      },
    }),

    // Google OAuth Provider (only if environment variables are set)
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        authorization: {
          params: {
            prompt: 'consent',
            access_type: 'offline',
            response_type: 'code',
            scope: 'openid email profile',
          }
        },
        // Add additional configuration to handle state issues
        checks: ['state', 'pkce'],
        profile(profile) {
          return {
            id: profile.sub,
            name: profile.name,
            email: profile.email,
            image: profile.picture,
            role: 'user', // Default role for OAuth users
          }
        },
      })
    ] : []),
  ],

  // Session configuration
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  // JWT configuration
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Callbacks for customizing behavior
  callbacks: {
    // JWT callback - runs whenever a JWT is created, updated, or accessed
    async jwt({ token, user, account, profile }) {
  
      
      // Initial sign in
      if (user) {
        token.id = user.id
        token.role = user.role
        token.email = user.email
        token.name = user.name
        token.picture = user.image

      }

      // Handle OAuth sign-in
      if (account?.provider === 'google' && profile) {
        try {
          await connectDB()
          
          // Check if user exists
          let existingUser = await User.findOne({ email: profile.email })
          
          if (!existingUser) {
            // Create new user from OAuth profile
            existingUser = await User.create({
              name: profile.name,
              email: profile.email,
              password: await bcrypt.hash(Math.random().toString(36) + Date.now(), 12), // More secure random password
              role: 'user',
              image: (profile as any).picture, // Type assertion for Google profile
              emailVerified: true, // Google emails are verified
              lastLoginAt: new Date(),
            })
          } else {
            // Update existing user's last login
            await User.findByIdAndUpdate(existingUser._id, {
              lastLoginAt: new Date(),
              image: (profile as any).picture, // Type assertion for Google profile
            })
          }

          token.id = existingUser._id.toString()
          token.role = existingUser.role
          token.picture = (profile as any).picture // Type assertion for Google profile
        } catch (error) {
          console.error('OAuth user creation error:', error)
          throw new Error('Failed to create or update user account')
        }
      }

      return token
    },

    // Session callback - runs whenever a session is checked
    async session({ session, token }) {
  
      
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as 'user' | 'admin'
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.image = token.picture as string
      }

      
      return session
    },

    // Redirect callback - controls where users are redirected after sign in
    async redirect({ url, baseUrl }) {
      // Handle Google OAuth redirect specifically
      if (url.includes('google') && url.includes('error=invalid_redirect')) {
        console.error('Google OAuth invalid redirect error detected')
        return `${baseUrl}/signin?error=oauth_error`
      }
      
      // Handle OAuth state errors
      if (url.includes('error=state_missing') || url.includes('error=state_mismatch')) {
        console.error('Google OAuth state error detected')
        return `${baseUrl}/signin?error=oauth_state_error`
      }
      
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`
      
      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url
      
      // Default redirect to home page
      return `${baseUrl}/`
    },

    // Sign in callback - controls if sign in is allowed
    async signIn({ user, account, profile, email, credentials }) {
      try {
        await connectDB()

        // For OAuth providers
        if (account?.provider === 'google') {
          console.log('Google OAuth sign-in attempt:', {
            email: profile?.email,
            emailVerified: (profile as any)?.email_verified,
            accountType: account.type,
            hasAccessToken: !!account.access_token,
            hasRefreshToken: !!account.refresh_token,
          })

          // Check if email is verified for Google
          if ((profile as any)?.email_verified !== true) {
            console.log('Google OAuth: Email not verified')
            return false
          }

          // Check if user is banned
          if (profile?.email) {
            const existingUser = await User.findOne({ email: profile.email })
            if (existingUser && existingUser.role === 'banned') {
              console.log('Google OAuth: User is banned')
              return false
            }
          }

          console.log('Google OAuth: Sign-in allowed')
          return true
        }

        // For credentials provider
        if (account?.provider === 'credentials') {
          return user ? true : false
        }

        return true
      } catch (error) {
        console.error('Sign in callback error:', error)
        return false
      }
    },
  },

  // Custom pages
  pages: {
    signIn: '/signin',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/welcome',
  },

  // Events - for logging, analytics, etc.
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      
      
      // Analytics tracking (only in production)
      if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'login', {
          method: account?.provider,
          user_id: user.id,
        })
      }
    },

    async signOut() {
      try {
        // Clear any server-side session data if needed
        console.log('User signed out successfully')
      } catch (error) {
        console.error('Sign out callback error:', error)
      }
    },

    async createUser({ user }) {
      
      
      // Send welcome email, analytics, etc.
    },

    async session({ session, token }) {
      // Session events can be used for activity tracking
    },
  },

  // Security options
  useSecureCookies: process.env.NODE_ENV === 'production',
  
  // Debug mode for development
  debug: process.env.NODE_ENV === 'development',

  // Secret for JWT encryption
  secret: process.env.NEXTAUTH_SECRET,

  // Additional security headers
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
}

// Export the handler
export const handler = NextAuth(authOptions)