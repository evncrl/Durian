import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser } from '@/contexts/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: any;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  updateQuantity: (id: string, quantity: number) => void; // <-- added
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [userCarts, setUserCarts] = useState<Record<string, CartItem[]>>({});
  const { user } = useUser();
  const cart = user ? userCarts[user.id] || [] : [];

  // Load cart from AsyncStorage on login
  useEffect(() => {
    const loadCart = async () => {
      if (user && user.id) {
        try {
          const stored = await AsyncStorage.getItem(`cart_${user.id}`);
          if (stored) {
            setUserCarts(prev => ({ ...prev, [user.id]: JSON.parse(stored) }));
          }
        } catch (e) {
          console.error('Failed to load cart from storage', e);
        }
      }
    };
    loadCart();
  }, [user?.id]);

  // Save cart to AsyncStorage whenever it changes
  useEffect(() => {
    if (user && user.id) {
      AsyncStorage.setItem(`cart_${user.id}`, JSON.stringify(cart)).catch(e => {
        console.error('Failed to save cart to storage', e);
      });
    }
  }, [cart, user?.id]);

  const addToCart = (item: CartItem) => {
    if (!user) return;
    setUserCarts(prev => {
      const currentCart = prev[user.id] || [];
      const existing = currentCart.find(p => p.id === item.id);
      let updatedCart;
      if (existing) {
        updatedCart = currentCart.map(p =>
          p.id === item.id ? { ...p, quantity: p.quantity + 1 } : p
        );
      } else {
        updatedCart = [...currentCart, { ...item, quantity: 1 }];
      }
      return {
        ...prev,
        [user.id]: updatedCart
      };
    });
  };

  const removeFromCart = (id: string) => {
    if (!user) return;
    setUserCarts(prev => {
      const currentCart = prev[user.id] || [];
      const updatedCart = currentCart.filter(p => p.id !== id);
      return {
        ...prev,
        [user.id]: updatedCart
      };
    });
  };

  const clearCart = () => {
    if (!user) return;
    setUserCarts(prev => ({
      ...prev,
      [user.id]: []
    }));
    AsyncStorage.removeItem(`cart_${user.id}`).catch(e => {
      console.error('Failed to clear cart from storage', e);
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
  if (!user || quantity < 1) return;

  setUserCarts(prev => {
    const currentCart = prev[user.id] || [];

    const updatedCart = currentCart.map(p =>
      p.id === id ? { ...p, quantity } : p
    );

    return {
      ...prev,
      [user.id]: updatedCart
    };
  });
};

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, updateQuantity }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};