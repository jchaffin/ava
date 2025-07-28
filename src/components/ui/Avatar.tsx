'use client'

import React from 'react'
import Image from 'next/image'
import { getAvatarUrl, getAvatarFallback } from '@/utils/helpers'

interface AvatarProps {
  user: {
    name?: string
    email: string
    role: string
    image?: string | null
  }
  size?: number
  className?: string
  showFallback?: boolean
}

const Avatar: React.FC<AvatarProps> = ({ 
  user, 
  size = 40, 
  className = '',
  showFallback = true 
}) => {
  const avatarUrl = getAvatarUrl(user)
  const fallbackText = getAvatarFallback(user)
  
  // For admin users or when no avatar URL, show fallback
  if (!avatarUrl || user.role === 'admin') {
    return (
      <div 
        className={`bg-theme-primary text-theme-secondary rounded-full flex items-center justify-center font-semibold ${className}`}
        style={{ width: size, height: size, fontSize: `${size * 0.4}px` }}
      >
        {fallbackText}
      </div>
    )
  }

  // For regular users with Gravatar
  return (
    <div 
      className={`relative rounded-full overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={avatarUrl}
        alt={`${user.name || 'User'} avatar`}
        width={size}
        height={size}
        className="object-cover"
        onError={(e) => {
          // If Gravatar fails, show fallback
          if (showFallback) {
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
            const fallback = target.parentElement?.querySelector('.avatar-fallback') as HTMLElement
            if (fallback) {
              fallback.style.display = 'flex'
            }
          }
        }}
      />
      {/* Fallback that shows on error */}
      {showFallback && (
        <div 
          className="avatar-fallback hidden absolute inset-0 bg-theme-primary text-theme-secondary rounded-full flex items-center justify-center font-semibold"
          style={{ fontSize: `${size * 0.4}px` }}
        >
          {fallbackText}
        </div>
      )}
    </div>
  )
}

export default Avatar 