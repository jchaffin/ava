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
          position="top-left"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
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
