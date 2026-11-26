import { SEED, EXTRA, EXTRA_NAMES } from '../web/src/lib/catalog';

const BASE = process.env.API_URL ?? 'http://localhost:8080/api';
const ADMIN = { email: 'admin@miroy.ru', password: 'MiroyAdmin#2026' };
const DEMO = { email: 'maria@miroy.ru', password: 'MiroyBuyer#2026', fio: 'Иванова Мария Сергеевна' };

async function call<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  const res = await fetch(BASE + path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(`${init.method ?? 'GET'} ${path} → ${res.status} ${data?.error ?? ''}`);
  return data as T;
}

const post = <T>(p: string, body: unknown, token?: string) =>
  call<T>(p, { method: 'POST', body: JSON.stringify(body) }, token);

async function login(email: string, password: string): Promise<string> {
  const { token } = await post<{ token: string }>('/users/login', { email, password });
  return token;
}

async function ensureAdmin(): Promise<string> {
  try {
    await post('/users/register', { email: ADMIN.email, ...ADMIN, fio: 'Администратор Miroy Shop' });
    console.log(`admin created: ${ADMIN.email}`);
  } catch (e) {
    console.log(`admin exists: ${(e as Error).message}`);
  }
  return login(ADMIN.email, ADMIN.password);
}

async function ensureBuyer() {
  try {
    await post('/users/register', { email: DEMO.email, password: DEMO.password, fio: DEMO.fio });
    console.log(`buyer created: ${DEMO.email}`);
  } catch (e) {
    console.log(`buyer exists: ${(e as Error).message}`);
  }
}

async function seedProducts(token: string) {
  const existing = new Set((await call<{ sku: string }[]>('/products/GetAll')).map((p) => p.sku));
  const all = [
    ...SEED,
    ...Object.entries(EXTRA).map(([sku, meta]) => ({
      sku,
      name: EXTRA_NAMES[sku],
      price: meta.price,
      in_stock: 15,
    })),
  ];
  for (const p of all) {
    if (existing.has(p.sku)) continue;
    await post('/products/create', { sku: p.sku, name: p.name, in_stock: p.in_stock, price: p.price }, token);
    console.log(`product: ${p.sku} ${p.name} — ${p.price} ₽`);
  }
}

async function main() {
  const token = await ensureAdmin();

  const users = await call<{ email: string; role: string }[]>('/users/GetAll');
  const admin = users.find((u) => u.email === ADMIN.email);
  console.log(`admin role in DB: ${admin?.role ?? 'unknown'} (нужен role=admin)`);

  await ensureBuyer();

  if (admin?.role !== 'admin') {
    console.warn(`\n⚠ Пользователь ${ADMIN.email} имеет роль "${admin?.role}". Выполните:\n  psql "$DATABASE_URL" -c "UPDATE users SET role='admin' WHERE email='${ADMIN.email}'"\n`);
  }
  await seedProducts(token);

  const [promo] = await post<{ code: string; discount: number }[]>(
    '/promo/create',
    { count: 1, discount: 10, valid_days: 30 },
    token,
  );
  console.log(`promo: ${promo.code} (−${promo.discount}%)`);

  const total = (await call<unknown[]>('/products/GetAll')).length;
  console.log(`\nГотово. Товаров в каталоге: ${total}`);
  console.log(`Админ: ${ADMIN.email} / ${ADMIN.password}`);
  console.log(`Покупатель: ${DEMO.email} / ${DEMO.password}`);
  console.log(`Промокод: ${promo.code}`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
