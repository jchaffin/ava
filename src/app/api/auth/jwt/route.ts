import { NextRequest, NextResponse } from 'next/server'
import { generateToken, verifyToken, extractTokenFromHeader } from '@/lib/jwt'
import { withAuth } from '@/lib/auth-middleware'
import User from '@/models/User'
import connectDB from '@/lib/mongoose'

// POST /api/auth/jwt/login - Generate JWT token
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await User.findOne({ email }).select('+password')
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password)
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = generateToken(user)

    return NextResponse.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    })

  } catch (error) {
    console.error('JWT login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/auth/jwt/verify - Verify JWT token
export const GET = withAuth(async (request: NextRequest) => {
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
    
    return NextResponse.json({
      success: true,
      user: decoded
    })

  } catch (error) {
    console.error('JWT verify error:', error)
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    )
  }
})

// PUT /api/auth/jwt/refresh - Refresh JWT token
export const PUT = withAuth(async (request: NextRequest) => {
  try {
    await connectDB()
    
    const authHeader = request.headers.get('authorization')
    const token = extractTokenFromHeader(authHeader || undefined)
    
    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    
    // Get fresh user data
    const user = await User.findById(decoded.userId)
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Generate new token
    const newToken = generateToken(user)

    return NextResponse.json({
      success: true,
      token: newToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    })

  } catch (error) {
    console.error('JWT refresh error:', error)
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    )
  }
}) 