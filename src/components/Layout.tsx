'use client'

import React, { useState, useEffect, ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { useCart, useAuth } from '@/context'
import { Button } from './ui'

import { 
  ShoppingCartIcon, 
  UserIcon, 
  Bars3Icon,
  XMarkIcon,
  HeartIcon,
  ChevronDownIcon,
  HomeIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  StarIcon,
  CubeIcon,
} from '@heroicons/react/24/outline'
import { ShoppingCartIcon as ShoppingCartSolidIcon } from '@heroicons/react/24/solid'

import toast from 'react-hot-toast'

interface LayoutProps {
  children: ReactNode
  showNavigation?: boolean
  showFooter?: boolean
  className?: string
}

interface NavigationItem {
  name: string
  href: string
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>
  children?: NavigationItem[]
  requireAuth?: boolean
  adminOnly?: boolean
  userOnly?: boolean
}

interface MobileMenuState {
  isOpen: boolean
  activeSubmenu: string | null
}

interface UserMenuState {
  isOpen: boolean
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  showNavigation = true, 
  showFooter = true,
  className = '' 
}) => {

  const pathname = usePathname()
  const { getTotalItems } = useCart()
  const { user, isAuthenticated, isLoading, hasRole, logout } = useAuth()
  
  // Debug logging
  console.log('Layout: Auth state', { 
    user: user ? { id: user.id, name: user.name, email: user.email, role: user.role } : null, 
    isAuthenticated, 
    isLoading
  })

  // Automatically hide navigation and footer for admin routes
  const isAdminRoute = pathname.startsWith('/admin')
  const shouldShowNavigation = showNavigation && !isAdminRoute
  const shouldShowFooter = showFooter && !isAdminRoute

  const [mobileMenu, setMobileMenu] = useState<MobileMenuState>({
    isOpen: false,
    activeSubmenu: null,
  })
  
  const [userMenu, setUserMenu] = useState<UserMenuState>({
    isOpen: false,
  })



  // Navigation items configuration - Updated for AVA skincare
  const navigationItems: NavigationItem[] = [
    {
      name: 'Home',
      href: '/',
      icon: HomeIcon,
    },
    {
      name: 'Products',
      href: '/products',
    },
    {
      name: 'About',
      href: '/about',
    },
    {
      name: 'Contact',
      href: '/contact',
    },
  ]

  // User menu items for regular users
  const userMenuItems: NavigationItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: ChartBarIcon,
      requireAuth: true,
      userOnly: true, // Only show for regular users
    },
    {
      name: 'My Profile',
      href: '/profile',
      icon: UserCircleIcon,
      requireAuth: true,
      userOnly: true, // Only show for regular users
    },
    {
      name: 'My Orders',
      href: '/orders',
      icon: ClipboardDocumentListIcon,
      requireAuth: true,
    },
    {
      name: 'Wishlist',
      href: '/wishlist',
      icon: HeartIcon,
      requireAuth: true,
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: CogIcon,
      requireAuth: true,
    },
  ]

  // Admin menu items
  const adminMenuItems: NavigationItem[] = [
    {
      name: 'Admin Dashboard',
      href: '/admin/dashboard',
      icon: ChartBarIcon,
      requireAuth: true,
      adminOnly: true,
    },
    {
      name: 'Manage Products',
      href: '/admin/products',
      icon: CubeIcon,
      requireAuth: true,
      adminOnly: true,
    },
    {
      name: 'Manage Orders',
      href: '/admin/orders',
      icon: ClipboardDocumentListIcon,
      requireAuth: true,
      adminOnly: true,
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: ChartBarIcon,
      requireAuth: true,
      adminOnly: true,
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: CogIcon,
      requireAuth: true,
      adminOnly: true,
    },
  ]

  // Close menus when route changes
  useEffect(() => {
    setMobileMenu({ isOpen: false, activeSubmenu: null })
    setUserMenu({ isOpen: false })
  }, [pathname])

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      
      if (!target.closest('[data-menu="mobile"]')) {
        setMobileMenu(prev => ({ ...prev, isOpen: false }))
      }
      
      if (!target.closest('[data-menu="user"]')) {
        setUserMenu({ isOpen: false })
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  // Show loading state while authentication is being established
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <div className="w-32 h-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </main>
      </div>
    )
  }

  const handleSignOut = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Sign out error:', error)
      toast.error('Error signing out')
    }
  }

  const toggleMobileMenu = () => {
    setMobileMenu(prev => ({ ...prev, isOpen: !prev.isOpen }))
  }



  const isActiveLink = (href: string): boolean => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  const renderDesktopNavigation = () => (
    <nav className="hidden lg:flex items-center space-x-8">
      {navigationItems.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
            isActiveLink(item.href)
              ? 'text-ava-accent bg-ava-cream'
              : 'text-ava-text-secondary hover:text-ava-accent hover:bg-ava-bg-secondary'
          }`}
        >
          {item.icon && <item.icon className="w-4 h-4" />}
          <span>{item.name}</span>
        </Link>
      ))}
    </nav>
  )

  const renderMobileNavigation = () => (
    <div className="lg:hidden fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={() => setMobileMenu({ isOpen: false, activeSubmenu: null })}
      />
      
      {/* Mobile menu */}
      <div className="fixed inset-y-0 left-0 w-80 bg-white dark:bg-gray-900 shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <Link href="/" className="flex items-center" onClick={() => setMobileMenu({ isOpen: false, activeSubmenu: null })}>
            <Image
              src="/logo.png"
              alt="AVA Logo"
              width={100}
              height={32}
              className="h-8 w-auto"
              priority
            />
          </Link>
          <button
            onClick={() => setMobileMenu({ isOpen: false, activeSubmenu: null })}
            className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="px-4 py-6 space-y-2">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileMenu({ isOpen: false, activeSubmenu: null })}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200 ${
                isActiveLink(item.href)
                  ? 'text-ava-accent bg-ava-cream'
                  : 'text-ava-text-secondary hover:text-ava-accent hover:bg-ava-bg-secondary'
              }`}
            >
              {item.icon && <item.icon className="w-5 h-5" />}
              <span>{item.name}</span>
            </Link>
          ))}
        </div>

                 {/* User section */}
         {isAuthenticated ? (
           <div className="px-4 py-6 border-t border-gray-200 dark:border-gray-700">
             <div className="mb-4">
               <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name || 'User'}</p>
               <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email || ''}</p>
             </div>
            <div className="space-y-2">
              {(hasRole('admin') ? adminMenuItems : userMenuItems)
                .filter(item => !item.requireAuth || isAuthenticated)
                .filter(item => !item.adminOnly || hasRole('admin'))
                .filter(item => !item.userOnly || !hasRole('admin'))
                .map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenu({ isOpen: false, activeSubmenu: null })}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium text-gray-700 dark:text-gray-300 hover:text-ava-accent hover:bg-ava-bg-secondary dark:hover:bg-gray-800 transition-colors duration-200"
                  >
                    {item.icon && <item.icon className="w-5 h-5" />}
                    <span>{item.name}</span>
                  </Link>
                ))}
              <button
                onClick={() => {
                  handleSignOut()
                  setMobileMenu({ isOpen: false, activeSubmenu: null })
                }}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 w-full transition-colors duration-200"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="px-4 py-6 border-t border-gray-200 dark:border-gray-700 space-y-3">
            <Link
              href="/signin"
              onClick={() => setMobileMenu({ isOpen: false, activeSubmenu: null })}
              className="block w-full px-4 py-3 text-center text-base font-medium text-gray-700 dark:text-gray-300 hover:text-ava-accent hover:bg-ava-bg-secondary dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenu({ isOpen: false, activeSubmenu: null })}
              className="block w-full px-4 py-3 text-center text-base font-medium text-white bg-ava-accent hover:bg-red-700 rounded-lg transition-colors duration-200"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </div>
  )

  const renderUserMenu = () => (
    <div className="relative" data-menu="user">
      <button
        onClick={() => setUserMenu(prev => ({ isOpen: !prev.isOpen }))}
        className="flex items-center space-x-2 p-2 rounded-lg text-gray-700 hover:text-ava-accent hover:bg-ava-bg-secondary transition-colors duration-200"
      >
        <div className="w-8 h-8 bg-ava-accent rounded-full flex items-center justify-center">
          <UserIcon className="w-4 h-4 text-white" />
        </div>
        <span className="hidden md:block text-sm font-medium">{user?.name || 'User'}</span>
        <ChevronDownIcon className="w-4 h-4" />
      </button>

      {userMenu.isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name || 'User'}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email || ''}</p>
          </div>
          
          <div className="py-2">
            {(hasRole('admin') ? adminMenuItems : userMenuItems)
              .filter(item => !item.requireAuth || isAuthenticated)
              .filter(item => !item.adminOnly || hasRole('admin'))
              .filter(item => !item.userOnly || !hasRole('admin'))
              .map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setUserMenu({ isOpen: false })}
                  className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-ava-accent hover:bg-ava-bg-secondary dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  {item.icon && <item.icon className="w-4 h-4" />}
                  <span>{item.name}</span>
                </Link>
              ))}
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
            <button
              onClick={() => {
                handleSignOut()
                setUserMenu({ isOpen: false })
              }}
              className="flex items-center space-x-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 w-full transition-colors duration-200"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )

  const renderHeader = () => (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Mobile menu button on mobile, hidden on desktop */}
          <div className="lg:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg text-gray-600 hover:text-ava-accent hover:bg-gray-100 transition-colors duration-200"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
          </div>

          {/* Center - Logo (centered on mobile, left on desktop) */}
          <div className="flex-1 flex justify-center lg:justify-start">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="AVA Logo"
                width={120}
                height={40}
                className="h-8 w-auto"
                priority
              />
            </Link>
          </div>

          {/* Desktop navigation - hidden on mobile */}
          <div className="hidden lg:block">
            {renderDesktopNavigation()}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-2">



            {/* Wishlist - only show for regular users */}
            {isAuthenticated && !hasRole('admin') && (
              <Link href="/wishlist" className="p-2 text-gray-600 hover:text-ava-accent hover:bg-gray-100 rounded-lg transition-colors duration-200">
                <HeartIcon className="w-5 h-5" />
              </Link>
            )}

            {/* Shopping cart */}
            <Link href="/cart" className="relative p-2 text-gray-600 hover:text-ava-accent hover:bg-gray-100 rounded-lg transition-colors duration-200">
              {getTotalItems() > 0 ? (
                <ShoppingCartSolidIcon className="w-5 h-5 text-ava-accent" />
              ) : (
                <ShoppingCartIcon className="w-5 h-5" />
              )}
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-ava-accent text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {getTotalItems() > 9 ? '9+' : getTotalItems()}
                </span>
              )}
            </Link>

            {/* User menu or sign in */}
            {isAuthenticated ? (
              renderUserMenu()
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/signin"
                  className="text-gray-700 hover:text-ava-accent px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-ava-accent text-white hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile navigation overlay */}
      {mobileMenu.isOpen && renderMobileNavigation()}
    </header>
  )

  const renderFooter = () => (
    <footer className="bg-ava-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">AVA Skincare</h3>
            <p className="text-gray-400 mb-4">
              Premium skincare products for radiant, healthy skin. Discover your natural beauty with our carefully curated collection.
            </p>
            <div className="flex space-x-4">
              {/* Social media links */}
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                <span className="sr-only">Instagram</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                <span className="sr-only">Facebook</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors duration-200">About Us</Link></li>
              <li><Link href="/products" className="text-gray-400 hover:text-white transition-colors duration-200">Products</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors duration-200">Contact</Link></li>
              <li><Link href="/shipping" className="text-gray-400 hover:text-white transition-colors duration-200">Shipping Info</Link></li>
              <li><Link href="/returns" className="text-gray-400 hover:text-white transition-colors duration-200">Returns</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li><Link href="/faq" className="text-gray-400 hover:text-white transition-colors duration-200">FAQ</Link></li>
              <li><Link href="/support" className="text-gray-400 hover:text-white transition-colors duration-200">Support</Link></li>
              <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors duration-200">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors duration-200">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Stay Connected</h3>
            <p className="text-gray-400 mb-4">
              Subscribe for skincare tips, new products, and exclusive offers.
            </p>
            <form className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-3 py-2 bg-gray-800 text-white placeholder-gray-400 border border-gray-700 rounded-l-md focus:outline-none focus:ring-1 focus:ring-ava-accent"
              />
              <Button
                type="submit"
                className="rounded-l-none bg-ava-accent hover:bg-red-700"
                size="md"
              >
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 AVA Skincare. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-gray-400 hover:text-white text-sm">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-white text-sm">
              Terms of Service
            </Link>
            <Link href="/cookies" className="text-gray-400 hover:text-white text-sm">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )

  return (
    <div className={`min-h-screen flex flex-col bg-white ${className}`}>
      {shouldShowNavigation && renderHeader()}
      
      <main className="flex-1 bg-white">
        {children}
      </main>
      
      {shouldShowFooter && renderFooter()}
    </div>
  )
}

export default Layout
