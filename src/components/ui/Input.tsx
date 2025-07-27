'use client'

import React, { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  ...props
}) => {
  const baseClasses = 'w-full px-3 py-2 bg-theme-secondary border-0 rounded-lg focus:outline-none focus:ring-0 focus:border-0 text-theme-primary placeholder:text-theme-muted'
  const errorClasses = ''
  const classes = `${baseClasses} ${errorClasses} ${className}`.trim()

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-theme-primary text-sm font-bold mb-2">
          {label}
        </label>
      )}
      <input className={classes} {...props} />
      {error && (
        <p className="text-theme-secondary text-sm mt-1">{error}</p>
      )}
    </div>
  )
}

export default Input