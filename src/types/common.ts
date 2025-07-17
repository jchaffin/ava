// Base Entity Interface
export interface BaseEntity {
  _id: string
  createdAt: Date
  updatedAt: Date
}

// API Response Interfaces
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  errors?: ValidationError[]
}

export interface PaginatedResponse<T = any> {
  success: boolean
  data: T[]
  pagination: PaginationMetadata
  message?: string
}

export interface PaginationMetadata {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  hasNextPage: boolean
  hasPrevPage: boolean
  nextPage?: number
  prevPage?: number
}

// Query Parameters
export interface PaginationParams {
  page?: number
  limit?: number
}

export interface SortParams {
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface FilterParams {
  search?: string
  category?: string
  featured?: boolean
  inStock?: boolean
  minPrice?: number
  maxPrice?: number
}

export interface QueryParams extends PaginationParams, SortParams, FilterParams {
  [key: string]: any
}

// Error Handling
export interface ValidationError {
  field: string
  message: string
  code?: string
}

export interface ApiError {
  message: string
  code: string
  statusCode: number
  details?: any
}

// Form State Management
export interface FormState<T = any> {
  data: T
  errors: Record<string, string>
  isSubmitting: boolean
  isValid: boolean
  isDirty: boolean
  touched: Record<string, boolean>
}

export interface FormFieldState {
  value: any
  error?: string
  touched: boolean
  dirty: boolean
  valid: boolean
}

// Loading States
export interface LoadingState {
  isLoading: boolean
  isError: boolean
  error?: string | null
}

export interface AsyncState<T = any> extends LoadingState {
  data: T | null
  lastFetch?: Date
}

// UI States
export interface ModalState {
  isOpen: boolean
  title?: string
  content?: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closable?: boolean
}

export interface ToastState {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number
  dismissible?: boolean
}

export interface NotificationState {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: Date
  read: boolean
  actions?: NotificationAction[]
}

export interface NotificationAction {
  label: string
  action: () => void
  style?: 'primary' | 'secondary' | 'danger'
}

// Component Props Base Interfaces
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
  id?: string
  testId?: string
}

export interface ClickableProps {
  onClick?: (event: React.MouseEvent) => void
  disabled?: boolean
  loading?: boolean
}

export interface FormProps {
  onSubmit?: (event: React.FormEvent) => void
  onReset?: (event: React.FormEvent) => void
  onChange?: (data: any) => void
  disabled?: boolean
  loading?: boolean
}

// Data Fetching
export interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: any
  cache?: RequestCache
  signal?: AbortSignal
}

export interface QueryOptions {
  enabled?: boolean
  refetchOnWindowFocus?: boolean
  refetchOnMount?: boolean
  retry?: number
  retryDelay?: number
  staleTime?: number
  cacheTime?: number
}

// Search and Filtering
export interface SearchOptions {
  query: string
  filters?: Record<string, any>
  sort?: SortParams
  pagination?: PaginationParams
}

export interface SearchResult<T = any> {
  items: T[]
  total: number
  query: string
  filters: Record<string, any>
  suggestions?: string[]
  facets?: SearchFacet[]
}

export interface SearchFacet {
  name: string
  label: string
  type: 'checkbox' | 'radio' | 'range' | 'select'
  options: SearchFacetOption[]
}

export interface SearchFacetOption {
  label: string
  value: string | number
  count: number
  selected?: boolean
}

// File Upload
export interface FileUploadState {
  file: File | null
  preview?: string
  progress: number
  status: 'idle' | 'uploading' | 'success' | 'error'
  error?: string
}

export interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  url: string
  thumbnailUrl?: string
  uploadedAt: Date
}

// Address and Location
export interface Address {
  id?: string
  type?: 'billing' | 'shipping' | 'both'
  firstName?: string
  lastName?: string
  company?: string
  street: string
  street2?: string
  city: string
  state: string
  zipCode: string
  country: string
  phone?: string
  isDefault?: boolean
}

export interface Location {
  latitude: number
  longitude: number
  address?: string
  city?: string
  state?: string
  country?: string
}

// Theme and Styling
export interface Theme {
  colors: {
    primary: string
    secondary: string
    success: string
    warning: string
    danger: string
    info: string
    light: string
    dark: string
    muted: string
  }
  fonts: {
    family: string
    sizes: Record<string, string>
    weights: Record<string, number>
  }
  spacing: Record<string, string>
  breakpoints: Record<string, string>
  shadows: Record<string, string>
  borderRadius: Record<string, string>
}

export interface StyleProps {
  variant?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  color?: string
  fullWidth?: boolean
  rounded?: boolean
}

// Menu and Navigation
export interface MenuItem {
  id: string
  label: string
  href?: string
  icon?: React.ComponentType<any>
  children?: MenuItem[]
  disabled?: boolean
  badge?: string | number
  active?: boolean
  onClick?: () => void
}

export interface NavigationState {
  currentPath: string
  breadcrumbs: Breadcrumb[]
  isLoading: boolean
}

export interface Breadcrumb {
  label: string
  href?: string
  active?: boolean
}

// Preferences and Settings
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto'
  language: string
  currency: string
  timezone: string
  notifications: NotificationPreferences
  privacy: PrivacySettings
}

export interface NotificationPreferences {
  email: boolean
  push: boolean
  sms: boolean
  orderUpdates: boolean
  promotions: boolean
  newsletter: boolean
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends'
  dataCollection: boolean
  analytics: boolean
  marketing: boolean
}

// Analytics and Tracking
export interface AnalyticsEvent {
  name: string
  properties?: Record<string, any>
  timestamp?: Date
  userId?: string
  sessionId?: string
}

export interface PageView {
  path: string
  title?: string
  referrer?: string
  timestamp: Date
  duration?: number
}

export interface ConversionEvent {
  type: 'purchase' | 'signup' | 'subscription' | 'lead'
  value?: number
  currency?: string
  items?: any[]
  timestamp: Date
}

// Feature Flags
export interface FeatureFlag {
  name: string
  enabled: boolean
  description?: string
  rolloutPercentage?: number
  conditions?: FeatureFlagCondition[]
}

export interface FeatureFlagCondition {
  type: 'user_id' | 'email' | 'role' | 'country' | 'custom'
  operator: 'equals' | 'contains' | 'in' | 'not_in'
  value: any
}

// Cache and Storage
export interface CacheEntry<T = any> {
  key: string
  data: T
  timestamp: Date
  ttl?: number
  tags?: string[]
}

export interface StorageOptions {
  encrypt?: boolean
  compress?: boolean
  ttl?: number
  namespace?: string
}

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type NonEmptyArray<T> = [T, ...T[]]
export type KeyValuePair<K = string, V = any> = { key: K; value: V }

// Event Types
export interface CustomEvent<T = any> {
  type: string
  payload: T
  timestamp: Date
  source?: string
}

export interface WebSocketMessage<T = any> {
  id: string
  type: string
  data: T
  timestamp: Date
}

// Rating and Review Common Types
export interface Rating {
  value: number
  count: number
  distribution: Record<number, number>
  average: number
}

export interface ReviewSummary {
  total: number
  average: number
  distribution: Record<number, number>
  recommendations: number
  verifiedPurchases: number
}

// Currency and Pricing
export interface Money {
  amount: number
  currency: string
  formatted?: string
}

export interface PriceRange {
  min: Money
  max: Money
}

export interface Discount {
  type: 'percentage' | 'fixed' | 'buy_x_get_y'
  value: number
  code?: string
  description?: string
  conditions?: DiscountCondition[]
  validFrom?: Date
  validTo?: Date
}

export interface DiscountCondition {
  type: 'min_amount' | 'min_quantity' | 'product_category' | 'user_tier'
  value: any
}

// Inventory and Stock
export interface StockLevel {
  available: number
  reserved: number
  incoming: number
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'backorder'
  threshold?: number
}

export interface InventoryLocation {
  id: string
  name: string
  type: 'warehouse' | 'store' | 'supplier'
  address?: Address
  stock: Record<string, number>
}

// Shipping and Fulfillment
export interface ShippingOption {
  id: string
  name: string
  description?: string
  price: Money
  estimatedDays: number
  carrier?: string
  trackingAvailable: boolean
}

export interface TrackingInfo {
  trackingNumber: string
  carrier: string
  status: 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'exception'
  estimatedDelivery?: Date
  events: TrackingEvent[]
}

export interface TrackingEvent {
  timestamp: Date
  status: string
  location?: string
  description: string
}

// Subscription and Billing
export interface Subscription {
  id: string
  status: 'active' | 'paused' | 'cancelled' | 'expired'
  plan: SubscriptionPlan
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  trialEnd?: Date
}

export interface SubscriptionPlan {
  id: string
  name: string
  description?: string
  price: Money
  interval: 'day' | 'week' | 'month' | 'year'
  intervalCount: number
  trialDays?: number
  features: string[]
}

// A/B Testing
export interface Experiment {
  id: string
  name: string
  status: 'draft' | 'running' | 'paused' | 'completed'
  variants: ExperimentVariant[]
  allocation: Record<string, number>
  metrics: string[]
  startDate?: Date
  endDate?: Date
}

export interface ExperimentVariant {
  id: string
  name: string
  description?: string
  config: Record<string, any>
  allocation: number
}

// Help and Support
export interface SupportTicket {
  id: string
  subject: string
  description: string
  status: 'open' | 'pending' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: string
  assignee?: string
  requester: string
  createdAt: Date
  updatedAt: Date
  messages: SupportMessage[]
}

export interface SupportMessage {
  id: string
  content: string
  author: string
  authorType: 'customer' | 'agent' | 'system'
  timestamp: Date
  attachments?: UploadedFile[]
}

// Taxonomy and Categories
export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  parent?: string
  children?: Category[]
  image?: string
  productCount?: number
  level: number
  path: string[]
}

export interface Tag {
  id: string
  name: string
  slug: string
  color?: string
  description?: string
  count?: number
}

// SEO and Meta
export interface SEOData {
  title?: string
  description?: string
  keywords?: string[]
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: string
  canonical?: string
  noindex?: boolean
  nofollow?: boolean
}

export interface MetaData {
  seo: SEOData
  schema?: Record<string, any>
  customMeta?: Record<string, string>
}

// Internationalization
export interface Locale {
  code: string
  name: string
  nativeName: string
  direction: 'ltr' | 'rtl'
  currency: string
  dateFormat: string
  timeFormat: string
}

export interface Translation {
  key: string
  value: string
  locale: string
  namespace?: string
  interpolation?: Record<string, any>
}

// Social and Sharing
export interface SocialProfile {
  platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'youtube' | 'tiktok'
  username: string
  url: string
  verified?: boolean
}

export interface ShareOptions {
  url: string
  title?: string
  description?: string
  image?: string
  via?: string
  hashtags?: string[]
}

// Real-time Updates
export interface RealtimeEvent<T = any> {
  id: string
  type: string
  data: T
  timestamp: Date
  channel?: string
  userId?: string
}

export interface RealtimeConnection {
  id: string
  status: 'connecting' | 'connected' | 'disconnected' | 'error'
  lastHeartbeat?: Date
  subscriptions: string[]
}
