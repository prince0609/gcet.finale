import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CartItem, Product } from '@/types';
import { differenceInDays, differenceInHours, differenceInWeeks } from 'date-fns';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, startDate: Date, endDate: Date, quantity: number, rentalPeriod: 'hourly' | 'daily' | 'weekly') => void;
  removeItem: (itemId: string) => void;
  updateItem: (itemId: string, updates: Partial<CartItem>) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTax: () => number;
  getSecurityDeposit: () => number;
  getTotal: () => number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const TAX_RATE = 0.18; // 18% GST
const SECURITY_DEPOSIT_RATE = 0.10; // 10%

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const calculatePeriodCount = (startDate: Date, endDate: Date, period: 'hourly' | 'daily' | 'weekly'): number => {
    switch (period) {
      case 'hourly':
        return Math.max(1, differenceInHours(endDate, startDate));
      case 'daily':
        return Math.max(1, differenceInDays(endDate, startDate));
      case 'weekly':
        return Math.max(1, differenceInWeeks(endDate, startDate));
      default:
        return 1;
    }
  };

  const addItem = (
    product: Product,
    startDate: Date,
    endDate: Date,
    quantity: number,
    rentalPeriod: 'hourly' | 'daily' | 'weekly'
  ) => {
    const newItem: CartItem = {
      id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      product,
      quantity,
      rentalPeriod,
      startDate,
      endDate,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateItem = (itemId: string, updates: Partial<CartItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, ...updates } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getItemTotal = (item: CartItem): number => {
    const periodCount = calculatePeriodCount(item.startDate, item.endDate, item.rentalPeriod);
    const unitPrice = item.product.pricing[item.rentalPeriod];
    return unitPrice * periodCount * item.quantity;
  };

  const getSubtotal = (): number => {
    return items.reduce((sum, item) => sum + getItemTotal(item), 0);
  };

  const getTax = (): number => {
    return getSubtotal() * TAX_RATE;
  };

  const getSecurityDeposit = (): number => {
    return getSubtotal() * SECURITY_DEPOSIT_RATE;
  };

  const getTotal = (): number => {
    return getSubtotal() + getTax() + getSecurityDeposit();
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateItem,
        clearCart,
        getSubtotal,
        getTax,
        getSecurityDeposit,
        getTotal,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
