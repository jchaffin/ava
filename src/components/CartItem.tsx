import React from 'react';
import Image from 'next/image';
import { Trash2, Plus, Minus } from 'lucide-react';

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
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      {/* Product Image */}
      <div className="relative w-20 h-20 flex-shrink-0">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover rounded-md"
        />
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>

        {item.description && (
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {item.description}
          </p>
        )}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-lg font-bold text-gray-900">
            ${item.quantity === 1 ? item.price.toFixed(2) : totalPrice.toFixed(2)}
          </span>
        </div>
        {/* Stock Warning */}
        {item.quantity >= stock && (
          <p className="text-sm text-orange-600 mt-2">
            ⚠️ Maximum available quantity reached
          </p>
        )}
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleQuantityChange(item.quantity - 1)}
          className="p-1 rounded-md hover:bg-gray-100 transition-colors"
          aria-label="Decrease quantity"
          disabled={item.quantity <= 1}
        >
          <Minus size={16} />
        </button>
        
        <span className="w-8 text-center font-medium">{item.quantity}</span>
        
        <button
          onClick={() => handleQuantityChange(item.quantity + 1)}
          className="p-1 rounded-md hover:bg-gray-100 transition-colors"
          aria-label="Increase quantity"
          disabled={item.quantity >= stock}
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Remove Button */}
      <button
        onClick={() => onRemove(item.id)}
        className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
        aria-label="Remove from cart"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
};

export default CartItem;