import { useEffect, useState } from 'react';
import { api } from './api';

const PRICES_KEY = 'miroy.prices';

export function readPrices(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(PRICES_KEY) ?? '{}');
  } catch {
    return {};
  }
}

export function rememberPrice(sku: string, price: number) {
  localStorage.setItem(PRICES_KEY, JSON.stringify({ ...readPrices(), [sku]: price }));
}

export function useProducts() {
  const [products, setProducts] = useState<Awaited<ReturnType<typeof api.products>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = () => {
    setLoading(true);
    api
      .products()
      .then((data) => {
        setProducts(data);
        setError(null);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(reload, []);

  return { products, loading, error, reload, prices: readPrices() };
}
