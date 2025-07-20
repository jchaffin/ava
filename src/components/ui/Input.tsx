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
  const baseClasses = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500'
  const errorClasses = error ? 'border-red-500' : ''
  const classes = `${baseClasses} ${errorClasses} ${className}`.trim()

  return (
    <div className="mb-4">
      {label && (
        <label className="block ava-text-tertiary text-sm font-bold mb-2">
          {label}
        </label>
      )}
      <input className={classes} {...props} />
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  )
}

export default Input