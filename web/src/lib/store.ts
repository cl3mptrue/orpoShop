import { createContext, useContext } from 'react';
import type { Role } from './api';

export type CartLine = { sku: string; quantity: number };

export type Session = {
  email: string;
  role: Role;
};

export type StoreValue = {
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fio: string) => Promise<void>;
  logout: () => void;
  cart: CartLine[];
  cartCount: number;
  addToCart: (sku: string, quantity?: number) => void;
  setQuantity: (sku: string, quantity: number) => void;
  removeFromCart: (sku: string) => void;
  clearCart: () => void;
  toast: (message: string, kind?: 'ok' | 'error') => void;
};

export const StoreContext = createContext<StoreValue | null>(null);

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('StoreProvider is missing');
  return ctx;
}
