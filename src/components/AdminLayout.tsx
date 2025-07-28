'use client'

import React, { useState } from 'react'
import { AdminNav } from '@/components'
import { Menu, X, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui'
import ThemeToggle from './ThemeToggle'
import { useRouter } from 'next/navigation';

interface AdminLayoutProps {
  children: React.ReactNode
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter();

  return (
    <div className="flex min-h-screen bg-theme-primary">
      {/* Mobile sidebar backdrop */}
      <div 
        className={`lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300 z-[9998] ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
        style={{ touchAction: 'none' }}
      />
      
      {/* Mobile sidebar */}
      <div className={`lg:hidden fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-theme-secondary shadow-2xl transform transition-all duration-300 ease-out z-[9999] ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <AdminNav onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <AdminNav />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Mobile header */}
        <div className="lg:hidden bg-theme-secondary border-b border-theme px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-theme-primary hover:text-theme-primary hover:bg-theme-tertiary"
            >
              <Menu className="w-6 h-6" />
            </Button>
            <div className="flex-1" /> {/* Spacer */}
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="p-2 text-theme-primary hover:text-theme-primary hover:bg-theme-tertiary flex items-center"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              <span className="font-medium">Back</span>
            </Button>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout 