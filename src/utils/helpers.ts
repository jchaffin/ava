import { CURRENCY, DATE_FORMATS, REGEX_PATTERNS } from './constants'
import path from 'path';


// Price Formatting
export const formatPrice = (
  price: number,
  currency: string = CURRENCY.CODE,
  locale: string = CURRENCY.LOCALE
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price)
}

export const getSubDir = (image: string): string => {
  return path.basename(path.dirname(image));
}

// Number Formatting
export const formatNumber = (
  number: number,
  locale: string = CURRENCY.LOCALE,
  options?: Intl.NumberFormatOptions
): string => {
  return new Intl.NumberFormat(locale, options).format(number)
}

// Percentage Formatting
export const formatPercentage = (
  value: number,
  locale: string = CURRENCY.LOCALE,
  decimals: number = 1
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100)
}

// Date Formatting
export const formatDate = (
  date: Date | string | number,
  format: string = DATE_FORMATS.DISPLAY,
  locale: string = 'en-US'
): string => {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date

  if (format === DATE_FORMATS.RELATIVE) {
    return formatDistanceToNow(dateObj)
  }

  // Basic date formatting - in a real app, use date-fns or similar
  const options: Intl.DateTimeFormatOptions = {}
  
  switch (format) {
    case DATE_FORMATS.DISPLAY:
      options.year = 'numeric'
      options.month = 'short'
      options.day = '2-digit'
      break
    case DATE_FORMATS.DATETIME:
      options.year = 'numeric'
      options.month = 'short'
      options.day = '2-digit'
      options.hour = '2-digit'
      options.minute = '2-digit'
      break
    default:
      options.year = 'numeric'
      options.month = 'short'
      options.day = '2-digit'
  }

  return new Intl.DateTimeFormat(locale, options).format(dateObj)
}

// Relative Time Formatting
export const formatDistanceToNow = (date: Date): string => {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`
  return `${Math.floor(diffInSeconds / 31536000)} years ago`
}

// String Utilities
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export const capitalizeWords = (str: string): string => {
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  )
}

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

export const truncate = (text: string, length: number = 100, suffix: string = '...'): string => {
  if (text.length <= length) return text
  return text.slice(0, length).trim() + suffix
}

export const stripHtml = (html: string): string => {
  return html.replace(/<[^>]*>/g, '')
}

// Validation Utilities
export const isValidEmail = (email: string): boolean => {
  return REGEX_PATTERNS.EMAIL.test(email)
}

export const isValidPassword = (password: string): boolean => {
  return REGEX_PATTERNS.PASSWORD.test(password)
}

export const isValidUrl = (url: string): boolean => {
  return REGEX_PATTERNS.URL.test(url)
}

export const isValidPhone = (phone: string): boolean => {
  return REGEX_PATTERNS.PHONE.test(phone)
}

// Password Strength Calculation
export const calculatePasswordStrength = (password: string): {
  score: number
  feedback: string[]
  strength: 'weak' | 'fair' | 'good' | 'strong'
} => {
  let score = 0
  const feedback: string[] = []

  if (password.length >= 8) score += 1
  else feedback.push('at least 8 characters')

  if (/[a-z]/.test(password)) score += 1
  else feedback.push('one lowercase letter')

  if (/[A-Z]/.test(password)) score += 1
  else feedback.push('one uppercase letter')

  if (/\d/.test(password)) score += 1
  else feedback.push('one number')

  if (/[^A-Za-z0-9]/.test(password)) score += 1
  else feedback.push('one special character')

  const strength = score <= 1 ? 'weak' : score <= 2 ? 'fair' : score <= 3 ? 'good' : 'strong'

  return { score, feedback, strength }
}

// Array Utilities
export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

export const shuffle = <T>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export const unique = <T>(array: T[]): T[] => {
  return Array.from(new Set(array))
}

export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key])
    groups[groupKey] = groups[groupKey] || []
    groups[groupKey].push(item)
    return groups
  }, {} as Record<string, T[]>)
}

// Object Utilities
export const pick = <T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
  const result = {} as Pick<T, K>
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key]
    }
  })
  return result
}

export const omit = <T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
  const result = { ...obj }
  keys.forEach((key) => {
    delete result[key]
  })
  return result
}

export const isEmpty = (value: any): boolean => {
  if (value == null) return true
  if (Array.isArray(value) || typeof value === 'string') return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

// URL and Query Utilities
export const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach((v) => searchParams.append(key, String(v)))
      } else {
        searchParams.append(key, String(value))
      }
    }
  })
  
  return searchParams.toString()
}

export const parseQueryString = (queryString: string): Record<string, string | string[]> => {
  const params = new URLSearchParams(queryString)
  const result: Record<string, string | string[]> = {}
  
  const entries = Array.from(params.entries())
  for (const [key, value] of entries) {
    if (result[key]) {
      if (Array.isArray(result[key])) {
        (result[key] as string[]).push(value)
      } else {
        result[key] = [result[key] as string, value]
      }
    } else {
      result[key] = value
    }
  }
  
  return result
}

// Local Storage Utilities
export const storage = {
  get: <T>(key: string, defaultValue?: T): T | null => {
    if (typeof window === 'undefined') return defaultValue || null
    
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue || null
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error)
      return defaultValue || null
    }
  },

  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error)
    }
  },

  remove: (key: string): void => {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  },

  clear: (): void => {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.clear()
    } catch (error) {
      console.error('Error clearing localStorage:', error)
    }
  },
}

// Cookie Utilities
export const cookies = {
  get: (name: string): string | null => {
    if (typeof document === 'undefined') return null
    
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null
    }
    return null
  },

  set: (name: string, value: string, days: number = 7): void => {
    if (typeof document === 'undefined') return
    
    const expires = new Date()
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`
  },

  remove: (name: string): void => {
    if (typeof document === 'undefined') return
    
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`
  },
}

// Debounce Utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

// Throttle Utility
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0
  
  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      func(...args)
    }
  }
}

// Random Utilities
export const generateId = (length: number = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export const randomBetween = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Color Utilities
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

export const rgbToHex = (r: number, g: number, b: number): string => {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

// File Size Formatting
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Error Handling Utilities
export const createErrorHandler = (context: string) => {
  return (error: any) => {
    console.error(`Error in ${context}:`, error)
    
    // In a real app, you might want to send this to an error tracking service
    // like Sentry, LogRocket, etc.
  }
}

export const isNetworkError = (error: any): boolean => {
  return (
    error instanceof TypeError &&
    error.message.includes('fetch')
  ) || error.code === 'NETWORK_ERROR'
}

// Analytics Utilities
export const trackEvent = (eventName: string, properties?: Record<string, any>): void => {
  // In a real app, integrate with analytics service like Google Analytics, Mixpanel, etc.
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, properties)
  }
  
  console.log('Analytics Event:', eventName, properties)
}

// Performance Utilities
export const measurePerformance = <T>(
  name: string,
  fn: () => T
): T => {
  const start = performance.now()
  const result = fn()
  const end = performance.now()
  
  console.log(`${name} took ${end - start} milliseconds`)
  return result
}

// Type Guards
export const isString = (value: any): value is string => {
  return typeof value === 'string'
}

export const isNumber = (value: any): value is number => {
  return typeof value === 'number' && !isNaN(value)
}

export const isBoolean = (value: any): value is boolean => {
  return typeof value === 'boolean'
}

export const isObject = (value: any): value is object => {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export const isArray = <T>(value: any): value is T[] => {
  return Array.isArray(value)
}

/**
 * Removes duplicate images from an array while preserving order
 * @param images - Array of image URLs
 * @returns Array with duplicates removed
 */
export const deduplicateImages = (images: string[]): string[] => {
  if (!Array.isArray(images)) return []
  return Array.from(new Set(images)).filter(Boolean)
}

/**
 * Validates and cleans an image array
 * @param images - Array of image URLs
 * @returns Cleaned array with duplicates removed and invalid entries filtered
 */
export const validateImageArray = (images: string[]): string[] => {
  if (!Array.isArray(images)) return []
  
  // Remove duplicates and filter out empty/invalid entries
  const cleaned = Array.from(new Set(images))
    .filter(img => img && typeof img === 'string' && img.trim().length > 0)
    .map(img => img.trim())
  
  return cleaned
}

/**
 * Adds an image to an array if it doesn't already exist
 * @param images - Current array of images
 * @param newImage - New image URL to add
 * @returns Updated array with new image (if not duplicate)
 */
export const addImageIfNotExists = (images: string[], newImage: string): string[] => {
  if (!newImage || typeof newImage !== 'string' || newImage.trim().length === 0) {
    return images
  }
  
  const trimmedImage = newImage.trim()
  if (images.includes(trimmedImage)) {
    return images // Image already exists
  }
  
  return [...images, trimmedImage]
}

/**
 * Manages product image keys for admin interface
 * Ensures no duplicates and maintains proper array structure
 * @param currentKeys - Current array of image keys
 * @param newKey - New key to add (optional)
 * @param maxImages - Maximum number of images allowed (default: 4)
 * @returns Cleaned and validated array of image keys
 */
export const manageProductImageKeys = (
  currentKeys: string[], 
  newKey?: string, 
  maxImages: number = 4
): string[] => {
  // Start with current keys, removing duplicates
  let keys = validateImageArray(currentKeys)
  
  // Add new key if provided and not already present
  if (newKey && !keys.includes(newKey.trim())) {
    keys.push(newKey.trim())
  }
  
  // Limit to maxImages
  keys = keys.slice(0, maxImages)
  
  // Pad with empty strings if needed
  while (keys.length < maxImages) {
    keys.push('')
  }
  
  return keys
}

/**
 * Validates and cleans image keys
 * @param keys - Array of image keys or URLs
 * @returns Cleaned array of valid image keys
 */
export const validateImageKeys = (keys: string[]): string[] => {
  if (!Array.isArray(keys)) return []
  
  return Array.from(new Set(keys))
    .filter(key => key && typeof key === 'string' && key.trim().length > 0)
    .map(key => key.trim())
    .filter(key => {
      // Basic key validation (no spaces, valid characters)
      return /^[a-zA-Z0-9\/\-_\.]+$/.test(key) || key.includes('http')
    })
}

/**
 * Extracts the base filename from a URL or key
 * @param imageString - URL, key, or filename
 * @returns Base filename (e.g., "3.jpg" from "https://example.com/images/3.jpg")
 */
export const extractBaseFilename = (imageString: string): string => {
  if (!imageString || typeof imageString !== 'string') return ''
  
  const trimmed = imageString.trim()
  
  // If it's already a simple filename, return it
  if (!trimmed.includes('/') && !trimmed.includes('http')) {
    return trimmed
  }
  
  // If it's a URL, extract the filename from the path
  if (trimmed.includes('http')) {
    try {
      const url = new URL(trimmed)
      const pathname = url.pathname
      // Get the last part of the path (filename)
      const filename = pathname.split('/').pop()
      return filename || trimmed
    } catch (error) {
      // If URL parsing fails, try to extract filename manually
      const match = trimmed.match(/[^\/]+\.(jpg|jpeg|png|gif|webp|svg)$/i)
      return match ? match[0] : trimmed
    }
  }
  
  // If it's a path-like string, get the filename
  if (trimmed.includes('/')) {
    return trimmed.split('/').pop() || trimmed
  }
  
  return trimmed
}

/**
 * Deduplicates image arrays that may contain mixed formats (filenames and URLs)
 * @param images - Array of image strings (filenames, keys, or URLs)
 * @returns Deduplicated array, preferring URLs over filenames when duplicates exist
 */
export const deduplicateMixedImages = (images: string[]): string[] => {
  if (!Array.isArray(images)) return []
  
  const filenameMap = new Map<string, string>()
  
  // Process each image and group by base filename
  images.forEach(image => {
    if (!image || typeof image !== 'string' || image.trim().length === 0) return
    
    const baseFilename = extractBaseFilename(image)
    const trimmedImage = image.trim()
    
    // If we haven't seen this filename before, or if this is a URL and the existing one isn't
    if (!filenameMap.has(baseFilename) || 
        (trimmedImage.includes('http') && !filenameMap.get(baseFilename)?.includes('http'))) {
      filenameMap.set(baseFilename, trimmedImage)
    }
  })
  
  return Array.from(filenameMap.values())
}

/**
 * Test function to verify deduplication works with mixed image arrays
 * @param testArray - Array to test
 * @returns Object with original and deduplicated arrays
 */
export const testDeduplication = (testArray: string[]) => {
  console.log('Testing deduplication with:', testArray)
  
  const deduplicated = deduplicateMixedImages(testArray)
  
  console.log('Original array:', testArray)
  console.log('Deduplicated array:', deduplicated)
  
  return {
    original: testArray,
    deduplicated: deduplicated,
    removedCount: testArray.length - deduplicated.length
  }
}

/**
 * Convert a product image field to a proper local URL
 * Handles cases where the image is just a filename (e.g., "0.jpg") or a full path
 * Serves images from the local public/images directory
 */
export function getProductImageUrl(image: string, productId?: string): string {
  if (!image) return ''
  
  let url = ''
  
  // If it's already a full URL, use it (for external images)
  if (image.startsWith('http')) {
    url = image
  } else if (image.startsWith('products/')) {
    // If it's a local storage key, convert to URL
    const parts = image.split('/')
    if (parts.length >= 3) {
      const productId = parts[1]
      const filename = parts[2]
      url = `/images/products/${productId}/${filename}`
    } else {
      url = image
    }
  } else if (image.match(/^\d+\.jpg$/) && productId) {
    // If it's just a filename like "0.jpg" and we have a productId, construct the local path
    url = `/images/products/${productId}/${image}`
  } else if (image.includes('/')) {
    // If it's a path, assume it's already a local path
    url = image.startsWith('/') ? image : `/${image}`
  } else {
    // Otherwise, assume it's a filename and construct the path
    url = `/images/products/${image}`
  }
  
  return url
}

