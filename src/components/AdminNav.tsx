'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  BarChart3,
  Settings,
  LogOut,
  BookOpen,
  Cloud,
  X,
  Home,
  BookOpen as Book,
  ArrowLeft,
} from 'lucide-react'
import { Button } from '@/components/ui'
import { useAuth } from '@/context'
import ThemeToggle from './ThemeToggle'

interface AdminNavProps {
  onClose?: () => void
}

const AdminNav: React.FC<AdminNavProps> = ({ onClose }) => {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const router = useRouter();

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
      href: '/admin/s3',
      label: 'Local Storage',
      icon: Cloud,
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
    {
      href: '/admin/tutorials/aws',
      label: 'Storage Setup',
      icon: Cloud,
    },
  ]

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  const handleNavClick = () => {
    if (onClose) {
      onClose()
    }
  }

  return (
    <nav className="flex flex-col h-full bg-theme-secondary">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b-2 border-theme">
        <div className="flex-1"></div>
        <div className="flex items-center justify-center flex-1">
        </div>
        <div className="flex-1 flex justify-end">
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-theme-secondary text-theme-primary hover:bg-theme-tertiary hover:text-theme-primary transition-all duration-200 cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Desktop user info */}
          <div className="hidden lg:block mb-8">
            <div>
              <h1 className="text-lg font-semibold text-theme-primary">Admin Panel</h1>
              <p className="text-sm text-theme-muted">Welcome, {user?.name}</p>
            </div>
          </div>

          {/* Mobile user info */}
          <div className="lg:hidden mb-6 p-4 bg-theme-tertiary rounded-xl border border-theme">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-theme-primary rounded-full flex items-center justify-center">
                <span className="text-theme-secondary font-semibold text-sm">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-theme-primary truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-theme-muted truncate">
                  {user?.email || ''}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="space-y-1">
            {navItems.map((item, index) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleNavClick}
                  className={`flex items-center space-x-4 px-4 py-4 rounded-xl text-base font-medium transition-all duration-200 transform hover:scale-[1.02] cursor-pointer focus:outline-none focus:ring-0 focus:border-0 min-h-[44px] ${
                    isActive(item.href)
                      ? 'text-theme-tertiary bg-theme-primary'
                      : 'text-theme-primary hover:text-theme-primary hover:bg-theme-tertiary'
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {isActive(item.href) && (
                    <div className="w-2 h-2 bg-theme-primary rounded-full"></div>
                  )}
                </Link>
              )
            })}
          </div>

          {/* Tutorials Section */}
          <div className="mt-6 pt-6 border-t border-theme">
            <h3 className="text-xs font-semibold text-theme-muted uppercase tracking-wider mb-3">Tutorials</h3>
            <div className="space-y-1">
              {tutorialItems.map((item, index) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleNavClick}
                    className={`flex items-center space-x-4 px-4 py-4 rounded-xl text-base font-medium transition-all duration-200 transform hover:scale-[1.02] cursor-pointer focus:outline-none focus:ring-0 focus:border-0 min-h-[44px] ${
                      isActive(item.href)
                        ? 'text-theme-tertiary bg-theme-primary'
                        : 'text-theme-primary hover:text-theme-primary hover:bg-theme-tertiary'
                    }`}
                    style={{ animationDelay: `${(index + navItems.length) * 50}ms` }}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {isActive(item.href) && (
                      <div className="w-2 h-2 bg-theme-primary rounded-full"></div>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Section */}
      <div className="flex-shrink-0 p-6 border-t border-theme">
        {/* Icon Row - Home, Back, Tutorials, Theme Toggle */}
        <div className="mb-4 flex items-center justify-center space-x-2">
          <Link href="/">
            <button
              className="p-2 text-theme-secondary hover:text-theme-primary"
            >
              <Home className="w-5 h-5" />
            </button>
          </Link>
          <button
            className="p-2 text-theme-secondary hover:text-theme-primary"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Link href="/admin/tutorials">
            <button
              className="p-2 text-theme-secondary hover:text-theme-primary"
            >
              <BookOpen className="w-5 h-5" />
            </button>
          </Link>
          <ThemeToggle />
        </div>
        
        {/* Sign Out */}
        <Button
          variant="ghost"
          onClick={logout}
          className="w-full justify-center text-theme-secondary hover:text-theme-primary"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </Button>
      </div>
    </nav>
  )
}

export default AdminNav 