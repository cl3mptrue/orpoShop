import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CATEGORIES, categoryTitle, toCatalogItem } from '../lib/catalog';
import { useProducts } from '../lib/products';
import { ProductCard } from '../components/ProductCard';
import { CloseIcon } from '../components/icons';
import { formatPrice } from '../lib/format';

const SORTS = [
  { id: 'popular', title: 'По популярности' },
  { id: 'price-asc', title: 'Сначала дешевле' },
  { id: 'price-desc', title: 'Сначала дороже' },
  { id: 'new', title: 'Новинки' },
] as const;

const PRICE_STEPS = [1000, 2500, 5000];

export function CatalogPage() {
  const [params, setParams] = useSearchParams();
  const { products, loading, error, prices } = useProducts();

  const q = params.get('q') ?? '';
  const category = params.get('category') ?? '';
  const sort = params.get('sort') ?? 'popular';
  const minPrice = Number(params.get('min') ?? 0);
  const maxPrice = Number(params.get('max') ?? 0);

  const update = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (!value) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const all = useMemo(() => products.map((p) => toCatalogItem(p, prices)), [products, prices]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = all.filter((p) => {
      if (category && p.category !== category) return false;
      if (needle) {
        const haystack = `${p.name} ${p.brand} ${p.sku}`.toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      if (minPrice && p.price < minPrice) return false;
      if (maxPrice && p.price > maxPrice) return false;
      return true;
    });

    return [...list].sort((a, b) => {
      if (sort === 'price-asc') return a.price - b.price;
      if (sort === 'price-desc') return b.price - a.price;
      if (sort === 'new') return b.sku.localeCompare(a.sku);
      return b.reviews - a.reviews;
    });
  }, [all, category, q, sort, minPrice, maxPrice]);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of all) map[p.category] = (map[p.category] ?? 0) + 1;
    return map;
  }, [all]);

  const activeChips = [
    q && { key: 'q', label: `«${q}»` },
    category && { key: 'category', label: categoryTitle(category) },
    minPrice > 0 && { key: 'min', label: `от ${formatPrice(minPrice)}` },
    maxPrice > 0 && { key: 'max', label: `до ${formatPrice(maxPrice)}` },
  ].filter(Boolean) as { key: string; label: string }[];

  return (
    <div className="container">
      <div className="page-head">
        <div className="breadcrumbs">
          <Link to="/">Главная</Link>
          <span>/</span>
          <span>Каталог</span>
        </div>
        <h1 className="page-title">Каталог товаров</h1>
      </div>

      <div className="catalog">
        <aside className="filters">
          <div className="filters__block">
            <div className="filters__title">Категории</div>
            <div className="filters__list">
              <button
                className={`filters__item${!category ? ' filters__item--active' : ''}`}
                onClick={() => update('category', null)}
              >
                Все товары <span className="filters__count">{all.length}</span>
              </button>
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  className={`filters__item${category === c.id ? ' filters__item--active' : ''}`}
                  onClick={() => update('category', category === c.id ? null : c.id)}
                >
                  {c.title} <span className="filters__count">{counts[c.id] ?? 0}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="filters__block">
            <div className="filters__title">Цена, ₽</div>
            <div className="range-row">
              <input
                type="number"
                min={0}
                placeholder="от"
                value={minPrice || ''}
                onChange={(e) => update('min', e.target.value)}
              />
              <input
                type="number"
                min={0}
                placeholder="до"
                value={maxPrice || ''}
                onChange={(e) => update('max', e.target.value)}
              />
            </div>
          </div>

          <div className="filters__block">
            <div className="filters__title">Быстрый выбор</div>
            {PRICE_STEPS.map((step) => (
              <label key={step} className="checkbox">
                <input
                  type="checkbox"
                  checked={maxPrice === step}
                  onChange={(e) => update('max', e.target.checked ? String(step) : null)}
                />
                До {formatPrice(step)}
              </label>
            ))}
            <label className="checkbox">
              <input
                type="checkbox"
                checked={params.get('instock') === '1'}
                onChange={(e) => update('instock', e.target.checked ? '1' : null)}
              />
              Только в наличии
            </label>
          </div>
        </aside>

        <div>
          <div className="catalog__toolbar">
            <div>
              <span className="catalog__count">
                {loading ? 'Загрузка…' : `${filtered.length} товаров`}
              </span>
              {activeChips.length > 0 && (
                <div className="chips" style={{ marginTop: 10 }}>
                  {activeChips.map((chip) => (
                    <span key={chip.key} className="chip">
                      {chip.label}
                      <button aria-label="Убрать фильтр" onClick={() => update(chip.key, null)}>
                        <CloseIcon size={13} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <select className="select" value={sort} onChange={(e) => update('sort', e.target.value)}>
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>

          {error && <div className="form-error">{error}</div>}

          {loading ? (
            <div className="grid-products grid-products--catalog">
              {[0, 1, 2].map((n) => (
                <div key={n} className="skeleton" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty">
              <div className="empty__title">Ничего не найдено</div>
              Попробуйте изменить параметры поиска или сбросить фильтры.
              <div style={{ marginTop: 18 }}>
                <button className="btn btn--ghost btn--sm" onClick={() => setParams({}, { replace: true })}>
                  Сбросить фильтры
                </button>
              </div>
            </div>
          ) : (
            <div className="grid-products grid-products--catalog">
              {filtered.map((p) => (
                <ProductCard key={p.sku} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
