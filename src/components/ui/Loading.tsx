import React from 'react'
import LoadingSpinner from './LoadingSpinner'

interface LoadingProps {
  type?: 'spinner' | 'skeleton' | 'overlay'
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'secondary' | 'white'
  text?: string
  className?: string
  lines?: number
  height?: string
}

const Loading: React.FC<LoadingProps> = ({
  type = 'spinner',
  size = 'md',
  color = 'primary',
  text,
  className = '',
  lines = 3,
  height = 'h-4'
}) => {
  const renderSpinner = () => (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      <LoadingSpinner size={size} color={color} />
      {text && (
        <p className="text-sm text-theme-secondary animate-pulse">{text}</p>
      )}
    </div>
  )

  const renderSkeleton = () => (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`${height} bg-gray-200 rounded animate-pulse ${
            index === 0 ? 'w-3/4' : index === 1 ? 'w-1/2' : 'w-5/6'
          }`}
        />
      ))}
    </div>
  )

  const renderOverlay = () => (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}>
      <div className="bg-white rounded-lg p-6 shadow-xl">
        <div className="flex flex-col items-center space-y-4">
          <LoadingSpinner size={size} color="primary" />
          {text && (
            <p className="ava-text-tertiary font-medium">{text}</p>
          )}
        </div>
      </div>
    </div>
  )

  switch (type) {
    case 'skeleton':
      return renderSkeleton()
    case 'overlay':
      return renderOverlay()
    case 'spinner':
    default:
      return renderSpinner()
  }
}

// Specialized loading components
export const PageLoading: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => (
  <div className="min-h-screen flex items-center justify-center">
    <Loading type="spinner" size="lg" text={text} />
  </div>
)

export const CardLoading: React.FC<{ lines?: number }> = ({ lines = 3 }) => (
  <div className="p-6">
    <Loading type="skeleton" lines={lines} />
  </div>
)

export const ButtonLoading: React.FC<{ text?: string }> = ({ text }) => (
  <div className="flex items-center space-x-2">
    <LoadingSpinner size="sm" color="white" />
    {text && <span>{text}</span>}
  </div>
)

export const TableLoading: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 4 
}) => (
  <div className="space-y-4">
    {/* Header skeleton */}
    <div className="flex space-x-4">
      {Array.from({ length: columns }).map((_, index) => (
        <div
          key={index}
          className="h-4 bg-gray-200 rounded animate-pulse flex-1"
        />
      ))}
    </div>
    
    {/* Row skeletons */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <div
            key={colIndex}
            className="h-4 bg-gray-200 rounded animate-pulse flex-1"
          />
        ))}
      </div>
    ))}
  </div>
)

export default Loading 