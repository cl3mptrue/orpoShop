import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, decodeToken, getToken, setToken, type Role } from './lib/api';
import { StoreContext, type CartLine, type Session } from './lib/store';

const CART_KEY = 'miroy.cart';

function readCart(): CartLine[] {
  try {
    const raw = JSON.parse(localStorage.getItem(CART_KEY) ?? '[]');
    return Array.isArray(raw) ? raw.filter((l) => l && typeof l.sku === 'string') : [];
  } catch {
    return [];
  }
}

function sessionFromToken(token: string | null): Session | null {
  const payload = decodeToken(token);
  if (!payload?.email) return null;
  return { email: payload.email, role: (payload.role as Role) ?? 'user' };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => sessionFromToken(getToken()));
  const [cart, setCart] = useState<CartLine[]>(readCart);
  const [toastState, setToastState] = useState<{ id: number; text: string; kind: 'ok' | 'error' } | null>(null);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (!toastState) return;
    const timer = setTimeout(() => setToastState(null), 3200);
    return () => clearTimeout(timer);
  }, [toastState]);

  const login = useCallback(async (email: string, password: string) => {
    const { token } = await api.login(email, password);
    setToken(token);
    setSession(sessionFromToken(token));
  }, []);

  const register = useCallback(async (email: string, password: string, fio: string) => {
    await api.register(email, password, fio);
    await login(email, password);
  }, [login]);

  const logout = useCallback(() => {
    setToken(null);
    setSession(null);
  }, []);

  const addToCart = useCallback((sku: string, quantity = 1) => {
    setCart((prev) => {
      const found = prev.find((l) => l.sku === sku);
      if (!found) return [...prev, { sku, quantity }];
      return prev.map((l) => (l.sku === sku ? { ...l, quantity: l.quantity + quantity } : l));
    });
  }, []);

  const setQuantity = useCallback((sku: string, quantity: number) => {
    setCart((prev) =>
      quantity <= 0
        ? prev.filter((l) => l.sku !== sku)
        : prev.map((l) => (l.sku === sku ? { ...l, quantity } : l)),
    );
  }, []);

  const removeFromCart = useCallback((sku: string) => {
    setCart((prev) => prev.filter((l) => l.sku !== sku));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const toast = useCallback((text: string, kind: 'ok' | 'error' = 'ok') => {
    setToastState({ id: Date.now(), text, kind });
  }, []);

  const value = useMemo(
    () => ({
      session,
      login,
      register,
      logout,
      cart,
      cartCount: cart.reduce((sum, l) => sum + l.quantity, 0),
      addToCart,
      setQuantity,
      removeFromCart,
      clearCart,
      toast,
    }),
    [session, login, register, logout, cart, addToCart, setQuantity, removeFromCart, clearCart, toast],
  );

  return (
    <StoreContext.Provider value={value}>
      {children}
      {toastState && (
        <div className={`toast toast--${toastState.kind}`} role="status">
          {toastState.text}
        </div>
      )}
    </StoreContext.Provider>
  );
}
