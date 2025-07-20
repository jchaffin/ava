'use client'

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { IProduct } from '@/types'
import { ProductCartItem } from '@/types/product'
import toast from 'react-hot-toast'
import { useState } from 'react'

interface CartState {
  items: ProductCartItem[]
  isLoading: boolean
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: IProduct }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: ProductCartItem[] }
  | { type: 'SET_LOADING'; payload: boolean }

interface CartContextType {
  items: ProductCartItem[]
  isLoading: boolean
  addItem: (product: IProduct) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotalPrice: () => number
  getTotalItems: () => number
  isInCart: (productId: string) => boolean
  getItemQuantity: (productId: string) => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

// Local storage key
const CART_STORAGE_KEY = 'ava-cart'

// Helper function to create ProductCartItem from IProduct
const createCartItemFromProduct = (product: IProduct): ProductCartItem => {
  return {
    ...product,
    quantity: 1,
  } as ProductCartItem
}

// Load cart from localStorage
const loadCartFromStorage = (): ProductCartItem[] => {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error loading cart from storage:', error)
    return []
  }
}

// Save cart to localStorage
const saveCartToStorage = (items: ProductCartItem[]): void => {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  } catch (error) {
    console.error('Error saving cart to storage:', error)
  }
}

const cartReducer = (state: CartState, action: CartAction): CartState => {
  let newState: CartState

  switch (action.type) {
    case 'ADD_ITEM':
      const existingItem = state.items.find(item => item._id === action.payload._id)
      if (existingItem) {
        newState = {
          ...state,
          items: state.items.map(item =>
            item._id === action.payload._id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        }
      } else {
        const newCartItem = createCartItemFromProduct(action.payload)
        newState = {
          ...state,
          items: [...state.items, newCartItem],
        }
      }
      saveCartToStorage(newState.items)
      return newState
    
    case 'REMOVE_ITEM':
      newState = {
        ...state,
        items: state.items.filter(item => item._id !== action.payload),
      }
      saveCartToStorage(newState.items)
      return newState
    
    case 'UPDATE_QUANTITY':
      newState = {
        ...state,
        items: state.items.map(item =>
          item._id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      }
      saveCartToStorage(newState.items)
      return newState
    
    case 'CLEAR_CART':
      newState = {
        ...state,
        items: [],
      }
      saveCartToStorage(newState.items)
      return newState

    case 'LOAD_CART':
      return {
        ...state,
        items: action.payload,
        isLoading: false,
      }

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      }
    
    default:
      return state
  }
}

interface CartProviderProps {
  children: ReactNode
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isLoading: true,
  })
  const [isClient, setIsClient] = useState(false)

  // Set client flag on mount to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load cart from localStorage on mount (only on client)
  useEffect(() => {
    if (!isClient) return
    
    const loadCart = () => {
      dispatch({ type: 'SET_LOADING', payload: true })
      const savedItems = loadCartFromStorage()
      dispatch({ type: 'LOAD_CART', payload: savedItems })
    }

    loadCart()
  }, [isClient])

  const addItem = (product: IProduct) => {
    try {
      // Check if product is in stock
      if (product.stock <= 0) {
        toast.error('This product is out of stock')
        return
      }

      // Check if adding this item would exceed stock
      const existingItem = state.items.find(item => item._id === product._id)
      if (existingItem && existingItem.quantity >= product.stock) {
        toast.error(`Only ${product.stock} items available in stock`)
        return
      }

      dispatch({ type: 'ADD_ITEM', payload: product })
      toast.success(`${product.name} added to cart`)
    } catch (error) {
      console.error('Error adding item to cart:', error)
      toast.error('Failed to add item to cart')
    }
  }

  const removeItem = (productId: string) => {
    try {
      const item = state.items.find(item => item._id === productId)
      if (item) {
        dispatch({ type: 'REMOVE_ITEM', payload: productId })
        toast.success(`${item.name} removed from cart`)
      }
    } catch (error) {
      console.error('Error removing item from cart:', error)
      toast.error('Failed to remove item from cart')
    }
  }

  const updateQuantity = (productId: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        removeItem(productId)
        return
      }

      // Check stock limit
      const item = state.items.find(item => item._id === productId)
      
      if (item && quantity > item.stock) {
        toast.error(`Only ${item.stock} items available in stock`)
        return
      }

      dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity } })
    } catch (error) {
      console.error('Error updating item quantity:', error)
      toast.error('Failed to update item quantity')
    }
  }

  const clearCart = () => {
    try {
      dispatch({ type: 'CLEAR_CART' })
      toast.success('Cart cleared')
    } catch (error) {
      console.error('Error clearing cart:', error)
      toast.error('Failed to clear cart')
    }
  }

  const getTotalPrice = (): number => {
    return state.items.reduce((total, item) => {
      const price = typeof item.price === 'number' ? item.price : 0
      const quantity = typeof item.quantity === 'number' ? item.quantity : 0
      return total + (price * quantity)
    }, 0)
  }

  const getTotalItems = (): number => {
    return state.items.reduce((total, item) => {
      const quantity = typeof item.quantity === 'number' ? item.quantity : 0
      return total + quantity
    }, 0)
  }

  const isInCart = (productId: string): boolean => {
    return state.items.some(item => item._id === productId)
  }

  const getItemQuantity = (productId: string): number => {
    const item = state.items.find(item => item._id === productId)
    return item ? item.quantity : 0
  }

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        isLoading: state.isLoading,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
        isInCart,
        getItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = (): CartContextType => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}