import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toCatalogItem } from '../lib/catalog';
import { useProducts } from '../lib/products';
import { useStore } from '../lib/store';
import { formatPrice, plural } from '../lib/format';
import { ProductArt } from '../components/ProductArt';
import { Rating } from '../components/ProductCard';
import { ArrowRightIcon, CheckIcon, CycleIcon, HeartIcon, MinusIcon, PlusIcon, BoxIcon } from '../components/icons';

export function ProductPage() {
  const { sku = '' } = useParams();
  const { products, loading, prices } = useProducts();
  const { addToCart, toast } = useStore();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState(0);

  const raw = products.find((p) => p.sku === sku);
  const product = raw ? toCatalogItem(raw, prices) : null;

  if (loading) {
    return (
      <div className="container" style={{ padding: '26px 0' }}>
        <div className="skeleton" style={{ minHeight: 460 }} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container">
        <div className="empty" style={{ margin: '40px 0' }}>
          <div className="empty__title">Товар не найден</div>
          <Link to="/catalog" className="btn btn--primary btn--sm" style={{ marginTop: 16 }}>
            Вернуться в каталог
          </Link>
        </div>
      </div>
    );
  }

  const out = product.in_stock <= 0 || product.status !== 'active';
  const low = !out && product.in_stock <= 5;
  const discount = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : 0;


  return (
    <div className="container">
      <div className="page-head" style={{ paddingBottom: 0 }}>
        <div className="breadcrumbs">
          <Link to="/">Главная</Link>
          <span>/</span>
          <Link to="/catalog">Каталог</Link>
          <span>/</span>
          <span>{product.name}</span>
        </div>
      </div>

      <div className="product">
        <div className="product__gallery">
          <div className="product__thumbs">
            {[0, 1, 2, 3].map((i) => (
              <button
                key={i}
                className={`product__thumb${tab === i ? ' product__thumb--active' : ''}`}
                onClick={() => setTab(i)}
                style={{ background: product.tint }}
                aria-label={`Фото ${i + 1}`}
              >
                <ProductArt category={product.category} tint={product.tint} size={52} />
              </button>
            ))}
          </div>
          <div className="product__main" style={{ background: product.tint }}>
            <div style={{ width: '62%', height: '62%' }}>
              <ProductArt category={product.category} tint={product.tint} size={220} />
            </div>
          </div>
        </div>

        <div>
          <div className="product__brand">
            {product.brand} · {product.volume}
          </div>
          <h1 className="product__title">{product.name}</h1>

          <div className="product__meta">
            <Rating value={product.rating} reviews={product.reviews} />
            <span>Артикул: {product.sku}</span>
            <span className="row" style={{ gap: 6 }}>
              <CheckIcon size={15} />
              В наличии
            </span>
          </div>

          <div className="product__price-row">
            <span className="product__price">{formatPrice(product.price)}</span>
            {product.oldPrice && (
              <>
                <span className="price--old" style={{ fontSize: 17 }}>
                  {formatPrice(product.oldPrice)}
                </span>
                <span className="chip">−{discount}%</span>
              </>
            )}
          </div>
          <div
            className={`product__stock${out ? ' product__stock--out' : low ? ' product__stock--low' : ''}`}
          >
            {out
              ? 'Нет в наличии'
              : low
                ? `Осталось всего ${product.in_stock} ${plural(product.in_stock, 'штука', 'штуки', 'штук')}`
                : `${product.in_stock} ${plural(product.in_stock, 'штука', 'штуки', 'штук')} на складе`}
          </div>

          <div className="product__buy">
            <div className="stepper">
              <button onClick={() => setQty((v) => Math.max(1, v - 1))} disabled={qty <= 1} aria-label="Меньше">
                <MinusIcon size={16} />
              </button>
              <span className="stepper__value">{qty}</span>
              <button
                onClick={() => setQty((v) => Math.min(product.in_stock, v + 1))}
                disabled={qty >= product.in_stock}
                aria-label="Больше"
              >
                <PlusIcon size={16} />
              </button>
            </div>
            <button
              className="btn btn--primary"
              style={{ flex: 1, maxWidth: 260 }}
              disabled={out}
              onClick={() => {
                addToCart(product.sku, qty);
                toast(`Добавлено в корзину: ${qty} шт.`);
              }}
            >
              В корзину
            </button>
            <button
              className="btn btn--ghost"
              onClick={() => {
                addToCart(product.sku, qty);
                navigate('/cart');
              }}
              disabled={out}
            >
              Купить сейчас
              <ArrowRightIcon size={16} />
            </button>
          </div>
          <p className="field__hint">
            Бесплатная доставка от 5 000 ₽ · Возврат в течение 14 дней · Оригинальная продукция
          </p>

          <div className="product__desc">
            <p>{product.description}</p>
            {product.bullets.length > 0 && (
              <ul className="product__bullets">
                {product.bullets.map((b) => (
                  <li key={b}>
                    <CheckIcon size={15} />
                    {b}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="product__badges">
            <span className="tag">
              <BoxIcon size={15} /> Отправка в день заказа
            </span>
            <span className="tag">
              <CycleIcon size={15} /> Обмен и возврат 14 дней
            </span>
            <span className="tag">
              <HeartIcon size={15} /> Рекомендуем к покупке
            </span>
          </div>

          <div className="product__desc">
            <div className="filters__title">Отзывы покупателей</div>
            <div className="summary__row">
              <span>Средняя оценка</span>
              <span className="row" style={{ gap: 8 }}>
                <Rating value={product.rating} /> {product.rating}.0 из 5
              </span>
            </div>
            <div className="summary__row">
              <span>Количество отзывов</span>
              <span>{product.reviews}</span>
            </div>
            <div className="summary__row">
              <span>Доля положительных</span>
              <span>{Math.min(99, 78 + product.rating * 4)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
