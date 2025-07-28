'use client'

import React, { useState, useEffect, ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
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
  SparklesIcon,
  CubeIcon,
} from '@heroicons/react/24/outline'
import { ShoppingCartIcon as ShoppingCartSolidIcon } from '@heroicons/react/24/solid'

import toast from 'react-hot-toast'
import ThemeToggle from './ThemeToggle'

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
  
  // Automatically hide navigation and footer for admin routes
  const isAdminRoute = pathname.startsWith('/admin')
  const shouldShowNavigation = showNavigation && !isAdminRoute
  const shouldShowFooter = showFooter && !isAdminRoute

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const [userMenu, setUserMenu] = useState<UserMenuState>({
    isOpen: false,
  })

  const [isDarkMode, setIsDarkMode] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [siteSettings, setSiteSettings] = useState<{
    general: {
      socialMedia: {
        facebook: string
        instagram: string
        twitter: string
        youtube: string
        tiktok: string
        amazonShop: string
      }
    }
  } | null>(null)

  // Check for dark mode on mount and when theme changes
  useEffect(() => {
    setMounted(true)
    
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains('dark')
      setIsDarkMode(isDark)
    }

    checkTheme()

    // Listen for theme changes
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => observer.disconnect()
  }, [])

  // Fetch site settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings')
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data) {
            setSiteSettings(data.data)
          }
        }
      } catch (error) {
        console.error('Error fetching site settings:', error)
      }
    }

    fetchSettings()
  }, [])



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
      name: 'Skin Analysis',
      href: '/skin-analysis',
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
      name: 'Skin Analysis History',
      href: '/dashboard/skin-analysis',
      icon: SparklesIcon,
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
    setIsMobileMenuOpen(false)
    setUserMenu({ isOpen: false })
  }, [pathname])

  // Debug mobile menu state changes
  useEffect(() => {
    console.log('Mobile menu state changed:', isMobileMenuOpen)
  }, [isMobileMenuOpen])

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      
      // Only close mobile menu if clicking outside the mobile menu area
      if (!target.closest('[data-menu="mobile"]') && !target.closest('[data-mobile-menu-button]')) {
        setIsMobileMenuOpen(false)
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
      <div className="min-h-screen flex flex-col bg-theme-primary" suppressHydrationWarning>
        <header className="bg-theme-secondary shadow-sm border-b border-theme sticky top-0 z-40">
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
            <p className="text-theme-secondary">Loading...</p>
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
    setIsMobileMenuOpen((prev) => !prev)
  }



  const isActiveLink = (href: string): boolean => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  const renderDesktopNavigation = () => (
    <nav className="hidden lg:flex items-center space-x-24">
      {navigationItems.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={`flex items-center space-x-1 px-3 py-2 text-theme-primary rounded-md text-sm font-medium transition-colors duration-200 whitespace-nowrap focus:outline-none focus:ring-0 focus:border-0 ${
            isActiveLink(item.href)
              ? 'text-theme-primary bg-ava-accent'
              : 'text-theme-primary hover:text-ava-accent hover:bg-theme-secondary'
          }`}
        >
          {item.icon && <item.icon className="w-4 h-4 flex-shrink-0" />}
          <span className="flex-shrink-0">{item.name}</span>
        </Link>
      ))}
    </nav>
  )

  const renderMobileNavigation = () => (
    <>
      {/* Backdrop */}
      <div 
        className={`lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300 z-[9998] ${
          isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
        style={{ touchAction: 'none' }}
      />
      
      {/* Sidebar */}
      <div className={`lg:hidden fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-theme-secondary shadow-2xl transform transition-all duration-300 ease-out z-[9999] ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-theme">
          <div className="flex-1"></div>
          <Link href="/" className="flex items-center justify-center flex-1" onClick={() => setIsMobileMenuOpen(false)}>
            {mounted && (
              <Image
                src={isDarkMode ? "/images/logos/logo_dark.png" : "/images/logos/logo.png"}
                alt="AVA Logo"
                width={400}
                height={134}
                className="h-16 w-auto"
                priority
              />
            )}
          </Link>
          <div className="flex-1 flex justify-end">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-full bg-theme-secondary text-theme-primary hover:bg-theme-tertiary hover:text-theme-primary transition-all duration-200 cursor-pointer"
              aria-label="Close menu"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-6">
            <div className="space-y-1">
              {navigationItems.map((item, index) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-4 px-4 py-4 rounded-xl text-base font-medium transition-all duration-200 transform hover:scale-[1.02] cursor-pointer focus:outline-none focus:ring-0 focus:border-0 min-h-[44px] ${
                    isActiveLink(item.href)
                      ? 'text-theme-tertiary bg-ava-accent'
                      : 'text-theme-primary hover:text-ava-accent hover:bg-theme-secondary'
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {item.icon && <item.icon className="w-5 h-5 flex-shrink-0" />}
                  <span className="flex-1">{item.name}</span>
                  {isActiveLink(item.href) && (
                    <div className="w-2 h-2 bg-ava-accent rounded-full"></div>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* User Section */}
          {isAuthenticated ? (
            <div className="px-4 py-6 border-t border-theme">
              {/* User Info */}
               <div className="mb-6 p-4 bg-theme-primary text-theme-secondary rounded-xl border border-theme">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-theme-secondary rounded-full flex items-center justify-center">                   <span className="text-theme-primary font-semibold text-sm">
                      {user?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-theme-primary truncate">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user?.email || ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* User Menu Items */}
              <div className="space-y-1">
                {(hasRole('admin') ? adminMenuItems : userMenuItems)
                  .filter(item => !item.requireAuth || isAuthenticated)
                  .filter(item => !item.adminOnly || hasRole('admin'))
                  .filter(item => !item.userOnly || !hasRole('admin'))
                  .map((item, index) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-4 px-4 py-3 rounded-xl text-sm font-medium text-theme-primary hover:text-theme-primary hover:bg-theme-tertiary transition-all duration-200"
                    >
                      {item.icon && <item.icon className="w-4 h-4 flex-shrink-0" />}
                      <span className="flex-1">{item.name}</span>
                    </Link>
                  ))}
                
                {/* Sign Out Button */}
                <button
                  onClick={() => {
                    handleSignOut()
                    setIsMobileMenuOpen(false)
                  }}
                  className="flex items-center space-x-4 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 w-full transition-all duration-200 mt-4"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1 text-left">Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="px-4 py-6 border-t border-theme">
              <div className="space-y-3">
                <Link
                  href="/signin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center w-full px-4 py-3 text-base font-medium text-theme-secondary bg-theme-primary hover:bg-theme-secondary hover:text-theme-primary rounded-xl transition-all duration-200 min-h-[44px]"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center w-full px-4 py-3 text-base font-medium text-theme-secondary bg-theme-primary hover:bg-theme-secondary hover:text-theme-primary rounded-xl transition-all duration-200 min-h-[44px]"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-theme">
          <div className="text-center">
            <p className="text-xs text-theme-muted">
              AVA Premium Skincare
            </p>
            <p className="text-xs text-theme-muted mt-1">
              Transform your skin journey
            </p>
          </div>
        </div>
      </div>
    </>
  )

  const renderUserMenu = () => (
    <div className="relative" data-menu="user">
      <button
        onClick={() => setUserMenu(prev => ({ isOpen: !prev.isOpen }))}
        className="flex items-center space-x-2 p-2 rounded-lg text-theme-primary hover:text-theme-primary hover:bg-theme-tertiary transition-colors duration-200"
      >
        <div className="w-8 h-8 bg-theme-primary rounded-full flex items-center justify-center">
          <UserIcon className="w-4 h-4 text-theme-secondary" />
        </div>
        <span className="hidden md:block text-sm font-medium text-theme-primary">{user?.name || 'User'}</span>
        <ChevronDownIcon className="w-4 h-4 text-theme-primary" />
      </button>

      {userMenu.isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-theme-tertiary rounded-lg shadow-xl border border-theme py-2 z-50">
          <div className="px-4 py-3 border-b border-theme">
            <p className="text-sm font-medium text-theme-primary">{user?.name || 'User'}</p>
            <p className="text-sm text-theme-muted">{user?.email || ''}</p>
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
                  className="flex items-center space-x-3 px-4 py-3 text-sm text-theme-primary hover:text-theme-primary hover:bg-theme-tertiary transition-colors duration-200"
                >
                  {item.icon && <item.icon className="w-4 h-4" />}
                  <span>{item.name}</span>
                </Link>
              ))}
          </div>
          
          <div className="border-t border-theme pt-2">
            <button
              onClick={() => {
                handleSignOut()
                setUserMenu({ isOpen: false })
              }}
              className="flex items-center space-x-3 px-4 py-3 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 w-full transition-colors duration-200"
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
    <header className="bg-theme-secondary shadow-sm border-b border-theme sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Mobile menu button */}
          <div className="lg:hidden" data-mobile-menu-button>
            <button
              onClick={() => {
                toggleMobileMenu()
              }}
              className="p-3 rounded-lg text-theme-primary hover:text-ava-accent hover:bg-theme-secondary transition-colors duration-200 touch-manipulation"
              aria-label="Open mobile menu"
              type="button"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
          </div>

          {/* Center - Logo (larger and centered) */}
          <div className="flex-1 flex justify-center">
            <Link href="/" className="hidden md:flex items-center">
              {mounted && (
                <Image
                  src={isDarkMode ? "/images/logos/logo_dark.png" : "/images/logos/logo.png"}
                  alt="AVA Logo"
                  width={240}
                  height={80}
                  className="h-16 w-auto"
                  priority
                />
              )}
            </Link>
          </div>

          {/* Right side - Desktop navigation and actions */}
          <div className="hidden lg:flex items-center space-x-8">
            {renderDesktopNavigation()}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-6">
            {/* Theme toggle button */}
            <ThemeToggle />
            {/* Wishlist - only show for regular users */}
            {isAuthenticated && !hasRole('admin') && (
              <Link href="/wishlist" className="hidden lg:inline-flex p-2 text-theme-secondary hover:text-ava-accent hover:bg-theme-secondary rounded-lg transition-colors duration-200 focus:outline-none focus:ring-0 focus:border-0">
                <HeartIcon className="w-5 h-5" />
              </Link>
            )}

            {/* Shopping cart */}
            <Link href="/cart" className="relative p-2 text-theme-secondary hover:text-ava-accent hover:bg-theme-secondary rounded-lg transition-colors duration-200 focus:outline-none focus:ring-0 focus:border-0">
              {getTotalItems() > 0 ? (
                <ShoppingCartSolidIcon className="w-5 h-5" />
              ) : (
                <ShoppingCartIcon className="w-5 h-5" />
              )}
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-ava-accent text-theme-primary text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {getTotalItems() > 9 ? '9+' : getTotalItems()}
                </span>
              )}
            </Link>

            {/* User menu or sign in */}
            {isAuthenticated ? (
              renderUserMenu()
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/signin"
                  className="text-theme-primary hover:text-ava-accent px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-0 focus:border-0"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-ava-accent text-theme-primary px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-0 focus:border-0"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile navigation overlay */}
      {renderMobileNavigation()}
    </header>
  )

  const renderFooter = () => (
    <footer className="bg-ava-black text-theme-primary">
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
              {siteSettings?.general.socialMedia.instagram && (
                <a href={siteSettings.general.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-theme-primary transition-colors duration-200">
                  <span className="sr-only">Instagram</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              )}
              {siteSettings?.general.socialMedia.facebook && (
                <a href={siteSettings.general.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-theme-primary transition-colors duration-200">
                  <span className="sr-only">Facebook</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              )}
              {siteSettings?.general.socialMedia.youtube && (
                <a href={siteSettings.general.socialMedia.youtube} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-theme-primary transition-colors duration-200">
                  <span className="sr-only">YouTube</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              )}
              {siteSettings?.general.socialMedia.tiktok && (
                <a href={siteSettings.general.socialMedia.tiktok} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-theme-primary transition-colors duration-200">
                  <span className="sr-only">TikTok</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                  </svg>
                </a>
              )}
              {siteSettings?.general.socialMedia.amazonShop && (
                <a href={siteSettings.general.socialMedia.amazonShop} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-theme-primary transition-colors duration-200">
                  <span className="sr-only">Amazon Shop</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M15.93 18.35L14.56 19.72L13.17 18.33L15.93 18.35M12.86 15.28C11.1 13.54 10.25 12.12 10.25 11.12C10.25 9.85 11.36 8.74 12.63 8.74C13.12 8.74 13.57 8.87 13.97 9.12C14.37 9.37 14.7 9.72 14.95 10.15C15.2 9.72 15.53 9.37 15.93 9.12C16.33 8.87 16.78 8.74 17.27 8.74C18.54 8.74 19.65 9.85 19.65 11.12C19.65 12.12 18.8 13.54 17.04 15.28L15.93 16.39L14.82 15.28H12.86M10.25 15.28L8.86 16.67L7.47 15.28L10.25 15.28M5.93 18.35L4.56 19.72L3.17 18.33L5.93 18.35M2.86 15.28C1.1 13.54 0.25 12.12 0.25 11.12C0.25 9.85 1.36 8.74 2.63 8.74C3.12 8.74 3.57 8.87 3.97 9.12C4.37 9.37 4.7 9.72 4.95 10.15C5.2 9.72 5.53 9.37 5.93 9.12C6.33 8.87 6.78 8.74 7.27 8.74C8.54 8.74 9.65 9.85 9.65 11.12C9.65 12.12 8.8 13.54 7.04 15.28L5.93 16.39L4.82 15.28H2.86Z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-gray-400 hover:text-theme-primary transition-colors duration-200">About Us</Link></li>
              <li><Link href="/products" className="text-gray-400 hover:text-theme-primary transition-colors duration-200">Products</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-theme-primary transition-colors duration-200">Contact</Link></li>
              <li><Link href="/shipping" className="text-gray-400 hover:text-theme-primary transition-colors duration-200">Shipping Info</Link></li>
              <li><Link href="/returns" className="text-gray-400 hover:text-theme-primary transition-colors duration-200">Returns</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li><Link href="/faq" className="text-gray-400 hover:text-theme-primary transition-colors duration-200">FAQ</Link></li>
              <li><Link href="/support" className="text-gray-400 hover:text-theme-primary transition-colors duration-200">Support</Link></li>
              <li><Link href="/privacy" className="text-gray-400 hover:text-theme-primary transition-colors duration-200">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-theme-primary transition-colors duration-200">Terms of Service</Link></li>
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
                className="flex-1 px-4 py-3 bg-theme-tertiary text-theme-primary placeholder-theme-muted rounded-l-md focus:outline-none focus:ring-1 focus:ring-theme-primary border border-theme"
              />
              <Button
                type="submit"
                variant="primary"
                className="rounded-l-none"
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
            <Link href="/privacy" className="text-gray-400 hover:text-theme-primary text-sm">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-theme-primary text-sm">
              Terms of Service
            </Link>
            <Link href="/cookies" className="text-gray-400 hover:text-theme-primary text-sm">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )

  return (
    <div className={`min-h-screen flex flex-col bg-theme-primary ${className}`}>
      {shouldShowNavigation && renderHeader()}
      
      <main className="flex-1 bg-theme-primary">
        {children}
      </main>
      
      {shouldShowFooter && renderFooter()}
    </div>
  )
}

export default Layout
