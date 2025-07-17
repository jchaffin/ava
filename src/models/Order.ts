import mongoose, { Schema } from 'mongoose'
import { IOrder } from '../types'

const OrderSchema = new Schema<IOrder>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
  },
  orderItems: [{
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
  }],
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: ['card', 'paypal', 'bank_transfer'],
  },
  paymentResult: {
    id: String,
    status: String,
    email_address: String,
  },
  itemsPrice: {
    type: Number,
    required: [true, 'Items price is required'],
    min: [0, 'Items price cannot be negative'],
  },
  shippingPrice: {
    type: Number,
    required: [true, 'Shipping price is required'],
    min: [0, 'Shipping price cannot be negative'],
    default: 0,
  },
  taxPrice: {
    type: Number,
    required: [true, 'Tax price is required'],
    min: [0, 'Tax price cannot be negative'],
    default: 0,
  },
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required'],
    min: [0, 'Total price cannot be negative'],
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false,
  },
  paidAt: {
    type: Date,
  },
  isDelivered: {
    type: Boolean,
    required: true,
    default: false,
  },
  deliveredAt: {
    type: Date,
  },
}, {
  timestamps: true,
})

// Index for better query performance
OrderSchema.index({ user: 1 })
OrderSchema.index({ createdAt: -1 })

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema)
```