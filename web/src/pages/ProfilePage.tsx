import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type Order } from '../lib/api';
import { useStore } from '../lib/store';
import { formatDate, formatPrice } from '../lib/format';
import { StatusBadge } from './OrdersPage';
import { ArrowRightIcon } from '../components/icons';

export function ProfilePage() {
  const { session, logout } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!session) return;
    api.myOrders().then(setOrders).catch(() => setOrders([]));
  }, [session]);

  if (!session) {
    return (
      <div className="container auth">
        <div className="auth__card" style={{ textAlign: 'center' }}>
          <h1 className="auth__title">Личный кабинет</h1>
          <p className="auth__sub">Войдите, чтобы открыть профиль</p>
          <Link to="/login?next=/profile" className="btn btn--primary btn--block">
            Войти
          </Link>
        </div>
      </div>
    );
  }

  const spent = orders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.amount, 0);

  return (
    <div className="container">
      <div className="page-head">
        <div className="breadcrumbs">
          <Link to="/">Главная</Link>
          <span>/</span>
          <span>Профиль</span>
        </div>
        <h1 className="page-title">Личный кабинет</h1>
      </div>

      <div className="cart" style={{ paddingTop: 4 }}>
        <div className="panel">
          <div className="panel__title">Данные аккаунта</div>
          <div className="summary__row">
            <span>Электронная почта</span>
            <span style={{ color: 'var(--ink)' }}>{session.email}</span>
          </div>
          <div className="summary__row">
            <span>Роль</span>
            <span style={{ color: 'var(--ink)' }}>{session.role === 'admin' ? 'Администратор' : 'Покупатель'}</span>
          </div>
          <div className="summary__row">
            <span>Всего заказов</span>
            <span style={{ color: 'var(--ink)' }}>{orders.length}</span>
          </div>
          <div className="summary__row">
            <span>Сумма покупок</span>
            <span style={{ color: 'var(--ink)' }}>{formatPrice(spent)}</span>
          </div>

          <div className="row" style={{ marginTop: 20, gap: 10 }}>
            <Link to="/orders" className="btn btn--primary btn--sm">
              Мои заказы
            </Link>
            {session.role === 'admin' && (
              <Link to="/admin" className="btn btn--ghost btn--sm">
                Панель администратора
              </Link>
            )}
            <button className="btn btn--muted btn--sm" onClick={logout}>
              Выйти
            </button>
          </div>
        </div>

        <aside className="panel">
          <div className="panel__title">Последние заказы</div>
          {orders.length === 0 ? (
            <p className="muted">
              Пока нет заказов.{' '}
              <Link to="/catalog" style={{ color: 'var(--accent)' }}>
                Перейти в каталог
              </Link>
            </p>
          ) : (
            <div className="stack">
              {[...orders]
                .sort((a, b) => b.id - a.id)
                .slice(0, 5)
                .map((o) => (
                  <div key={o.id} className="row" style={{ justifyContent: 'space-between', gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 500 }}>№{o.id}</div>
                      <div className="cart-line__meta">{formatDate(o.created_at)}</div>
                    </div>
                    <span className="row" style={{ gap: 10 }}>
                      <StatusBadge status={o.status} />
                      <b>{formatPrice(o.amount)}</b>
                    </span>
                  </div>
                ))}
              <Link to="/orders" className="row muted" style={{ marginTop: 6, gap: 6 }}>
                Все заказы <ArrowRightIcon size={14} />
              </Link>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
