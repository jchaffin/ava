/**
 * Client-safe local storage utilities
 * These functions can be safely used on the client side without Node.js dependencies
 */

/**
 * Convert a local storage key to a URL
 */
export function localKeyToUrl(key: string): string {
  if (!key) return ''
  
  // If it's already a URL, return as is
  if (key.startsWith('http://') || key.startsWith('https://') || key.startsWith('/')) {
    return key
  }
  
  // Convert key to URL format
  if (key.startsWith('products/')) {
    // Product images: products/productId/filename -> /images/products/productId/filename
    return `/${key.replace('products/', 'images/products/')}`
  } else {
    // Other uploads: folder/filename -> /uploads/folder/filename
    return `/uploads/${key}`
  }
}

/**
 * Check if a string is a local storage key
 */
export function isLocalKey(str: string): boolean {
  if (!str) return false
  
  // Check if it's a local storage key format (not a full URL)
  return !str.startsWith('http://') && 
         !str.startsWith('https://') && 
         !str.startsWith('/') &&
         (str.includes('/') || str.includes('.'))
}

/**
 * Extract key from a local URL
 */
export function extractKeyFromLocalUrl(url: string): string | null {
  if (!url) return null
  
  // Remove leading slash
  const cleanUrl = url.startsWith('/') ? url.slice(1) : url
  
  // Convert back to key format
  if (cleanUrl.startsWith('images/products/')) {
    // /images/products/productId/filename -> products/productId/filename
    return cleanUrl.replace('images/products/', 'products/')
  } else if (cleanUrl.startsWith('uploads/')) {
    // /uploads/folder/filename -> folder/filename
    return cleanUrl.replace('uploads/', '')
  }
  
  return null
}

/**
 * Check if a URL is a local storage URL
 */
export function isLocalUrl(url: string): boolean {
  if (!url) return false
  return url.startsWith('/images/') || url.startsWith('/uploads/')
}

/**
 * Get the file extension from a key or URL
 */
export function getFileExtension(keyOrUrl: string): string {
  if (!keyOrUrl) return ''
  
  const lastDotIndex = keyOrUrl.lastIndexOf('.')
  if (lastDotIndex === -1) return ''
  
  return keyOrUrl.slice(lastDotIndex + 1).toLowerCase()
}

/**
 * Get the filename from a key or URL
 */
export function getFilename(keyOrUrl: string): string {
  if (!keyOrUrl) return ''
  
  const parts = keyOrUrl.split('/')
  return parts[parts.length - 1] || ''
} 