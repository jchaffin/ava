import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import connectDB from '@/lib/mongoose'
import { authOptions } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import User from '@/models/User'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role
    if (session.user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 })
    }

    await connectDB()

    // Get request body
    const { currentPassword, newPassword } = await request.json()

    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Current password and new password are required' },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, message: 'New password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Get user from database
    const user = await User.findById(session.user.id).select('+password')
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Current password is incorrect' },
        { status: 400 }
      )
    }

    // Hash new password
    const saltRounds = 12
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds)

    // Update password in database
    user.password = hashedNewPassword
    await user.save()

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully'
    })

  } catch (error) {
    console.error('Change password API error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to change password' },
      { status: 500 }
    )
  }
} 