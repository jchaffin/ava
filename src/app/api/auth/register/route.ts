import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongoose'
import { User } from '@/models'
import { CreateUserInput, ApiResponse } from '@/types'


interface RegisterRequestBody {
  name: string
  email: string
  password: string
  role?: 'user' | 'admin'
}

interface ValidationError {
  field: string
  message: string
}

// POST /api/auth/register
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    // Parse request body
    const body: RegisterRequestBody = await request.json()
    const { name, email, password, role = 'user' } = body

    // Validate required fields
    const validationErrors = validateRegistrationData(body)
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          error: validationErrors[0].message,
          data: { validationErrors },
        },
        { status: 400 }
      )
    }

    // Connect to database
    await connectDB()

    // Check if user already exists
    const existingUser = await User.findOne({ 
      email: email.toLowerCase().trim() 
    })

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'User with this email already exists',
          error: 'EMAIL_ALREADY_EXISTS',
        },
        { status: 409 }
      )
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          message: passwordValidation.message,
          error: 'WEAK_PASSWORD',
        },
        { status: 400 }
      )
    }

    // Create user data
    const userData: CreateUserInput = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password, // Will be hashed by the User model pre-save hook
      role: role as 'user' | 'admin',
    }

    // Create new user
    const newUser = await User.create(userData)

    // Remove password from response
    const userResponse = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      createdAt: newUser.createdAt,
    }

    // Log successful registration
    console.log(`New user registered: ${newUser.email}`)

    // Send welcome email (in a real app)
    // await sendWelcomeEmail(newUser.email, newUser.name)

    return NextResponse.json(
      {
        success: true,
        message: 'User registered successfully',
        data: { user: userResponse },
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Registration error:', error)

    // Handle MongoDB validation errors
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ValidationError') {
      const errorObj = error as { errors?: Record<string, { path: string; message: string }> }
      const validationErrors = Object.values(errorObj.errors || {}).map((err) => ({
        field: err.path,
        message: err.message,
      }))

      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          error: 'VALIDATION_ERROR',
          data: { validationErrors },
        },
        { status: 400 }
      )
    }

    // Handle MongoDB duplicate key error
    if (error && typeof error === 'object' && 'code' in error && (error as { code: number }).code === 11000) {
      const errorObj = error as { keyPattern?: Record<string, unknown> }
      const field = Object.keys(errorObj.keyPattern || {})[0]
      return NextResponse.json(
        {
          success: false,
          message: `${field} already exists`,
          error: 'DUPLICATE_FIELD',
        },
        { status: 409 }
      )
    }

    // Generic server error
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: 'SERVER_ERROR',
      },
      { status: 500 }
    )
  }
}

// GET method not allowed
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      success: false,
      message: 'Method not allowed',
      error: 'METHOD_NOT_ALLOWED',
    },
    { status: 405 }
  )
}

// Validation helper functions
function validateRegistrationData(data: RegisterRequestBody): ValidationError[] {
  const errors: ValidationError[] = []

  // Name validation
  if (!data.name || typeof data.name !== 'string') {
    errors.push({
      field: 'name',
      message: 'Name is required and must be a string',
    })
  } else if (data.name.trim().length < 2) {
    errors.push({
      field: 'name',
      message: 'Name must be at least 2 characters long',
    })
  } else if (data.name.trim().length > 50) {
    errors.push({
      field: 'name',
      message: 'Name cannot exceed 50 characters',
    })
  }

  // Email validation
  if (!data.email || typeof data.email !== 'string') {
    errors.push({
      field: 'email',
      message: 'Email is required and must be a string',
    })
  } else if (!isValidEmail(data.email)) {
    errors.push({
      field: 'email',
      message: 'Please enter a valid email address',
    })
  }

  // Password validation
  if (!data.password || typeof data.password !== 'string') {
    errors.push({
      field: 'password',
      message: 'Password is required and must be a string',
    })
  } else if (data.password.length < 6) {
    errors.push({
      field: 'password',
      message: 'Password must be at least 6 characters long',
    })
  }

  // Role validation (optional)
  if (data.role && !['user', 'admin'].includes(data.role)) {
    errors.push({
      field: 'role',
      message: 'Role must be either "user" or "admin"',
    })
  }

  return errors
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim().toLowerCase())
}

interface PasswordValidationResult {
  isValid: boolean
  message: string
  strength: number
}

function validatePasswordStrength(password: string): PasswordValidationResult {
  let strength = 0
  const feedback: string[] = []

  // Length check
  if (password.length >= 8) {
    strength += 1
  } else {
    feedback.push('at least 8 characters')
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    strength += 1
  } else {
    feedback.push('one lowercase letter')
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    strength += 1
  } else {
    feedback.push('one uppercase letter')
  }

  // Number check
  if (/\d/.test(password)) {
    strength += 1
  } else {
    feedback.push('one number')
  }

  // Special character check
  if (/[^A-Za-z0-9]/.test(password)) {
    strength += 1
  } else {
    feedback.push('one special character')
  }

  // Common password check
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123',
    'password123', 'admin', 'letmein', 'welcome', 'monkey'
  ]
  
  if (commonPasswords.includes(password.toLowerCase())) {
    return {
      isValid: false,
      message: 'Password is too common. Please choose a more secure password.',
      strength: 0,
    }
  }

  // Determine if password is acceptable
  const isValid = strength >= 3 && password.length >= 6

  if (!isValid && feedback.length > 0) {
    return {
      isValid: false,
      message: `Password must contain ${feedback.join(', ')}`,
      strength,
    }
  }

  return {
    isValid: true,
    message: 'Password is strong',
    strength,
  }
}

// Rate limiting helper (basic implementation)
const registrationAttempts = new Map<string, { count: number; lastAttempt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15 minutes
  const maxAttempts = 5

  const attempts = registrationAttempts.get(ip)
  
  if (!attempts) {
    registrationAttempts.set(ip, { count: 1, lastAttempt: now })
    return true
  }

  // Reset if window has passed
  if (now - attempts.lastAttempt > windowMs) {
    registrationAttempts.set(ip, { count: 1, lastAttempt: now })
    return true
  }

  // Check if limit exceeded
  if (attempts.count >= maxAttempts) {
    return false
  }

  // Increment attempts
  attempts.count += 1
  attempts.lastAttempt = now
  registrationAttempts.set(ip, attempts)

  return true
}






