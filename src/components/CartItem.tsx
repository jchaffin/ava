import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus, ArrowUpRight } from 'lucide-react';
import { getProductImageUrl } from '@/utils/helpers';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  description?: string;
}

interface CartItemProps {
  item: CartItem;
  stock: number;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, stock, onUpdateQuantity, onRemove }) => {
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity <= 0) {
      onRemove(item.id);
    } else {
      onUpdateQuantity(item.id, newQuantity);
    }
  };

  const totalPrice = item.price * item.quantity;

  return (
    <div className="p-6">
      {/* Product Name at Top */}
      <h3 className="font-semibold text-theme-primary text-lg mb-4">{item.name}</h3>
      
      {/* Desktop Layout */}
      <div className="hidden md:flex flex-col gap-4">
        {/* Top Row: Image and Description */}
        <div className="flex gap-4">
          {/* Product Image */}
          <div className="flex-shrink-0">
            <div className="relative w-24 h-24">
              <Image
                src={getProductImageUrl(item.image, item.id)}
                alt={item.name}
                fill
                className="object-cover rounded-md"
              />
            </div>
          </div>

          {/* Product Details - Text wraps around image */}
          <div className="flex-1 min-w-0">
            {item.description && (
              <p className="text-sm text-theme-secondary line-clamp-3">
                {item.description}
              </p>
            )}
          </div>
        </div>

        {/* Bottom Row: Price, Quantity, and Action Buttons */}
        <div className="flex items-center justify-between">
          {/* Price and Quantity Controls */}
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold text-theme-primary">
              ${item.quantity === 1 ? item.price.toFixed(2) : totalPrice.toFixed(2)}
            </span>
            
            {/* Quantity Controls */}
            <div className="flex items-stretch border border-theme rounded-md bg-theme-primary w-fit text-base">
              <button
                onClick={() => handleQuantityChange(item.quantity - 1)}
                className="px-3 py-2 bg-theme-primary hover:bg-theme-tertiary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                aria-label="Decrease quantity"
                disabled={item.quantity <= 1}
              >
                <Minus size={16} />
              </button>
              
              <span className="px-4 py-2 text-center font-medium min-w-[2.5rem] border-x border-theme bg-theme-primary flex items-center justify-center text-base">
                {item.quantity}
              </span>
              
              <button
                onClick={() => handleQuantityChange(item.quantity + 1)}
                className="px-3 py-2 bg-theme-primary hover:bg-theme-tertiary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                aria-label="Increase quantity"
                disabled={item.quantity >= stock}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Action Buttons - Bottom Right */}
          <div className="flex items-center gap-2">
            <Link href={`/products/${item.id}`}>
              <button className="p-1.5 text-theme-muted hover:text-theme-primary hover:bg-theme-primary rounded transition-colors">
                <ArrowUpRight size={14} />
              </button>
            </Link>
            
            <button
              onClick={() => onRemove(item.id)}
              className="p-1.5 text-theme-muted hover:bg-theme-primary rounded-md transition-colors"
              aria-label="Remove from cart"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        
        {/* Stock Warning */}
        {item.quantity >= stock && (
          <p className="text-sm text-orange-600">
            ⚠️ Maximum available quantity reached
          </p>
        )}
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden space-y-4">
        {/* Product Image and Description Row */}
        <div className="flex gap-3">
          <div className="relative w-20 h-20 flex-shrink-0">
            <Image
              src={getProductImageUrl(item.image, item.id)}
              alt={item.name}
              fill
              className="object-cover rounded-md"
            />
          </div>

          {/* Description */}
          {item.description && (
            <p className="text-sm text-theme-secondary line-clamp-3 flex-1">
              {item.description}
            </p>
          )}
        </div>

        {/* Price and Quantity Controls */}
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-theme-primary">
            ${item.quantity === 1 ? item.price.toFixed(2) : totalPrice.toFixed(2)}
          </span>
          
          {/* Quantity Controls */}
          <div className="flex items-stretch border border-theme rounded-md bg-theme-primary w-fit text-sm">
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              className="px-2 py-1 bg-theme-primary hover:bg-theme-tertiary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              aria-label="Decrease quantity"
              disabled={item.quantity <= 1}
            >
              <Minus size={14} />
            </button>
            
            <span className="px-3 py-1 text-center font-medium min-w-[2rem] border-x border-theme bg-theme-primary flex items-center justify-center">
              {item.quantity}
            </span>
            
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              className="px-2 py-1 bg-theme-primary hover:bg-theme-tertiary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              aria-label="Increase quantity"
              disabled={item.quantity >= stock}
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
        
        {/* Stock Warning */}
        {item.quantity >= stock && (
          <p className="text-sm text-orange-600">
            ⚠️ Maximum available quantity reached
          </p>
        )}

        {/* Action Buttons - Bottom Right */}
        <div className="flex items-center justify-end gap-2">
          <Link href={`/products/${item.id}`}>
            <button className="p-2 text-theme-muted hover:text-theme-primary hover:bg-theme-primary rounded transition-colors">
              <ArrowUpRight size={16} />
            </button>
          </Link>
          
          <button
            onClick={() => onRemove(item.id)}
            className="p-2 text-theme-muted hover:bg-theme-primary rounded-md transition-colors"
            aria-label="Remove from cart"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;