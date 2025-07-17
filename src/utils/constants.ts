// Product Categories
export const CATEGORIES = [
  'Beauty',
] as const

export type Category = typeof CATEGORIES[number]

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const

export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS]

// Payment Methods
export const PAYMENT_METHODS = {
  CARD: 'card',
  PAYPAL: 'paypal',
  BANK_TRANSFER: 'bank_transfer',
  APPLE_PAY: 'apple_pay',
  GOOGLE_PAY: 'google_pay',
} as const

export type PaymentMethod = typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS]

// User Roles
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
} as const

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES]

// Price Ranges for Filtering
export const PRICE_RANGES = [
  { label: 'All Prices', min: 0, max: Infinity, value: 'all' },
  { label: 'Under $25', min: 0, max: 25, value: 'under-25' },
  { label: '$25 - $50', min: 25, max: 50, value: '25-50' },
  { label: '$50 - $100', min: 50, max: 100, value: '50-100' },
  { label: '$100 - $500', min: 100, max: 500, value: '100-500' },
  { label: 'Over $500', min: 500, max: Infinity, value: 'over-500' },
] as const

// Sort Options
export const SORT_OPTIONS = [
  { label: 'Newest First', value: 'createdAt-desc' },
  { label: 'Oldest First', value: 'createdAt-asc' },
  { label: 'Name: A to Z', value: 'name-asc' },
  { label: 'Name: Z to A', value: 'name-desc' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Featured First', value: 'featured-desc' },
  { label: 'Best Rating', value: 'rating-desc' },
  { label: 'Most Reviews', value: 'reviews-desc' },
] as const

// Currency Configuration
export const CURRENCY = {
  CODE: 'USD',
  SYMBOL: '$',
  LOCALE: 'en-US',
} as const

// Shipping Configuration
export const SHIPPING = {
  FREE_SHIPPING_THRESHOLD: 100,
  STANDARD_SHIPPING_COST: 10,
  EXPRESS_SHIPPING_COST: 25,
  INTERNATIONAL_SHIPPING_COST: 50,
} as const

// Tax Configuration
export const TAX = {
  DEFAULT_RATE: 0.1, // 10%
  RATES_BY_STATE: {
    CA: 0.0875, // California
    NY: 0.08, // New York
    TX: 0.0625, // Texas
    FL: 0.06, // Florida
    WA: 0.065, // Washington
  },
} as const

// Pagination Configuration
export const PAGINATION = {
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 50,
  MIN_LIMIT: 1,
} as const

// Image Configuration
export const IMAGES = {
  PLACEHOLDER: '/placeholder.jpg',
  FALLBACK: '/fallback.jpg',
  QUALITY: 80,
  SIZES: {
    THUMBNAIL: { width: 150, height: 150 },
    SMALL: { width: 300, height: 300 },
    MEDIUM: { width: 600, height: 600 },
    LARGE: { width: 1200, height: 1200 },
  },
} as const

// API Configuration
export const API = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || '',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const

// Validation Rules
export const VALIDATION = {
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: false,
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
  },
  PRODUCT: {
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 100,
    DESCRIPTION_MIN_LENGTH: 10,
    DESCRIPTION_MAX_LENGTH: 2000,
    MAX_PRICE: 999999.99,
    MAX_STOCK: 999999,
  },
  EMAIL: {
    MAX_LENGTH: 254,
  },
} as const

// Feature Flags
export const FEATURES = {
  WISHLIST: true,
  REVIEWS: true,
  SOCIAL_LOGIN: true,
  GUEST_CHECKOUT: true,
  LIVE_CHAT: false,
  ANALYTICS: true,
  PUSH_NOTIFICATIONS: false,
} as const

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access forbidden.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'An unexpected error occurred. Please try again later.',
  RATE_LIMIT: 'Too many requests. Please try again later.',
  MAINTENANCE: 'The service is temporarily unavailable for maintenance.',
} as const

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Welcome back!',
  LOGOUT: 'You have been logged out successfully.',
  REGISTER: 'Account created successfully!',
  PROFILE_UPDATED: 'Profile updated successfully.',
  PASSWORD_CHANGED: 'Password changed successfully.',
  PRODUCT_ADDED: 'Product added to cart!',
  PRODUCT_REMOVED: 'Product removed from cart.',
  ORDER_PLACED: 'Order placed successfully!',
  WISHLIST_ADDED: 'Added to wishlist.',
  WISHLIST_REMOVED: 'Removed from wishlist.',
} as const

// Local Storage Keys
export const STORAGE_KEYS = {
  CART: 'ecommerce_cart',
  WISHLIST: 'ecommerce_wishlist',
  USER_PREFERENCES: 'ecommerce_preferences',
  RECENT_SEARCHES: 'ecommerce_recent_searches',
  VIEWED_PRODUCTS: 'ecommerce_viewed_products',
} as const

// Cookie Names
export const COOKIE_NAMES = {
  SESSION: 'next-auth.session-token',
  CSRF: 'next-auth.csrf-token',
  PREFERENCES: 'user-preferences',
  ANALYTICS: 'analytics-consent',
} as const

// Regular Expressions
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  PHONE: /^\+?[\d\s\-\(\)]+$/,
  POSTAL_CODE: /^\d{5}(-\d{4})?$/, // US ZIP code
  CREDIT_CARD: /^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
} as const

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  INPUT: 'yyyy-MM-dd',
  DATETIME: 'MMM dd, yyyy HH:mm',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
  RELATIVE: 'relative', // for date-fns formatDistanceToNow
} as const

// Theme Configuration
export const THEME = {
  COLORS: {
    PRIMARY: '#3B82F6', // blue-500
    SECONDARY: '#6B7280', // gray-500
    SUCCESS: '#10B981', // green-500
    WARNING: '#F59E0B', // yellow-500
    DANGER: '#EF4444', // red-500
    INFO: '#06B6D4', // cyan-500
  },
  BREAKPOINTS: {
    SM: '640px',
    MD: '768px',
    LG: '1024px',
    XL: '1280px',
    '2XL': '1536px',
  },
} as const

// Animation Durations
export const ANIMATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  EXTRA_SLOW: 1000,
} as const

// Default Values
export const DEFAULTS = {
  AVATAR: '/default-avatar.png',
  PRODUCT_IMAGE: '/default-product.png',
  ITEMS_PER_PAGE: 12,
  SEARCH_DEBOUNCE: 300,
  TOAST_DURATION: 5000,
  SESSION_TIMEOUT: 30 * 24 * 60 * 60 * 1000, // 30 days
} as const

