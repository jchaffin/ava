import NextAuth, { NextAuthOptions, User as NextAuthUser } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import connectDB from '@/lib/mongoose'
import  User  from '@/lib/models'
import { AuthCredentials } from '@/types'
import bcrypt from 'bcryptjs'

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
          
          // Find user by email
          const user = await User.findOne({ 
            email: credentials.email.toLowerCase() 
          }).select('+password')
          
          if (!user) {
            throw new Error('No user found with this email')
          }

          // Verify password
          const isPasswordValid = await user.comparePassword(credentials.password)
          
          if (!isPasswordValid) {
            throw new Error('Invalid password')
          }

          // Return user object
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

    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code'
        }
      }
    }),

    // Additional providers can be added here
    // GitHubProvider({
    //   clientId: process.env.GITHUB_ID!,
    //   clientSecret: process.env.GITHUB_SECRET!,
    // }),
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
              password: await bcrypt.hash(Math.random().toString(36), 12), // Random password for OAuth users
              role: 'user',
              image: profile.picture,
            })
          }

          token.id = existingUser._id.toString()
          token.role = existingUser.role
        } catch (error) {
          console.error('OAuth user creation error:', error)
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
      }

      return session
    },

    // Redirect callback - controls where users are redirected after sign in
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`
      
      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url
      
      return baseUrl
    },

    // Sign in callback - controls if sign in is allowed
    async signIn({ user, account, profile, email, credentials }) {
      try {
        await connectDB()

        // For OAuth providers
        if (account?.provider === 'google') {
          // Check if email is verified for Google
          if (profile?.email_verified !== true) {
            return false
          }

          // Additional checks can be added here
          // For example: domain restrictions, user approval, etc.
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
    signUp: '/register',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/welcome',
  },

  // Events - for logging, analytics, etc.
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log(`User ${user.email} signed in via ${account?.provider}`)
      
      // Analytics tracking
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'login', {
          method: account?.provider,
          user_id: user.id,
        })
      }
    },

    async signOut({ token }) {
      console.log(`User ${token?.email} signed out`)
    },

    async createUser({ user }) {
      console.log(`New user created: ${user.email}`)
      
      // Send welcome email, analytics, etc.
    },

    async session({ session, token }) {
      // Session events can be used for activity tracking
    },
  },

  // Security options
  useSecureCookies: process.env.NODE_ENV === 'production',
  
  // Database adapter (optional - for storing sessions in database)
  // adapter: MongoDBAdapter(clientPromise),

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
      },
    },
  },
}

// Export the handler
export const handler = NextAuth(authOptions)