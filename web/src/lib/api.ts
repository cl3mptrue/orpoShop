export type User = {
  email: string;
  fio: string;
  role: Role | string;
  is_active: boolean;
};

export type Product = {
  sku: string;
  name: string;
  status: string;
  in_stock: number;
};

export type Promo = {
  code: string;
  discount: number;
  is_percent: boolean;
  created_at: string;
  valid_to: string;
};

export type OrderItem = {
  order_id: number;
  product_sku: string;
  quantity: number;
};

export type Order = {
  id: number;
  user_email: string;
  promo_code?: string | null;
  status: string;
  created_at: string;
  amount: number;
  items?: OrderItem[];
};

export type Role = 'admin' | 'user';

export type TokenPayload = {
  email?: string;
  role?: Role;
  sub?: string;
};

const TOKEN_KEY = 'miroy.token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function decodeToken(token: string | null): TokenPayload | null {
  if (!token) return null;
  try {
    const part = token.split('.')[1];
    const json = atob(part.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    return null;
  }
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const ERROR_MAP: Record<string, string> = {
  'invalid email or password': 'Неверная почта или пароль',
  'user not found': 'Пользователь не найден',
  'user is not active': 'Учётная запись деактивирована',
  'user already exists': 'Пользователь с такой почтой уже существует',
  'email cannot be empty': 'Укажите почту',
  'fio cannot be empty': 'Укажите ФИО',
  'password does not meet complexity requirements':
    'Пароль слишком простой: минимум 12 символов, строчная и заглавная буквы, цифра и спецсимвол',
  'product already exists': 'Товар с таким артикулом уже существует',
  'product not found': 'Товар не найден',
  'promocode not found': 'Промокод не найден',
  'promocode expired': 'Срок действия промокода истёк',
  'missing token': 'Требуется вход в аккаунт',
  'invalid token': 'Сессия истекла, войдите повторно',
  forbidden: 'Недостаточно прав',
  'order not found': 'Заказ не найден',
};

export function localizeError(raw: string): string {
  const key = Object.keys(ERROR_MAP).find((k) => raw.includes(k));
  return key ? ERROR_MAP[key] : raw;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body) headers.set('Content-Type', 'application/json');
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const body = init.body ?? null;
  const res = await fetch(`/api${path}`, { ...init, headers, body });
  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    if (res.status === 401 && token) setToken(null);
    throw new ApiError(localizeError(data?.error ?? `Ошибка ${res.status}`), res.status);
  }
  return data as T;
}

export const api = {
  register: (email: string, password: string, fio: string) =>
    request<User>('/users/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, fio }),
    }),

  login: (email: string, password: string) =>
    request<{ token: string }>('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  products: () => request<Product[]>('/products/GetAll'),

  createProduct: (sku: string, name: string, inStock: number, price: number) =>
    request<Product>('/products/create', {
      method: 'POST',
      body: JSON.stringify({ sku, name, in_stock: inStock, price }),
    }),

  changePrice: (sku: string, price: number) =>
    request<void>(`/products/${encodeURIComponent(sku)}/price`, {
      method: 'PUT',
      body: JSON.stringify({ price }),
    }),

  validatePromo: (code: string) =>
    request<Promo>('/promo/validate', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),

  createPromos: (count: number, discount: number, validDays: number) =>
    request<Promo[]>('/promo/create', {
      method: 'POST',
      body: JSON.stringify({ count, discount, valid_days: validDays }),
    }),

  createOrder: (items: { product_sku: string; quantity: number }[], promoCode?: string) =>
    request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify({ items, promo_code: promoCode || null }),
    }),

  myOrders: () => request<Order[]>('/orders/my'),

  order: (id: number) => request<Order>(`/orders/${id}`),

  updateOrderStatus: (id: number, status: string) =>
    request<Order>(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  // Бэкенд отдаёт PUT /users/{email}/delete и /activate — переключают учётную запись.
  deactivateUser: (email: string) =>
    request<void>(`/users/${encodeURIComponent(email)}/delete`, { method: 'PUT' }),

  activateUser: (email: string) =>
    request<void>(`/users/${encodeURIComponent(email)}/activate`, { method: 'PUT' }),

  users: () => request<User[]>('/users/GetAll'),
};
