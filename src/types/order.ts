import { Document } from 'mongoose'
import { IUser, IProduct } from './index'

export interface IOrderItem {
  product: string | IProduct
  quantity: number
  price: number
}

export interface IShippingAddress {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface IPaymentResult {
  id: string
  status: string
  email_address: string
}

export interface IOrder extends Document {
  _id: string
  user: string | IUser
  orderItems: IOrderItem[]
  shippingAddress: IShippingAddress
  paymentMethod: string
  paymentResult?: IPaymentResult
  itemsPrice: number
  shippingPrice: number
  taxPrice: number
  totalPrice: number
  isPaid: boolean
  paidAt?: Date
  isDelivered: boolean
  deliveredAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface CreateOrderInput {
  orderItems: IOrderItem[]
  shippingAddress: IShippingAddress
  paymentMethod: string
  itemsPrice: number
  shippingPrice: number
  taxPrice: number
  totalPrice: number
}