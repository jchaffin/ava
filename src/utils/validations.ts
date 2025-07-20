import { VALIDATION, REGEX_PATTERNS } from './constants'

// Basic Validation Types
export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export interface FieldValidationResult {
  isValid: boolean
  error?: string
}

// User Validation
export const validateEmail = (email: string): FieldValidationResult => {
  if (!email) {
    return { isValid: false, error: 'Email is required' }
  }
  
  if (email.length > VALIDATION.EMAIL.MAX_LENGTH) {
    return { isValid: false, error: 'Email is too long' }
  }
  
  if (!REGEX_PATTERNS.EMAIL.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' }
  }
  
  return { isValid: true }
}

export const validatePassword = (password: string): FieldValidationResult => {
  if (!password) {
    return { isValid: false, error: 'Password is required' }
  }
  
  const { MIN_LENGTH, MAX_LENGTH, REQUIRE_UPPERCASE, REQUIRE_LOWERCASE, REQUIRE_NUMBERS } = VALIDATION.PASSWORD
  
  if (password.length < MIN_LENGTH) {
    return { isValid: false, error: `Password must be at least ${MIN_LENGTH} characters long` }
  }
  
  if (password.length > MAX_LENGTH) {
    return { isValid: false, error: `Password cannot exceed ${MAX_LENGTH} characters` }
  }
  
  if (REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' }
  }
  
  if (REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter' }
  }
  
  if (REQUIRE_NUMBERS && !/\d/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' }
  }
  
  return { isValid: true }
}

export const validateName = (name: string): FieldValidationResult => {
  if (!name?.trim()) {
    return { isValid: false, error: 'Name is required' }
  }
  
  const trimmedName = name.trim()
  const { MIN_LENGTH, MAX_LENGTH } = VALIDATION.NAME
  
  if (trimmedName.length < MIN_LENGTH) {
    return { isValid: false, error: `Name must be at least ${MIN_LENGTH} characters long` }
  }
  
  if (trimmedName.length > MAX_LENGTH) {
    return { isValid: false, error: `Name cannot exceed ${MAX_LENGTH} characters` }
  }
  
  return { isValid: true }
}

export const validatePhone = (phone: string): FieldValidationResult => {
  if (!phone) {
    return { isValid: false, error: 'Phone number is required' }
  }
  
  if (!REGEX_PATTERNS.PHONE.test(phone)) {
    return { isValid: false, error: 'Please enter a valid phone number' }
  }
  
  return { isValid: true }
}

// Product Validation
export const validateProductName = (name: string): FieldValidationResult => {
  if (!name?.trim()) {
    return { isValid: false, error: 'Product name is required' }
  }
  
  const trimmedName = name.trim()
  const { NAME_MIN_LENGTH, NAME_MAX_LENGTH } = VALIDATION.PRODUCT
  
  if (trimmedName.length < NAME_MIN_LENGTH) {
    return { isValid: false, error: `Product name must be at least ${NAME_MIN_LENGTH} characters long` }
  }
  
  if (trimmedName.length > NAME_MAX_LENGTH) {
    return { isValid: false, error: `Product name cannot exceed ${NAME_MAX_LENGTH} characters` }
  }
  
  return { isValid: true }
}

export const validateProductDescription = (description: string): FieldValidationResult => {
  if (!description?.trim()) {
    return { isValid: false, error: 'Product description is required' }
  }
  
  const trimmedDescription = description.trim()
  const { DESCRIPTION_MIN_LENGTH, DESCRIPTION_MAX_LENGTH } = VALIDATION.PRODUCT
  
  if (trimmedDescription.length < DESCRIPTION_MIN_LENGTH) {
    return { isValid: false, error: `Description must be at least ${DESCRIPTION_MIN_LENGTH} characters long` }
  }
  
  if (trimmedDescription.length > DESCRIPTION_MAX_LENGTH) {
    return { isValid: false, error: `Description cannot exceed ${DESCRIPTION_MAX_LENGTH} characters` }
  }
  
  return { isValid: true }
}

export const validateProductPrice = (price: number | string): FieldValidationResult => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  
  if (isNaN(numPrice)) {
    return { isValid: false, error: 'Please enter a valid price' }
  }
  
  if (numPrice < 0) {
    return { isValid: false, error: 'Price cannot be negative' }
  }
  
  if (numPrice > VALIDATION.PRODUCT.MAX_PRICE) {
    return { isValid: false, error: `Price cannot exceed ${VALIDATION.PRODUCT.MAX_PRICE.toLocaleString()}` }
  }
  
  return { isValid: true }
}

export const validateProductStock = (stock: number | string): FieldValidationResult => {
  const numStock = typeof stock === 'string' ? parseInt(stock) : stock
  
  if (isNaN(numStock)) {
    return { isValid: false, error: 'Please enter a valid stock quantity' }
  }
  
  if (numStock < 0) {
    return { isValid: false, error: 'Stock cannot be negative' }
  }
  
  if (numStock > VALIDATION.PRODUCT.MAX_STOCK) {
    return { isValid: false, error: `Stock cannot exceed ${VALIDATION.PRODUCT.MAX_STOCK.toLocaleString()} units` }
  }
  
  return { isValid: true }
}

export const validateImageUrl = (url: string): FieldValidationResult => {
  if (!url?.trim()) {
    return { isValid: false, error: 'Image URL is required' }
  }
  
  if (!REGEX_PATTERNS.URL.test(url)) {
    return { isValid: false, error: 'Please enter a valid image URL' }
  }
  
  return { isValid: true }
}

// Address Validation
export const validateAddress = (address: {
  street?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
}): ValidationResult => {
  const errors: string[] = []
  
  if (!address.street?.trim()) {
    errors.push('Street address is required')
  }
  
  if (!address.city?.trim()) {
    errors.push('City is required')
  }
  
  if (!address.state?.trim()) {
    errors.push('State is required')
  }
  
  if (!address.zipCode?.trim()) {
    errors.push('ZIP code is required')
  } else if (!REGEX_PATTERNS.POSTAL_CODE.test(address.zipCode)) {
    errors.push('Please enter a valid ZIP code')
  }
  
  if (!address.country?.trim()) {
    errors.push('Country is required')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Credit Card Validation
export const validateCreditCard = (cardNumber: string): FieldValidationResult => {
  if (!cardNumber?.trim()) {
    return { isValid: false, error: 'Card number is required' }
  }
  
  const cleanCardNumber = cardNumber.replace(/\s/g, '')
  
  if (!REGEX_PATTERNS.CREDIT_CARD.test(cardNumber)) {
    return { isValid: false, error: 'Please enter a valid card number' }
  }
  
  // Luhn algorithm validation
  let sum = 0
  let alternate = false
  
  for (let i = cleanCardNumber.length - 1; i >= 0; i--) {
    let n = parseInt(cleanCardNumber.charAt(i), 10)
    
    if (alternate) {
      n *= 2
      if (n > 9) {
        n = (n % 10) + 1
      }
    }
    
    sum += n
    alternate = !alternate
  }
  
  if (sum % 10 !== 0) {
    return { isValid: false, error: 'Invalid card number' }
  }
  
  return { isValid: true }
}

export const validateExpiryDate = (month: string, year: string): FieldValidationResult => {
  if (!month || !year) {
    return { isValid: false, error: 'Expiry date is required' }
  }
  
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1
  
  const expMonth = parseInt(month, 10)
  const expYear = parseInt(year, 10)
  
  if (expMonth < 1 || expMonth > 12) {
    return { isValid: false, error: 'Invalid month' }
  }
  
  if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
    return { isValid: false, error: 'Card has expired' }
  }
  
  return { isValid: true }
}

export const validateCVV = (cvv: string): FieldValidationResult => {
  if (!cvv?.trim()) {
    return { isValid: false, error: 'CVV is required' }
  }
  
  if (!/^\d{3,4}$/.test(cvv)) {
    return { isValid: false, error: 'CVV must be 3 or 4 digits' }
  }
  
  return { isValid: true }
}

// Form Validation Helpers
export const validateRequired = (value: any, fieldName: string): FieldValidationResult => {
  if (value === null || value === undefined || value === '') {
    return { isValid: false, error: `${fieldName} is required` }
  }
  
  if (typeof value === 'string' && !value.trim()) {
    return { isValid: false, error: `${fieldName} is required` }
  }
  
  return { isValid: true }
}

export const validateMinLength = (value: string, minLength: number, fieldName: string): FieldValidationResult => {
  if (value.length < minLength) {
    return { isValid: false, error: `${fieldName} must be at least ${minLength} characters long` }
  }
  
  return { isValid: true }
}

export const validateMaxLength = (value: string, maxLength: number, fieldName: string): FieldValidationResult => {
  if (value.length > maxLength) {
    return { isValid: false, error: `${fieldName} cannot exceed ${maxLength} characters` }
  }
  
  return { isValid: true }
}

export const validateRange = (value: number, min: number, max: number, fieldName: string): FieldValidationResult => {
  if (value < min || value > max) {
    return { isValid: false, error: `${fieldName} must be between ${min} and ${max}` }
  }
  
  return { isValid: true }
}

// Compound Validations
export const validateRegistrationForm = (data: {
  name: string
  email: string
  password: string
  confirmPassword: string
}): ValidationResult => {
  const errors: string[] = []
  
  const nameValidation = validateName(data.name)
  if (!nameValidation.isValid) errors.push(nameValidation.error!)
  
  const emailValidation = validateEmail(data.email)
  if (!emailValidation.isValid) errors.push(emailValidation.error!)
  
  const passwordValidation = validatePassword(data.password)
  if (!passwordValidation.isValid) errors.push(passwordValidation.error!)
  
  if (data.password !== data.confirmPassword) {
    errors.push('Passwords do not match')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

export const validateLoginForm = (data: {
  email: string
  password: string
}): ValidationResult => {
  const errors: string[] = []
  
  const emailValidation = validateEmail(data.email)
  if (!emailValidation.isValid) errors.push(emailValidation.error!)
  
  const passwordValidation = validateRequired(data.password, 'Password')
  if (!passwordValidation.isValid) errors.push(passwordValidation.error!)
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

export const validateProductForm = (data: {
  name: string
  description: string
  price: number | string
  image: string
  stock: number | string
}): ValidationResult => {
  const errors: string[] = []
  
  const nameValidation = validateProductName(data.name)
  if (!nameValidation.isValid) errors.push(nameValidation.error!)
  
  const descriptionValidation = validateProductDescription(data.description)
  if (!descriptionValidation.isValid) errors.push(descriptionValidation.error!)
  
  const priceValidation = validateProductPrice(data.price)
  if (!priceValidation.isValid) errors.push(priceValidation.error!)
  
  const imageValidation = validateImageUrl(data.image)
  if (!imageValidation.isValid) errors.push(imageValidation.error!)
  
  const stockValidation = validateProductStock(data.stock)
  if (!stockValidation.isValid) errors.push(stockValidation.error!)
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}