'use client'

import React, { TextareaHTMLAttributes } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  className = '',
  ...props
}) => {
  const baseClasses = 'w-full px-3 py-2 border border-theme rounded-lg focus:outline-none focus:ring-0 focus:border-theme bg-theme-tertiary text-theme-primary placeholder:text-theme-muted placeholder:opacity-70 resize-vertical'
  const errorClasses = error ? 'border-red-500' : ''
  const classes = `${baseClasses} ${errorClasses} ${className}`.trim()

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-theme-primary text-sm font-bold mb-2">
          {label}
        </label>
      )}
      <textarea className={classes} {...props} />
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  )
}

export default Textarea 