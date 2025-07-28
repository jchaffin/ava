'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  BarChart3,
  Settings,
  LogOut,
  BookOpen,
} from 'lucide-react'
import { Button } from '@/components/ui'
import { useAuth } from '@/context'
import ThemeToggle from './ThemeToggle'

const AdminNav: React.FC = () => {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const navItems = [
    {
      href: '/admin/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      href: '/admin/products',
      label: 'Products',
      icon: Package,
    },
    {
      href: '/admin/orders',
      label: 'Orders',
      icon: ShoppingBag,
    },
    {
      href: '/admin/analytics',
      label: 'Analytics',
      icon: BarChart3,
    },
    {
      href: '/admin/settings',
      label: 'Settings',
      icon: Settings,
    },
  ]

  const tutorialItems = [
    {
      href: '/admin/tutorials/stripe',
      label: 'Stripe Setup',
      icon: BookOpen,
    },
    {
      href: '/admin/tutorials/paypal',
      label: 'PayPal Setup',
      icon: BookOpen,
    },
  ]

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <nav className="bg-theme-primary shadow-sm border-r border-theme w-64 min-h-screen">
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-lg font-semibold text-theme-primary">Admin Panel</h1>
            <p className="text-sm text-theme-muted">Welcome, {user?.name}</p>
          </div>
          <ThemeToggle />
        </div>

        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-theme-tertiary text-theme-primary border-r-2 border-theme-primary'
                    : 'text-theme-secondary hover:bg-theme-secondary hover:text-theme-primary'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>

        <div className="mt-6 pt-6 border-t border-theme">
          <h3 className="text-xs font-semibold text-theme-muted uppercase tracking-wider mb-3">Tutorials</h3>
          <div className="space-y-2">
            {tutorialItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-theme-tertiary text-theme-primary border-r-2 border-theme-primary'
                      : 'text-theme-secondary hover:bg-theme-secondary hover:text-theme-primary'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-theme">
          <Button
            variant="ghost"
            onClick={logout}
            className="w-full justify-start text-theme-secondary hover:text-theme-primary"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </Button>
        </div>
      </div>
    </nav>
  )
}

export default AdminNav 