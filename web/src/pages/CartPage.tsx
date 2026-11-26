import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, type Order } from '../lib/api';
import { toCatalogItem } from '../lib/catalog';
import { useProducts } from '../lib/products';
import { useStore } from '../lib/store';
import { formatPrice } from '../lib/format';
import { MinusIcon, PlusIcon, TrashIcon, CloseIcon, CheckIcon, LockIcon, ArrowRightIcon } from '../components/icons';
import { ProductArt } from '../components/ProductArt';

const FREE_SHIPPING = 5000;
const SHIPPING_COST = 390;

export function CartPage() {
  const { cart, session, setQuantity, removeFromCart, clearCart, toast } = useStore();
  const { products, loading, prices } = useProducts();
  const navigate = useNavigate();

  const [promoInput, setPromoInput] = useState('');
  const [promo, setPromo] = useState<{ code: string; discount: number; is_percent: boolean } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoOpen, setPromoOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const lines = useMemo(
    () =>
      cart
        .map((line) => {
          const raw = products.find((p) => p.sku === line.sku);
          return raw ? { item: toCatalogItem(raw, prices), quantity: line.quantity } : null;
        })
        .filter(Boolean) as { item: ReturnType<typeof toCatalogItem>; quantity: number }[],
    [cart, products, prices],
  );

  useEffect(() => {
    for (const { item, quantity } of lines) {
      if (quantity > item.in_stock) setQuantity(item.sku, item.in_stock);
    }
  }, [lines, setQuantity]);

  const subtotal = lines.reduce((sum, l) => sum + l.item.price * l.quantity, 0);
  const shipping = subtotal >= FREE_SHIPPING || subtotal === 0 ? 0 : SHIPPING_COST;
  const discount = promo
    ? promo.is_percent
      ? Math.round((subtotal * promo.discount) / 100)
      : Math.min(promo.discount, subtotal)
    : 0;
  const total = Math.max(0, subtotal - discount + shipping);

  const applyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    if (!session) {
      toast('Войдите, чтобы применить промокод', 'error');
      navigate('/login?next=/cart');
      return;
    }
    setPromoLoading(true);
    setPromoError(null);
    try {
      const res = await api.validatePromo(code);
      setPromo(res);
      setPromoInput('');
    } catch (err) {
      setPromoError((err as Error).message);
      setPromo(null);
    } finally {
      setPromoLoading(false);
    }
  };

  const checkout = async () => {
    if (!session) {
      navigate('/login?next=/cart');
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const order = await api.createOrder(
        lines.map((l) => ({ product_sku: l.item.sku, quantity: l.quantity })),
        promo?.code,
      );
      clearCart();
      toast(`Заказ №${order.id} оформлен`);
      navigate('/orders');
    } catch (err) {
      setSubmitError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '26px 0' }}>
        <div className="skeleton" style={{ minHeight: 360 }} />
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-head">
        <div className="breadcrumbs">
          <Link to="/">Главная</Link>
          <span>/</span>
          <span>Корзина</span>
        </div>
        <h1 className="page-title">Корзина</h1>
        {lines.length > 0 && (
          <p className="muted" style={{ marginTop: 6 }}>
            {lines.length} {lines.length === 1 ? 'товар' : 'товара'} в корзине
          </p>
        )}
      </div>

      {lines.length === 0 ? (
        <div className="empty" style={{ marginBottom: 56 }}>
          <div className="empty__title">Ваша корзина пуста</div>
          Добавьте товары из каталога, чтобы оформить заказ.
          <div style={{ marginTop: 18 }}>
            <Link to="/catalog" className="btn btn--primary">
              Перейти в каталог
              <ArrowRightIcon size={16} />
            </Link>
          </div>
        </div>
      ) : (
        <div className="cart">
          <div>
            <div className="panel">
              {lines.map(({ item, quantity }) => (
                <div key={item.sku} className="cart-line">
                  <Link to={`/catalog/${item.sku}`} className="cart-line__media" style={{ background: item.tint }}>
                    <ProductArt category={item.category} tint={item.tint} size={56} />
                  </Link>
                  <div>
                    <Link to={`/catalog/${item.sku}`} className="cart-line__name">
                      {item.name}
                    </Link>
                    <div className="cart-line__meta">
                      {item.brand} · {item.volume} · арт. {item.sku}
                    </div>
                    <button className="cart-line__remove" onClick={() => removeFromCart(item.sku)}>
                      <TrashIcon size={14} /> Удалить
                    </button>
                  </div>
                  <div className="stepper">
                    <button
                      onClick={() => setQuantity(item.sku, quantity - 1)}
                      aria-label="Меньше"
                    >
                      <MinusIcon size={14} />
                    </button>
                    <span className="stepper__value">{quantity}</span>
                    <button
                      onClick={() => setQuantity(item.sku, Math.min(item.in_stock, quantity + 1))}
                      disabled={quantity >= item.in_stock}
                      aria-label="Больше"
                    >
                      <PlusIcon size={14} />
                    </button>
                  </div>
                  <div className="cart-line__price">{formatPrice(item.price * quantity)}</div>
                </div>
              ))}
            </div>

            <div className="panel" style={{ marginTop: 16 }}>
              <div className="panel__title">Комментарий к заказу</div>
              <div className="field" style={{ marginBottom: 0 }}>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Например: удобное время доставки"
                  style={{ height: 'auto', padding: '12px 14px', resize: 'vertical' }}
                />
              </div>
            </div>
          </div>

          <aside className="panel">
            <div className="panel__title">Оформление заказа</div>

            {promo ? (
              <div className="promo-ok">
                <span>
                  Промокод <b>{promo.code}</b> применён (−
                  {promo.is_percent ? `${promo.discount}%` : formatPrice(promo.discount)})
                </span>
                <button onClick={() => setPromo(null)} aria-label="Убрать промокод">
                  <CloseIcon size={14} />
                </button>
              </div>
            ) : (
              <>
                {!promoOpen ? (
                  <button className="btn btn--muted btn--block" style={{ marginBottom: 16 }} onClick={() => setPromoOpen(true)}>
                    Применить промокод
                  </button>
                ) : (
                  <form className="promo-form" onSubmit={applyPromo}>
                    <input
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      placeholder="XXXX-XXXX-XXXX"
                      aria-label="Промокод"
                    />
                    <button className="btn btn--primary btn--sm" disabled={promoLoading}>
                      {promoLoading ? '…' : 'ОК'}
                    </button>
                  </form>
                )}
                {promoError && <div className="form-error">{promoError}</div>}
              </>
            )}

            <div className="summary__row">
              <span>Товары, {lines.reduce((s, l) => s + l.quantity, 0)} шт.</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="summary__row" style={{ color: 'var(--accent)' }}>
                <span>Скидка по промокоду</span>
                <span>−{formatPrice(discount)}</span>
              </div>
            )}
            <div className="summary__row">
              <span>Доставка</span>
              <span>{shipping === 0 ? 'Бесплатно' : formatPrice(shipping)}</span>
            </div>
            <div className="summary__row summary__row--total">
              <span>Итого</span>
              <span>{formatPrice(total)}</span>
            </div>

            {submitError && <div className="form-error" style={{ marginTop: 14 }}>{submitError}</div>}

            <button className="btn btn--primary btn--block" style={{ marginTop: 18 }} onClick={checkout} disabled={submitting}>
              {submitting ? 'Оформляем…' : session ? 'Оформить заказ' : 'Войти и оформить'}
            </button>

            <div className="summary__note">
              <span className="row" style={{ justifyContent: 'center', gap: 6 }}>
                <LockIcon size={13} /> Безопасная оплата
                <CheckIcon size={13} /> Данные защищены
              </span>
            </div>
            {subtotal < FREE_SHIPPING && (
              <div className="summary__note">
                До бесплатной доставки: {formatPrice(FREE_SHIPPING - subtotal)}
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

export type { Order };
