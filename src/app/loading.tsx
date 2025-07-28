import React from 'react'
import { LoadingSpinner } from '@/components/ui'

const Loading = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-theme-secondary">
      <LoadingSpinner size="lg" color="secondary" />
    </div>
  )
}

export default Loading
