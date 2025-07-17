'use client'

import React, { useState, useEffect, ReactNode } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useCart, useAuth } from '../context'
import { Button } from './ui'
import { 
  ShoppingCartIcon, 
  UserIcon, 
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  HeartIcon,
  BellIcon,
  ChevronDownIcon,
  HomeIcon,
  TagIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline'
import { ShoppingCartIcon as ShoppingCartSolidIcon } from '@heroicons/react/24/solid'
import { CATEGORIES } from '../utils/constants'
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
  icon?: React.ComponentType<any>
  children?: NavigationItem[]
  requireAuth?: boolean
  adminOnly?: boolean
}

interface MobileMenuState {
  isOpen: boolean
  activeSubmenu: string | null
}

interface UserMenuState {
  isOpen: boolean
}

interface SearchState {
  query: string
  isOpen: boolean
  suggestions: string[]
  loading: boolean
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  showNavigation = true, 
  showFooter = true,
  className = '' 
}) => {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const { getTotalItems, getTotalPrice } = useCart()
  const { hasRole } = useAuth()

  const [mobileMenu, setMobileMenu] = useState<MobileMenuState>({
    isOpen: false,
    activeSubmenu: null,
  })
  
  const [userMenu, setUserMenu] = useState<UserMenuState>({
    isOpen: false,
  })
  
  const [search, setSearch] = useState<SearchState>({
    query: '',
    isOpen: false,
    suggestions: [],
    loading: false,
  })

  const [notifications, setNotifications] = useState({
    count: 3, // This would come from API
    items: [] as any[],
  })

  // Navigation items configuration
  const navigationItems: NavigationItem[] = [
    {
      name: 'Home',
      href: '/',
      icon: HomeIcon,
    },
    {
      name: 'Products',
      href: '/products',
      children: CATEGORIES.map(category => ({
        name: category,
        href: `/products?category=${encodeURIComponent(category)}`,
      })),
    },
    {
      name: 'Categories',
      href: '/categories',
      icon: TagIcon,
      children: [
        { name: 'Electronics', href: '/products?category=Electronics' },
        { name: 'Clothing', href: '/products?category=Clothing' },
        { name: 'Books', href: '/products?category=Books' },
        { name: 'Home & Garden', href: '/products?category=Home%20%26%20Garden' },
        { name: 'Sports', href: '/products?category=Sports' },
        { name: 'Toys', href: '/products?category=Toys' },
      ],
    },
    {
      name: 'Deals',
      href: '/deals',
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

  // User menu items
  const userMenuItems: NavigationItem[] = [
    {
      name: 'My Profile',
      href: '/profile',
      icon: UserCircleIcon,
      requireAuth: true,
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
    {
      name: 'Admin Dashboard',
      href: '/admin',
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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!search.query.trim()) return

    router.push(`/search?q=${encodeURIComponent(search.query)}`)
    setSearch(prev => ({ ...prev, isOpen: false }))
  }

  const handleSearchInput = async (value: string) => {
    setSearch(prev => ({ ...prev, query: value }))

    if (value.length > 2) {
      setSearch(prev => ({ ...prev, loading: true }))
      
      try {
        // Simulate API call for search suggestions
        setTimeout(() => {
          setSearch(prev => ({
            ...prev,
            suggestions: [
              `${value} products`,
              `${value} electronics`,
              `${value} clothing`,
            ],
            loading: false,
          }))
        }, 300)
      } catch (error) {
        setSearch(prev => ({ ...prev, loading: false }))
      }
    } else {
      setSearch(prev => ({ ...prev, suggestions: [] }))
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false })
      toast.success('Signed out successfully')
      router.push('/')
    } catch (error) {
      toast.error('Error signing out')
    }
  }

  const toggleMobileMenu = () => {
    setMobileMenu(prev => ({ 
      ...prev, 
      isOpen: !prev.isOpen,
      activeSubmenu: null,
    }))
  }

  const toggleSubmenu = (menuName: string) => {
    setMobileMenu(prev => ({
      ...prev,
      activeSubmenu: prev.activeSubmenu === menuName ? null : menuName,
    }))
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
        <div key={item.name} className="relative group">
          <Link
            href={item.href}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActiveLink(item.href)
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
            }`}
          >
            {item.icon && <item.icon className="w-4 h-4 mr-2" />}
            {item.name}
            {item.children && (
              <ChevronDownIcon className="w-4 h-4 ml-1 transition-transform group-hover:rotate-180" />
            )}
          </Link>

          {/* Dropdown menu */}
          {item.children && (
            <div className="absolute left-0 mt-2 w-56 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="py-2">
                {item.children.map((child) => (
                  <Link
                    key={child.name}
                    href={child.href}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                  >
                    {child.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </nav>
  )

  const renderMobileNavigation = () => (
    <div
      data-menu="mobile"
      className={`lg:hidden fixed inset-0 z-50 ${
        mobileMenu.isOpen ? 'block' : 'hidden'
      }`}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={toggleMobileMenu} />

      {/* Menu */}
      <div className="fixed inset-y-0 left-0 w-80 bg-white shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <Link href="/" className="text-xl font-bold text-gray-800">
            EcomStore
          </Link>
          <button onClick={toggleMobileMenu}>
            <XMarkIcon className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="overflow-y-auto h-full pb-20">
          {/* User section */}
          {session ? (
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{session.user.name}</p>
                  <p className="text-sm text-gray-600">{session.user.email}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 border-b">
              <Link
                href="/signin"
                className="block w-full text-center bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
              >
                Sign In
              </Link>
            </div>
          )}

          {/* Navigation items */}
          <div className="py-2">
            {navigationItems.map((item) => (
              <div key={item.name}>
                <div className="flex items-center justify-between">
                  <Link
                    href={item.href}
                    className={`flex-1 flex items-center px-4 py-3 text-sm font-medium ${
                      isActiveLink(item.href)
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {item.icon && <item.icon className="w-5 h-5 mr-3" />}
                    {item.name}
                  </Link>
                  {item.children && (
                    <button
                      onClick={() => toggleSubmenu(item.name)}
                      className="px-4 py-3"
                    >
                      <ChevronDownIcon
                        className={`w-4 h-4 transition-transform ${
                          mobileMenu.activeSubmenu === item.name ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  )}
                </div>

                {/* Submenu */}
                {item.children && mobileMenu.activeSubmenu === item.name && (
                  <div className="bg-gray-50">
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        href={child.href}
                        className="block px-8 py-2 text-sm text-gray-600 hover:text-blue-600"
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* User menu items */}
          {session && (
            <>
              <div className="border-t mt-4 pt-4">
                <div className="px-4 mb-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Account
                  </p>
                </div>
                {userMenuItems
                  .filter(item => !item.adminOnly || hasRole('admin'))
                  .map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      {item.icon && <item.icon className="w-5 h-5 mr-3" />}
                      {item.name}
                    </Link>
                  ))}
                
                <button
                  onClick={handleSignOut}
                  className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )

  const renderUserMenu = () => (
    <div data-menu="user" className="relative">
      <button
        onClick={() => setUserMenu(prev => ({ isOpen: !prev.isOpen }))}
        className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100"
      >
        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
          <UserIcon className="w-5 h-5 text-gray-600" />
        </div>
        <span className="hidden md:block text-sm font-medium text-gray-700">
          {session?.user.name}
        </span>
        <ChevronDownIcon className="w-4 h-4 text-gray-500" />
      </button>

      {userMenu.isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border z-50">
          <div className="py-2">
            {userMenuItems
              .filter(item => !item.adminOnly || hasRole('admin'))
              .map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {item.icon && <item.icon className="w-4 h-4 mr-3" />}
                  {item.name}
                </Link>
              ))}
            
            <hr className="my-2" />
            
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )

  const renderSearchBar = () => (
    <div className="relative flex-1 max-w-lg mx-4">
      <form onSubmit={handleSearch}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={search.query}
            onChange={(e) => handleSearchInput(e.target.value)}
            onFocus={() => setSearch(prev => ({ ...prev, isOpen: true }))}
            placeholder="Search products..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </form>

      {/* Search suggestions */}
      {search.isOpen && search.suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          {search.suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => {
                setSearch(prev => ({ ...prev, query: suggestion, isOpen: false }))
                router.push(`/search?q=${encodeURIComponent(suggestion)}`)
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  )

  const renderHeader = () => (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile menu button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-gray-800">EcomStore</span>
          </Link>

          {/* Desktop navigation */}
          {renderDesktopNavigation()}

          {/* Search bar */}
          <div className="hidden md:block flex-1 max-w-lg">
            {renderSearchBar()}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Search icon for mobile */}
            <button className="md:hidden p-2 text-gray-600 hover:text-gray-900">
              <MagnifyingGlassIcon className="w-6 h-6" />
            </button>

            {/* Notifications */}
            {session && (
              <Link href="/notifications" className="relative p-2 text-gray-600 hover:text-gray-900">
                <BellIcon className="w-6 h-6" />
                {notifications.count > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications.count > 9 ? '9+' : notifications.count}
                  </span>
                )}
              </Link>
            )}

            {/* Wishlist */}
            {session && (
              <Link href="/wishlist" className="p-2 text-gray-600 hover:text-gray-900">
                <HeartIcon className="w-6 h-6" />
              </Link>
            )}

            {/* Shopping cart */}
            <Link href="/cart" className="relative p-2 text-gray-600 hover:text-gray-900">
              {getTotalItems() > 0 ? (
                <ShoppingCartSolidIcon className="w-6 h-6 text-blue-600" />
              ) : (
                <ShoppingCartIcon className="w-6 h-6" />
              )}
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getTotalItems() > 9 ? '9+' : getTotalItems()}
                </span>
              )}
            </Link>

            {/* User menu or sign in */}
            {session ? (
              renderUserMenu()
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/signin"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="md:hidden pb-4">
          {renderSearchBar()}
        </div>
      </div>
    </header>
  )

  const renderFooter = () => (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">EcomStore</h3>
            <p className="text-gray-400 mb-4">
              Your one-stop shop for everything you need. Quality products, great prices, and excellent service.
            </p>
            <div className="flex space-x-4">
              {/* Social media links */}
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Facebook</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M20 10C20 4.477 15.523 0 10 0S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-gray-400 hover:text-white">About Us</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
              <li><Link href="/faq" className="text-gray-400 hover:text-white">FAQ</Link></li>
              <li><Link href="/shipping" className="text-gray-400 hover:text-white">Shipping Info</Link></li>
              <li><Link href="/returns" className="text-gray-400 hover:text-white">Returns</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              {CATEGORIES.slice(0, 5).map((category) => (
                <li key={category}>
                  <Link 
                    href={`/products?category=${encodeURIComponent(category)}`}
                    className="text-gray-400 hover:text-white"
                  >
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
            <p className="text-gray-400 mb-4">
              Subscribe to get special offers and updates.
            </p>
            <form className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-3 py-2 bg-gray-800 text-white placeholder-gray-400 border border-gray-700 rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <Button
                type="submit"
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
            © 2024 EcomStore. All rights reserved.
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
    <div className={`min-h-screen flex flex-col bg-gray-50 ${className}`}>
      {showNavigation && renderHeader()}
      {renderMobileNavigation()}
      
      <main className="flex-1">
        {children}
      </main>
      
      {showFooter && renderFooter()}
    </div>
  )
}

export default Layout
