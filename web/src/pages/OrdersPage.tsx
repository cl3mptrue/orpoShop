import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type Order } from '../lib/api';
import { toCatalogItem } from '../lib/catalog';
import { useProducts } from '../lib/products';
import { useStore } from '../lib/store';
import { formatDate, formatPrice } from '../lib/format';
import { ProductArt } from '../components/ProductArt';
import { ArrowRightIcon } from '../components/icons';

export const STATUS_LABELS: Record<string, { title: string; cls: string }> = {
  new: { title: 'Новый', cls: 'status--new' },
  paid: { title: 'Оплачен', cls: 'status--paid' },
  done: { title: 'Завершён', cls: 'status--done' },
  cancelled: { title: 'Отменён', cls: 'status--cancelled' },
};

export function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_LABELS[status] ?? { title: status, cls: '' };
  return <span className={`status ${meta.cls}`}>{meta.title}</span>;
}

export function OrdersPage() {
  const { session } = useStore();
  const { products, prices } = useProducts();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    api
      .myOrders()
      .then((data) => setOrders([...data].sort((a, b) => b.id - a.id)))
      .catch((e: Error) => setError(e.message));
  }, [session]);

  if (!session) {
    return (
      <div className="container auth">
        <div className="auth__card" style={{ textAlign: 'center' }}>
          <h1 className="auth__title">Мои заказы</h1>
          <p className="auth__sub">Войдите, чтобы увидеть историю заказов</p>
          <Link to="/login?next=/orders" className="btn btn--primary btn--block">
            Войти
          </Link>
          <div className="auth__switch">
            Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
          </div>
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
          <span>Мои заказы</span>
        </div>
        <h1 className="page-title">Мои заказы</h1>
      </div>

      {error && <div className="form-error">{error}</div>}

      {orders === null && !error ? (
        <div className="orders">
          <div className="skeleton" style={{ minHeight: 180 }} />
        </div>
      ) : orders && orders.length === 0 ? (
        <div className="empty" style={{ marginBottom: 56 }}>
          <div className="empty__title">Заказов пока нет</div>
          Оформите первый заказ — и он появится в этом списке.
          <div style={{ marginTop: 18 }}>
            <Link to="/catalog" className="btn btn--primary">
              Перейти в каталог
              <ArrowRightIcon size={16} />
            </Link>
          </div>
        </div>
      ) : (
        <div className="orders">
          {orders?.map((order) => {
            const lines = (order.items ?? []).map((item) => {
              const raw = products.find((p) => p.sku === item.product_sku);
              return { quantity: item.quantity, item: raw ? toCatalogItem(raw, prices) : null };
            });
            return (
              <article key={order.id} className="order">
                <div className="order__head">
                  <div>
                    <div className="order__id">Заказ №{order.id}</div>
                    <div className="order__date">от {formatDate(order.created_at)}</div>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                <div className="order__items">
                  {lines.map(({ item, quantity }) => (
                    <div key={item?.sku ?? Math.random()} className="order__item">
                      <span
                        className="order__thumb"
                        style={{ background: item?.tint ?? '#eee' }}
                      >
                        {item && <ProductArt category={item.category} tint={item.tint} size={28} />}
                      </span>
                      <span>
                        {item ? (
                          <Link to={`/catalog/${item.sku}`}>{item.name}</Link>
                        ) : (
                          <span className="muted">Товар недоступен</span>
                        )}
                        <div className="cart-line__meta">арт. {item?.sku}</div>
                      </span>
                      <span className="order__qty">{quantity} шт.</span>
                    </div>
                  ))}
                </div>

                <div className="order__foot">
                  <div className="row" style={{ gap: 14 }}>
                    {order.promo_code && <span className="chip">Промокод {order.promo_code}</span>}
                    <button
                      className="btn btn--ghost btn--sm"
                      onClick={() => {
                        const again = (order.items ?? []).map((i) => ({ product_sku: i.product_sku, quantity: i.quantity }));
                        session && again && navigator.clipboard && navigator.clipboard.writeText(JSON.stringify(again));
                      }}
                      style={{ display: 'none' }}
                    >
                      Повторить
                    </button>
                  </div>
                  <div className="row" style={{ gap: 16 }}>
                    <span className="muted">Итого</span>
                    <span className="price">{formatPrice(order.amount)}</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
