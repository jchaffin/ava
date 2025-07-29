import { 
  ApiResponse, 
  PaginatedResponse, 
  PaginationParams, 
  SortParams, 
  FilterParams,
  ValidationError 
} from './common'
import { IUser, IProduct, IOrder } from './index'

// HTTP Methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

// API Request Types
export interface ApiRequest<T = any> {
  method: HttpMethod
  url: string
  data?: T
  params?: Record<string, any>
  headers?: Record<string, string>
  timeout?: number
  signal?: AbortSignal
}

export interface ApiRequestConfig {
  baseURL?: string
  timeout?: number
  retries?: number
  retryDelay?: number
  headers?: Record<string, string>
  transformRequest?: (data: any) => any
  transformResponse?: (data: any) => any
  onRequest?: (config: ApiRequest) => ApiRequest | Promise<ApiRequest>
  onResponse?: (response: ApiResponse) => ApiResponse | Promise<ApiResponse>
  onError?: (error: ApiError) => void | Promise<void>
}

// API Error Types
export interface ApiError {
  code: string
  message: string
  statusCode: number
  details?: any
  timestamp: string
  path: string
  validation?: ValidationError[]
}

export interface ApiErrorResponse {
  success: false
  error: string
  message: string
  statusCode: number
  details?: any
  validation?: ValidationError[]
}

// Authentication API Types
export interface LoginRequest {
  email: string
  password: string
  remember?: boolean
}

export interface LoginResponse {
  user: IUser
  token: string
  refreshToken: string
  expiresIn: number
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  confirmPassword: string
  agreeToTerms: boolean
}

export interface RegisterResponse {
  user: IUser
  message: string
  requiresVerification?: boolean
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface RefreshTokenResponse {
  token: string
  refreshToken: string
  expiresIn: number
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ForgotPasswordResponse {
  message: string
  resetToken?: string
}

export interface ResetPasswordRequest {
  token: string
  password: string
  confirmPassword: string
}

export interface ResetPasswordResponse {
  message: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface ChangePasswordResponse {
  message: string
}

export interface VerifyEmailRequest {
  token: string
}

export interface VerifyEmailResponse {
  message: string
  user: IUser
}

// User API Types
export interface GetUserResponse extends ApiResponse<IUser> {}

export interface UpdateUserRequest {
  name?: string
  email?: string
  phone?: string
  address?: {
    street?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
  }
  preferences?: {
    newsletter?: boolean
    notifications?: boolean
    theme?: 'light' | 'dark'
    language?: string
  }
}

export interface UpdateUserResponse extends ApiResponse<IUser> {}

export interface GetUsersRequest extends PaginationParams, SortParams {
  search?: string
  role?: 'user' | 'admin'
  status?: 'active' | 'inactive' | 'banned'
  verified?: boolean
}

export interface GetUsersResponse extends PaginatedResponse<IUser> {}

// Product API Types
export interface GetProductsRequest extends PaginationParams, SortParams, FilterParams {
  category?: string
  featured?: boolean
  inStock?: boolean
  priceMin?: number
  priceMax?: number
  tags?: string[]
  brand?: string
  rating?: number
}

export interface GetProductsResponse extends PaginatedResponse<IProduct> {}

export interface GetProductRequest {
  id: string
  includeReviews?: boolean
  includeRelated?: boolean
  includeAnalytics?: boolean
}

export interface GetProductResponse extends ApiResponse<IProduct> {
  data: IProduct & {
    reviews?: ProductReview[]
    related?: IProduct[]
    analytics?: ProductAnalytics
  }
}

export interface CreateProductRequest {
  name: string
  description: string
  price: number
  image: string
  category: string
  stock: number
  featured?: boolean
  tags?: string[]
  brand?: string
  sku?: string
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
  seo?: {
    title?: string
    description?: string
    keywords?: string[]
  }
}

export interface CreateProductResponse extends ApiResponse<IProduct> {}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  id: string
}

export interface UpdateProductResponse extends ApiResponse<IProduct> {}

export interface DeleteProductRequest {
  id: string
  force?: boolean
}

export interface DeleteProductResponse extends ApiResponse<{ deletedId: string }> {}

export interface BulkProductsRequest {
  action: 'update' | 'delete' | 'featured' | 'unfeatured'
  productIds: string[]
  updates?: Partial<CreateProductRequest>
}

export interface BulkProductsResponse extends ApiResponse<{
  processed: number
  failed: number
  errors: Array<{ id: string; error: string }>
}> {}

export interface ProductSearchRequest {
  query: string
  category?: string
  filters?: Record<string, any>
  facets?: string[]
  suggestions?: boolean
}

export interface ProductSearchResponse extends ApiResponse<{
  products: IProduct[]
  total: number
  suggestions: string[]
  facets: SearchFacet[]
}> {}

export interface SearchFacet {
  name: string
  type: 'category' | 'price' | 'brand' | 'rating'
  options: Array<{
    value: string
    label: string
    count: number
  }>
}

// Order API Types
export interface CreateOrderRequest {
  items: Array<{
    productId: string
    quantity: number
    price: number
  }>
  shippingAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
    firstName?: string
    lastName?: string
    phone?: string
  }
  billingAddress?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
    firstName?: string
    lastName?: string
    phone?: string
  }
  paymentMethod: 'card' | 'paypal' | 'bank_transfer' | 'google_pay' | 'apple_pay'
  paymentDetails?: {
    token?: string
    cardLast4?: string
    expiryMonth?: number
    expiryYear?: number
  }
  shippingMethod?: string
  couponCode?: string
  notes?: string
}

export interface CreateOrderResponse extends ApiResponse<IOrder> {}

export interface GetOrdersRequest extends PaginationParams, SortParams {
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  dateFrom?: string
  dateTo?: string
  userId?: string
}

export interface GetOrdersResponse extends PaginatedResponse<IOrder> {}

export interface GetOrderRequest {
  id: string
  includeItems?: boolean
  includeTracking?: boolean
}

export interface GetOrderResponse extends ApiResponse<IOrder> {}

export interface UpdateOrderRequest {
  id: string
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  trackingNumber?: string
  notes?: string
  shippedAt?: string
  deliveredAt?: string
}

export interface UpdateOrderResponse extends ApiResponse<IOrder> {}

export interface CancelOrderRequest {
  id: string
  reason?: string
}

export interface CancelOrderResponse extends ApiResponse<{ message: string }> {}

// Cart API Types
export interface AddToCartRequest {
  productId: string
  quantity: number
  variant?: Record<string, any>
}

export interface AddToCartResponse extends ApiResponse<CartItem> {}

export interface UpdateCartItemRequest {
  itemId: string
  quantity: number
}

export interface UpdateCartItemResponse extends ApiResponse<CartItem> {}

export interface RemoveFromCartRequest {
  itemId: string
}

export interface RemoveFromCartResponse extends ApiResponse<{ message: string }> {}

export interface GetCartResponse extends ApiResponse<{
  items: CartItem[]
  total: number
  subtotal: number
  tax: number
  shipping: number
  discount: number
  itemCount: number
}> {}

export interface ClearCartResponse extends ApiResponse<{ message: string }> {}

export interface CartItem {
  id: string
  productId: string
  product: IProduct
  quantity: number
  price: number
  variant?: Record<string, any>
  addedAt: string
}

// Wishlist API Types
export interface AddToWishlistRequest {
  productId: string
}

export interface AddToWishlistResponse extends ApiResponse<{ message: string }> {}

export interface RemoveFromWishlistRequest {
  productId: string
}

export interface RemoveFromWishlistResponse extends ApiResponse<{ message: string }> {}

export interface GetWishlistResponse extends ApiResponse<{
  items: Array<{
    id: string
    product: IProduct
    addedAt: string
  }>
}> {}

// Review API Types
export interface CreateReviewRequest {
  productId: string
  rating: number
  title?: string
  comment: string
  verified?: boolean
}

export interface CreateReviewResponse extends ApiResponse<ProductReview> {}

export interface GetReviewsRequest extends PaginationParams, SortParams {
  productId?: string
  userId?: string
  rating?: number
  verified?: boolean
}

export interface GetReviewsResponse extends PaginatedResponse<ProductReview> {}

export interface UpdateReviewRequest {
  id: string
  rating?: number
  title?: string
  comment?: string
}

export interface UpdateReviewResponse extends ApiResponse<ProductReview> {}

export interface DeleteReviewRequest {
  id: string
}

export interface DeleteReviewResponse extends ApiResponse<{ message: string }> {}

export interface ProductReview {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  productId: string
  rating: number
  title?: string
  comment: string
  verified: boolean
  helpful: number
  reported: number
  createdAt: string
  updatedAt: string
}

// Analytics API Types
export interface GetAnalyticsRequest {
  period: 'day' | 'week' | 'month' | 'year'
  startDate?: string
  endDate?: string
  metrics?: string[]
  dimensions?: string[]
}

export interface GetAnalyticsResponse extends ApiResponse<{
  overview: AnalyticsOverview
  charts: AnalyticsChart[]
  tables: AnalyticsTable[]
}> {}

export interface AnalyticsOverview {
  totalSales: number
  totalOrders: number
  totalCustomers: number
  averageOrderValue: number
  conversionRate: number
  returnRate: number
  growth: {
    sales: number
    orders: number
    customers: number
  }
}

export interface AnalyticsChart {
  id: string
  title: string
  type: 'line' | 'bar' | 'pie' | 'area'
  data: Array<{
    label: string
    value: number
    date?: string
  }>
}

export interface AnalyticsTable {
  id: string
  title: string
  headers: string[]
  rows: Array<Record<string, any>>
}

export interface ProductAnalytics {
  views: number
  sales: number
  revenue: number
  conversionRate: number
  averageRating: number
  reviewCount: number
  wishlistCount: number
  returnRate: number
}

// Payment API Types
export interface CreatePaymentIntentRequest {
  orderId: string
  amount: number
  currency: string
  paymentMethod: 'card' | 'paypal'
  savePaymentMethod?: boolean
}

export interface CreatePaymentIntentResponse extends ApiResponse<{
  clientSecret: string
  paymentIntentId: string
}> {}

export interface ConfirmPaymentRequest {
  paymentIntentId: string
  paymentMethod?: {
    type: 'card'
    card: {
      token: string
    }
  }
}

export interface ConfirmPaymentResponse extends ApiResponse<{
  status: 'succeeded' | 'requires_action' | 'failed'
  nextAction?: any
}> {}

export interface GetPaymentMethodsResponse extends ApiResponse<{
  methods: Array<{
    id: string
    type: 'card' | 'paypal'
    card?: {
      brand: string
      last4: string
      expiryMonth: number
      expiryYear: number
    }
    isDefault: boolean
  }>
}> {}

// Shipping API Types
export interface GetShippingRatesRequest {
  items: Array<{
    productId: string
    quantity: number
    weight?: number
    dimensions?: {
      length: number
      width: number
      height: number
    }
  }>
  destination: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
}

export interface GetShippingRatesResponse extends ApiResponse<{
  rates: Array<{
    id: string
    name: string
    description?: string
    price: number
    estimatedDays: number
    carrier: string
  }>
}> {}

export interface TrackShipmentRequest {
  trackingNumber: string
  carrier?: string
}

export interface TrackShipmentResponse extends ApiResponse<{
  status: 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'exception'
  estimatedDelivery?: string
  events: Array<{
    timestamp: string
    status: string
    location?: string
    description: string
  }>
}> {}

// Coupon API Types
export interface ValidateCouponRequest {
  code: string
  items?: Array<{
    productId: string
    quantity: number
    price: number
  }>
}

export interface ValidateCouponResponse extends ApiResponse<{
  valid: boolean
  discount: {
    type: 'percentage' | 'fixed'
    value: number
    amount: number
  }
  message?: string
}> {}

export interface ApplyCouponRequest {
  orderId: string
  code: string
}

export interface ApplyCouponResponse extends ApiResponse<{
  discount: number
  newTotal: number
}> {}



// File Upload API Types
export interface UploadFileRequest {
  file: File
  type: 'product' | 'avatar' | 'document'
  productId?: string
}

export interface UploadFileResponse extends ApiResponse<{
  id: string
  url: string
  filename: string
  size: number
  type: string
}> {}

export interface DeleteFileRequest {
  id: string
}

export interface DeleteFileResponse extends ApiResponse<{ message: string }> {}

// Search API Types
export interface SearchRequest {
  query: string
  type?: 'products' | 'users' | 'orders' | 'all'
  filters?: Record<string, any>
  limit?: number
}

export interface SearchResponse extends ApiResponse<{
  products?: IProduct[]
  users?: IUser[]
  orders?: IOrder[]
  total: number
  suggestions: string[]
}> {}

export interface AutocompleteRequest {
  query: string
  type: 'products' | 'categories' | 'brands'
  limit?: number
}

export interface AutocompleteResponse extends ApiResponse<{
  suggestions: Array<{
    text: string
    type: string
    count?: number
  }>
}> {}

// Admin API Types
export interface GetDashboardStatsResponse extends ApiResponse<{
  sales: {
    today: number
    thisWeek: number
    thisMonth: number
    thisYear: number
  }
  orders: {
    pending: number
    processing: number
    shipped: number
    delivered: number
  }
  products: {
    total: number
    inStock: number
    lowStock: number
    outOfStock: number
  }
  users: {
    total: number
    active: number
    new: number
  }
}> {}

export interface GetSystemInfoResponse extends ApiResponse<{
  version: string
  environment: string
  uptime: number
  database: {
    status: 'connected' | 'disconnected'
    version: string
  }
  cache: {
    status: 'connected' | 'disconnected'
    hitRate: number
  }
  storage: {
    used: number
    total: number
  }
}> {}

// Webhook API Types
export interface WebhookEvent<T = any> {
  id: string
  type: string
  data: T
  timestamp: string
  signature: string
}

export interface WebhookResponse {
  received: boolean
  processed: boolean
  error?: string
}

// API Client Interface
export interface ApiClient {
  // Authentication
  login(data: LoginRequest): Promise<LoginResponse>
  register(data: RegisterRequest): Promise<RegisterResponse>
  refreshToken(data: RefreshTokenRequest): Promise<RefreshTokenResponse>
  forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse>
  resetPassword(data: ResetPasswordRequest): Promise<ResetPasswordResponse>
  changePassword(data: ChangePasswordRequest): Promise<ChangePasswordResponse>
  verifyEmail(data: VerifyEmailRequest): Promise<VerifyEmailResponse>
  logout(): Promise<void>

  // Users
  getUser(): Promise<GetUserResponse>
  updateUser(data: UpdateUserRequest): Promise<UpdateUserResponse>
  getUsers(params: GetUsersRequest): Promise<GetUsersResponse>

  // Products
  getProducts(params: GetProductsRequest): Promise<GetProductsResponse>
  getProduct(params: GetProductRequest): Promise<GetProductResponse>
  createProduct(data: CreateProductRequest): Promise<CreateProductResponse>
  updateProduct(data: UpdateProductRequest): Promise<UpdateProductResponse>
  deleteProduct(params: DeleteProductRequest): Promise<DeleteProductResponse>
  searchProducts(params: ProductSearchRequest): Promise<ProductSearchResponse>

  // Orders
  createOrder(data: CreateOrderRequest): Promise<CreateOrderResponse>
  getOrders(params: GetOrdersRequest): Promise<GetOrdersResponse>
  getOrder(params: GetOrderRequest): Promise<GetOrderResponse>
  updateOrder(data: UpdateOrderRequest): Promise<UpdateOrderResponse>
  cancelOrder(data: CancelOrderRequest): Promise<CancelOrderResponse>

  // Cart
  addToCart(data: AddToCartRequest): Promise<AddToCartResponse>
  updateCartItem(data: UpdateCartItemRequest): Promise<UpdateCartItemResponse>
  removeFromCart(data: RemoveFromCartRequest): Promise<RemoveFromCartResponse>
  getCart(): Promise<GetCartResponse>
  clearCart(): Promise<ClearCartResponse>

  // Wishlist
  addToWishlist(data: AddToWishlistRequest): Promise<AddToWishlistResponse>
  removeFromWishlist(data: RemoveFromWishlistRequest): Promise<RemoveFromWishlistResponse>
  getWishlist(): Promise<GetWishlistResponse>

  // Reviews
  createReview(data: CreateReviewRequest): Promise<CreateReviewResponse>
  getReviews(params: GetReviewsRequest): Promise<GetReviewsResponse>
  updateReview(data: UpdateReviewRequest): Promise<UpdateReviewResponse>
  deleteReview(params: DeleteReviewRequest): Promise<DeleteReviewResponse>

  // Analytics
  getAnalytics(params: GetAnalyticsRequest): Promise<GetAnalyticsResponse>

  // Payments
  createPaymentIntent(data: CreatePaymentIntentRequest): Promise<CreatePaymentIntentResponse>
  confirmPayment(data: ConfirmPaymentRequest): Promise<ConfirmPaymentResponse>
  getPaymentMethods(): Promise<GetPaymentMethodsResponse>

  // Shipping
  getShippingRates(data: GetShippingRatesRequest): Promise<GetShippingRatesResponse>
  trackShipment(params: TrackShipmentRequest): Promise<TrackShipmentResponse>

  // Coupons
  validateCoupon(data: ValidateCouponRequest): Promise<ValidateCouponResponse>
  applyCoupon(data: ApplyCouponRequest): Promise<ApplyCouponResponse>



  // File Upload
  uploadFile(data: UploadFileRequest): Promise<UploadFileResponse>
  deleteFile(params: DeleteFileRequest): Promise<DeleteFileResponse>

  // Search
  search(params: SearchRequest): Promise<SearchResponse>
  autocomplete(params: AutocompleteRequest): Promise<AutocompleteResponse>

  // Admin
  getDashboardStats(): Promise<GetDashboardStatsResponse>
  getSystemInfo(): Promise<GetSystemInfoResponse>
}