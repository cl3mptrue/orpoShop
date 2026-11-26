import { Link } from 'react-router-dom';
import { CATEGORIES, toCatalogItem } from '../lib/catalog';
import { useProducts } from '../lib/products';
import { ProductCard } from '../components/ProductCard';
import { ArrowRightIcon, CartIcon, CheckIcon, ICONS, SparkIcon } from '../components/icons';
import { HeroArt } from '../components/ProductArt';
import { FEATURES } from '../lib/catalog';

export function HomePage() {
  const { products, loading, prices } = useProducts();
  const items = products
    .filter((p) => p.status === 'active')
    .map((p) => toCatalogItem(p, prices));

  return (
    <div className="container">
      <section className="hero">
        <aside className="categories">
          <div className="categories__title">Категории</div>
          {CATEGORIES.map((c) => (
            <Link key={c.id} to={`/catalog?category=${c.id}`} className="categories__link">
              {c.title}
              <ArrowRightIcon size={15} />
            </Link>
          ))}
        </aside>

        <div className="hero__main">
          <div className="hero-card">
            <div className="hero-card__eyebrow">Новая коллекция · Сеул</div>
            <h1 className="hero-card__title">Корейская забота о красоте</h1>
            <p className="hero-card__text">
              Косметика, чай и товары для дома с проверенным составом. Доставим по России и поможем
              подобрать уход.
            </p>
            <div className="hero-card__cta">
              <Link to="/catalog" className="btn btn--primary">
                Перейти в каталог
                <ArrowRightIcon size={17} />
              </Link>
              <Link to="/catalog?sort=new" className="btn btn--ghost">
                Новинки
              </Link>
            </div>
            <div className="hero-card__art">
              <HeroArt />
            </div>
          </div>

          <div className="promo-stack">
            <Link to="/catalog?promo=1" className="promo-mini promo-mini--dark">
              <span className="promo-mini__title">Скидка 10% на первый заказ</span>
              <span className="promo-mini__text">Промокод применим в корзине</span>
            </Link>
            <Link to="/catalog?category=skincare" className="promo-mini promo-mini--blush">
              <span className="promo-mini__title">
                <SparkIcon size={18} /> Уход за кожей
              </span>
              <span className="promo-mini__text">Сыворотки, кремы и патчи для ежедневного ухода</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section__head">
          <div>
            <h2 className="section__title">Популярные товары</h2>
            <p className="section__sub">Выбор наших покупателей из Кореи</p>
          </div>
          <Link to="/catalog" className="btn btn--ghost btn--sm">
            Смотреть все
            <ArrowRightIcon size={15} />
          </Link>
        </div>

        {loading ? (
          <div className="grid-products">
            {[0, 1, 2, 3].map((n) => (
              <div key={n} className="skeleton" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="empty">
            <div className="empty__title">Каталог пока пуст</div>
            Товары появятся после создания через панель администратора.
          </div>
        ) : (
          <div className="grid-products">
            {items.slice(0, 4).map((p) => (
              <ProductCard key={p.sku} product={p} />
            ))}
          </div>
        )}
      </section>

      <section className="features">
        {FEATURES.map((f) => {
          const Icon = ICONS[f.icon];
          return (
            <div key={f.icon} className="feature">
              <span className="feature__icon">
                <Icon size={20} />
              </span>
              <div>
                <div className="feature__title">{f.title}</div>
                <div className="feature__text">{f.text}</div>
              </div>
            </div>
          );
        })}
      </section>

      {items.length > 4 && (
        <section className="section">
          <div className="section__head">
            <div>
              <h2 className="section__title">Новинки каталога</h2>
              <p className="section__sub">Свежие поступления Miroy Shop</p>
            </div>
          </div>
          <div className="grid-products">
            {items.slice(4, 8).map((p) => (
              <ProductCard key={p.sku} product={p} />
            ))}
          </div>
        </section>
      )}

      <section className="section">
        <div className="promo-mini" style={{ minHeight: 0, flexDirection: 'row', alignItems: 'center', gap: 24 }}>
          <span className="feature__icon" style={{ width: 52, height: 52 }}>
            <CheckIcon />
          </span>
          <div style={{ flex: 1 }}>
            <div className="promo-mini__title">Зарегистрируйтесь и получайте скидки</div>
            <div className="promo-mini__text">
              История заказов, промокоды и быстрый повтор заказа — в личном кабинете.
            </div>
          </div>
          <span className="btn btn--primary" style={{ pointerEvents: 'none' }}>
            <CartIcon size={17} />
            Мой аккаунт
          </span>
        </div>
      </section>
    </div>
  );
}
