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
    <div className="flex flex-col gap-4 p-4 bg-theme-tertiary rounded-lg shadow-sm border border-theme hover:shadow-md transition-shadow">
      {/* First Row: Product Image, Details, Price, and Quantity Controls */}
      <div className="flex gap-4">
        {/* Product Image */}
        <div className="relative w-24 h-24 flex-shrink-0">
          <Image
            src={getProductImageUrl(item.image, item.id)}
            alt={item.name}
            fill
            className="object-cover rounded-md"
          />
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-theme-primary line-clamp-2 flex-1">{item.name}</h3>
            <Link href={`/products/${item.id}`}>
              <button className="p-1 text-theme-muted hover:text-theme-primary hover:bg-theme-primary rounded transition-colors">
                <ArrowUpRight size={16} />
              </button>
            </Link>
          </div>

          {item.description && (
            <p className="text-sm text-theme-secondary mt-1 line-clamp-2">
              {item.description}
            </p>
          )}
          
          {/* Price and Quantity Controls */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-theme-primary">
                  ${item.quantity === 1 ? item.price.toFixed(2) : totalPrice.toFixed(2)}
                </span>
              </div>
              
              {/* Quantity Controls */}
              <div className="flex items-center border border-theme rounded-md bg-theme-primary">
                <button
                  onClick={() => handleQuantityChange(item.quantity - 1)}
                  className="px-3 py-2 bg-theme-primary hover:bg-theme-tertiary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Decrease quantity"
                  disabled={item.quantity <= 1}
                >
                  <Minus size={14} />
                </button>
                
                <span className="px-4 py-2 text-center font-medium min-w-[2rem] border-x border-theme bg-theme-primary">
                  {item.quantity}
                </span>
                
                <button
                  onClick={() => handleQuantityChange(item.quantity + 1)}
                  className="px-3 py-2 bg-theme-primary hover:bg-theme-tertiary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Increase quantity"
                  disabled={item.quantity >= stock}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Remove Button */}
            <button
              onClick={() => onRemove(item.id)}
              className="p-2 text-theme-muted hover:bg-theme-primary rounded-md transition-colors"
              aria-label="Remove from cart"
            >
              <Trash2 size={18} />
            </button>
          </div>
          
          {/* Stock Warning */}
          {item.quantity >= stock && (
            <p className="text-sm text-orange-600 mt-2">
              ⚠️ Maximum available quantity reached
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartItem;