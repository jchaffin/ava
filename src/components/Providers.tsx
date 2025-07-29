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
                background: 'var(--ava-bg-secondary)',
                color: 'var(--ava-text-primary)',
                border: '1px solid var(--ava-border)',
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
                  background: 'var(--ava-bg-secondary)',
                  color: 'var(--ava-text-primary)',
                  border: '1px solid var(--ava-border)',
                },
                iconTheme: {
                  primary: 'var(--ava-text-primary)',
                  secondary: 'var(--ava-bg-secondary)',
                },
              },
              error: {
                duration: 4000,
                style: {
                  background: 'var(--ava-bg-secondary)',
                  color: 'var(--ava-text-primary)',
                  border: '1px solid var(--ava-border)',
                },
                iconTheme: {
                  primary: 'var(--ava-text-primary)',
                  secondary: 'var(--ava-bg-secondary)',
                },
              },
              loading: {
                style: {
                  background: 'var(--ava-bg-secondary)',
                  color: 'var(--ava-text-primary)',
                  border: '1px solid var(--ava-border)',
                },
                iconTheme: {
                  primary: 'var(--ava-text-primary)',
                  secondary: 'var(--ava-bg-secondary)',
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
