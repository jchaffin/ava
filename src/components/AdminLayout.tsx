'use client'

import React from 'react'
import { AdminNav } from '@/components'

interface AdminLayoutProps {
  children: React.ReactNode
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-theme-primary">
      <AdminNav />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}

export default AdminLayout 