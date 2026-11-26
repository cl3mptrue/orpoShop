import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type Order, type Product, type Promo, type User } from '../lib/api';
import { EXTRA, EXTRA_NAMES, categoryTitle, toCatalogItem } from '../lib/catalog';
import { readPrices, rememberPrice, useProducts } from '../lib/products';
import { useStore } from '../lib/store';
import { formatDate, formatPrice } from '../lib/format';
import { StatusBadge } from './OrdersPage';
import { CheckIcon, PlusIcon, TrashIcon } from '../components/icons';

const TABS = [
  { id: 'products', title: 'Товары' },
  { id: 'orders', title: 'Заказы' },
  { id: 'promo', title: 'Промокоды' },
  { id: 'stock', title: 'Ассортимент' },
  { id: 'users', title: 'Пользователи' },
] as const;

const ORDER_STATUSES = ['new', 'paid', 'done', 'cancelled'];

export function AdminPage() {
  const { session, toast } = useStore();
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('products');

  if (!session || session.role !== 'admin') {
    return (
      <div className="container auth">
        <div className="auth__card" style={{ textAlign: 'center' }}>
          <h1 className="auth__title">Нет доступа</h1>
          <p className="auth__sub">Панель администратора доступна только администратору</p>
          <Link to="/" className="btn btn--primary btn--block">
            На главную
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-head">
        <div className="breadcrumbs">
          <Link to="/">Главная</Link>
          <span>/</span>
          <span>Администрирование</span>
        </div>
        <h1 className="page-title">Панель администратора</h1>
      </div>

      <div className="admin">
        <nav className="admin__nav">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`admin__tab${tab === t.id ? ' admin__tab--active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.title}
            </button>
          ))}
        </nav>
        <div>
          {tab === 'products' && <ProductsTab onToast={toast} />}
          {tab === 'orders' && <OrdersTab onToast={toast} />}
          {tab === 'promo' && <PromoTab onToast={toast} />}
          {tab === 'stock' && <StockTab onToast={toast} />}
          {tab === 'users' && <UsersTab onToast={toast} />}
        </div>
      </div>
    </div>
  );
}

function ProductsTab({ onToast }: { onToast: (m: string, k?: 'ok' | 'error') => void }) {
  const { products, reload, prices } = useProducts();
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [stock, setStock] = useState('10');
  const [price, setPrice] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.createProduct(sku.trim(), name.trim(), Number(stock), Number(price));
      rememberPrice(sku.trim(), Number(price));
      onToast('Товар создан');
      setSku('');
      setName('');
      setPrice('');
      reload();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const changePrice = async (target: string) => {
    const value = window.prompt(`Новая цена для ${target}, ₽`, String(readPrices()[target] ?? 0));
    if (!value) return;
    const num = Number(value.replace(',', '.'));
    if (!num || num <= 0) {
      onToast('Некорректная цена', 'error');
      return;
    }
    try {
      await api.changePrice(target, num);
      rememberPrice(target, num);
      onToast(`Цена обновлена: ${formatPrice(num)}`);
      reload();
    } catch (err) {
      onToast((err as Error).message, 'error');
    }
  };

  return (
    <>
      <div className="panel" style={{ marginBottom: 20 }}>
        <div className="panel__title">Новый товар</div>
        {error && <div className="form-error">{error}</div>}
        <form className="inline-form" onSubmit={create}>
          <div className="field">
            <label className="field__label">Артикул</label>
            <input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="MS-SKIN-001" required />
          </div>
          <div className="field">
            <label className="field__label">Название</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Крем с центеллой" required />
          </div>
          <div className="field">
            <label className="field__label">На складе, шт.</label>
            <input type="number" min={0} value={stock} onChange={(e) => setStock(e.target.value)} />
          </div>
          <div className="field">
            <label className="field__label">Цена, ₽</label>
            <input type="number" min={1} value={price} onChange={(e) => setPrice(e.target.value)} required />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <button className="btn btn--primary btn--sm" disabled={busy}>
              <PlusIcon size={16} /> {busy ? 'Создаём…' : 'Создать товар'}
            </button>
          </div>
        </form>
      </div>

      <div className="panel">
        <div className="panel__title">Товары ({products.length})</div>
        <table className="table">
          <thead>
            <tr>
              <th>Артикул</th>
              <th>Название</th>
              <th>Категория</th>
              <th>Остаток</th>
              <th>Цена</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const item = toCatalogItem(p, prices);
              return (
                <tr key={p.sku}>
                  <td style={{ fontVariantNumeric: 'tabular-nums' }}>{p.sku}</td>
                  <td>{p.name}</td>
                  <td className="muted">{categoryTitle(item.category)}</td>
                  <td>{p.in_stock}</td>
                  <td>{item.price ? formatPrice(item.price) : <span className="muted">—</span>}</td>
                  <td>
                    <button className="btn btn--ghost btn--sm" onClick={() => changePrice(p.sku)}>
                      Изменить цену
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {products.length === 0 && <p className="muted">Товаров пока нет</p>}
      </div>
    </>
  );
}

function OrdersTab({ onToast }: { onToast: (m: string, k?: 'ok' | 'error') => void }) {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [idInput, setIdInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .myOrders()
      .then((data) => setOrders([...data].sort((a, b) => b.id - a.id)))
      .catch((e: Error) => setError(e.message));
  }, []);

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = Number(idInput);
    if (!id) return;
    setError(null);
    try {
      const found = await api.order(id);
      setOrders((prev) => [found, ...(prev ?? []).filter((o) => o.id !== found.id)]);
      setIdInput('');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const setStatus = async (id: number, status: string) => {
    try {
      await api.updateOrderStatus(id, status);
      onToast(`Статус заказа №${id} обновлён`);
      setOrders((prev) => prev?.map((o) => (o.id === id ? { ...o, status } : o)) ?? prev);
    } catch (err) {
      onToast((err as Error).message, 'error');
    }
  };

  return (
    <div className="panel">
      <div className="panel__title">Заказы</div>
      <form className="promo-form" onSubmit={lookup}>
        <input
          value={idInput}
          onChange={(e) => setIdInput(e.target.value)}
          placeholder="Номер заказа"
          type="number"
          min={1}
          aria-label="Номер заказа"
        />
        <button className="btn btn--ghost btn--sm">Найти заказ</button>
      </form>
      {error && <div className="form-error">{error}</div>}
      {orders === null ? (
        <div className="skeleton" style={{ minHeight: 140 }} />
      ) : orders.length === 0 ? (
        <p className="muted">Заказов пока нет</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>№</th>
              <th>Покупатель</th>
              <th>Дата</th>
              <th>Позиции</th>
              <th>Сумма</th>
              <th>Статус</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.user_email}</td>
                <td className="muted">{formatDate(o.created_at)}</td>
                <td>{(o.items ?? []).reduce((s, i) => s + i.quantity, 0)}</td>
                <td>{formatPrice(o.amount)}</td>
                <td>
                  <StatusBadge status={o.status} />
                </td>
                <td>
                  <select
                    className="select"
                    style={{ height: 34, fontSize: 13 }}
                    value={o.status}
                    onChange={(e) => setStatus(o.id, e.target.value)}
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function PromoTab({ onToast }: { onToast: (m: string, k?: 'ok' | 'error') => void }) {
  const [count, setCount] = useState('1');
  const [discount, setDiscount] = useState('10');
  const [days, setDays] = useState('30');
  const [created, setCreated] = useState<Promo[]>([]);

  const generate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createPromos(Number(count), Number(discount), Number(days));
      setCreated(res);
      onToast(`Создано промокодов: ${res.length}`);
    } catch (err) {
      onToast((err as Error).message, 'error');
    }
  };

  return (
    <>
      <div className="panel" style={{ marginBottom: 20 }}>
        <div className="panel__title">Генерация промокодов</div>
        <form className="inline-form" onSubmit={generate}>
          <div className="field">
            <label className="field__label">Количество</label>
            <input type="number" min={1} value={count} onChange={(e) => setCount(e.target.value)} />
          </div>
          <div className="field">
            <label className="field__label">Скидка, %</label>
            <input type="number" min={1} max={100} value={discount} onChange={(e) => setDiscount(e.target.value)} />
          </div>
          <div className="field">
            <label className="field__label">Срок, дней</label>
            <input type="number" min={1} value={days} onChange={(e) => setDays(e.target.value)} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <button className="btn btn--primary btn--sm">Сгенерировать</button>
          </div>
        </form>
      </div>

      <div className="panel">
        <div className="panel__title">Созданные промокоды</div>
        {created.length === 0 ? (
          <p className="muted">Сгенерированные в этой сессии коды появятся здесь</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Код</th>
                <th>Скидка</th>
                <th>Действует до</th>
              </tr>
            </thead>
            <tbody>
              {created.map((p) => (
                <tr key={p.code}>
                  <td>
                    <code>{p.code}</code>
                  </td>
                  <td>{p.is_percent ? `${p.discount}%` : formatPrice(p.discount)}</td>
                  <td className="muted">{formatDate(p.valid_to)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

function StockTab({ onToast }: { onToast: (m: string, k?: 'ok' | 'error') => void }) {
  const { products, reload } = useProducts();
  const [busy, setBusy] = useState<string | null>(null);
  const present = new Set(products.map((p) => p.sku));
  const missing = Object.keys(EXTRA).filter((sku) => !present.has(sku));

  const add = async (sku: string) => {
    setBusy(sku);
    try {
      const meta = EXTRA[sku];
      const product: Product = await api.createProduct(sku, EXTRA_NAMES[sku], 15, meta.price);
      rememberPrice(product.sku, meta.price);
      onToast(`«${product.name}» добавлен в каталог`);
      reload();
    } catch (err) {
      onToast((err as Error).message, 'error');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="panel">
      <div className="panel__title">Добавить позиции из ассортимента Miroy Shop</div>
      <p className="muted" style={{ marginBottom: 16 }}>
        Дополнительные товары создаются через POST /api/products/create с ценой из справочника каталога.
      </p>
      {missing.length === 0 ? (
        <p className="row" style={{ gap: 8 }}>
          <CheckIcon size={16} /> Весь ассортимент уже в каталоге
        </p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Артикул</th>
              <th>Название</th>
              <th>Категория</th>
              <th>Цена</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {missing.map((sku) => {
              const meta = EXTRA[sku];
              return (
                <tr key={sku}>
                  <td>{sku}</td>
                  <td>{EXTRA_NAMES[sku]}</td>
                  <td className="muted">{categoryTitle(meta.category)}</td>
                  <td>{formatPrice(meta.price)}</td>
                  <td>
                    <button className="btn btn--primary btn--sm" disabled={busy === sku} onClick={() => add(sku)}>
                      <TrashIcon size={0} />
                      {busy === sku ? 'Добавляем…' : 'Добавить'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

function UsersTab({ onToast }: { onToast: (m: string, k?: 'ok' | 'error') => void }) {
  const [users, setUsers] = useState<User[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    () =>
      api
        .users()
        .then(setUsers)
        .catch((e: Error) => setError(e.message)),
    [],
  );

  useEffect(() => {
    load();
  }, [load]);

  const activeAdmins = users?.filter((u) => u.role === 'admin' && u.is_active).length ?? 0;

  const toggle = async (user: User) => {
    const nextActive = !user.is_active;
    try {
      if (nextActive) await api.activateUser(user.email);
      else await api.deactivateUser(user.email);
      setUsers((prev) => prev?.map((u) => (u.email === user.email ? { ...u, is_active: nextActive } : u)) ?? prev);
      onToast(nextActive ? 'Учётная запись активирована' : 'Учётная запись деактивирована');
    } catch (err) {
      onToast((err as Error).message, 'error');
    }
  };

  return (
    <div className="panel">
      <div className="panel__title">Учётные записи</div>
      {error && <div className="form-error">{error}</div>}
      {users === null ? (
        <div className="skeleton" style={{ minHeight: 120 }} />
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Почта</th>
              <th>ФИО</th>
              <th>Роль</th>
              <th>Статус</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isLastAdmin = u.role === 'admin' && u.is_active && activeAdmins <= 1;
              return (
                <tr key={u.email}>
                  <td>{u.email}</td>
                  <td>{u.fio}</td>
                  <td>
                    <span className={`status ${u.role === 'admin' ? 'status--paid' : 'status--new'}`}>
                      {u.role === 'admin' ? 'Администратор' : 'Покупатель'}
                    </span>
                  </td>
                  <td>
                    <span className={`status ${u.is_active ? 'status--paid' : 'status--cancelled'}`}>
                      {u.is_active ? 'Активна' : 'Деактивирована'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn--ghost btn--sm"
                      onClick={() => toggle(u)}
                      disabled={isLastAdmin}
                      title={isLastAdmin ? 'Нельзя деактивировать единственного администратора' : undefined}
                    >
                      {u.is_active ? 'Деактивировать' : 'Активировать'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
