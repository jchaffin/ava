'use client'

import React, { ReactNode } from 'react'
import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'

interface ProvidersProps {
  children: ReactNode
}

const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <SessionProvider>
      <AuthProvider>
        <CartProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#ffffff',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                fontSize: '13px',
                fontWeight: '400',
                padding: '12px 16px',
                maxWidth: '320px',
                minWidth: '280px',
                opacity: '0.95',
              },
              success: {
                duration: 2500,
                style: {
                  background: '#f9fafb',
                  color: '#065f46',
                  border: '1px solid #d1fae5',
                },
                iconTheme: {
                  primary: '#059669',
                  secondary: '#ffffff',
                },
              },
              error: {
                duration: 4000,
                style: {
                  background: '#f9fafb',
                  color: '#991b1b',
                  border: '1px solid #fecaca',
                },
                iconTheme: {
                  primary: '#dc2626',
                  secondary: '#ffffff',
                },
              },
              loading: {
                style: {
                  background: '#f9fafb',
                  color: '#4b5563',
                  border: '1px solid #d1d5db',
                },
                iconTheme: {
                  primary: '#6b7280',
                  secondary: '#ffffff',
                },
              },
            }}
          />
        </CartProvider>
      </AuthProvider>
    </SessionProvider>
  )
}

export default Providers
