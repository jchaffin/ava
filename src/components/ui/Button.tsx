'use client'

import React, { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost' | 'outline' | 'solid'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  loading = false,
  className = '',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'btn-primary text-theme-primary focus:ring-theme-primary',
    secondary: 'btn-secondary focus:ring-theme-secondary',
    tertiary: 'bg-theme-tertiary text-theme-primary hover:bg-theme-secondary hover:text-theme-primary focus:ring-theme-tertiary',
    danger: 'btn-danger text-theme-primary focus:ring-red-500',
    ghost: 'btn-ghost text-gray-800 focus:ring-theme-primary',
    outline: 'btn-outline text-gray-800 focus:ring-theme-primary',
    solid: 'btn-solid text-theme-primary focus:ring-[var(--ava-accent)]',
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm font-medium',
    md: 'px-4 py-2.5 text-base font-semibold',
    lg: 'px-6 py-3 text-lg font-semibold',
  }
  
  const disabledClasses = (disabled || loading) ? 'opacity-50 cursor-not-allowed' : ''
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${disabledClasses} ${className}`.trim()
  
  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  )
}

export default Button