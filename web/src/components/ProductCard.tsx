import { Link } from 'react-router-dom';
import { formatPrice } from '../lib/format';
import { useStore } from '../lib/store';
import type { CatalogItem } from '../lib/catalog';
import { ProductArt } from './ProductArt';
import { CartIcon, HeartIcon, StarIcon } from './icons';

export function Rating({ value, reviews }: { value: number; reviews?: number }) {
  return (
    <span className="card__rating">
      <span className="stars">
        {[1, 2, 3, 4, 5].map((n) => (
          <StarIcon key={n} filled={n <= Math.round(value)} />
        ))}
      </span>
      {reviews !== undefined && <span>{reviews}</span>}
    </span>
  );
}

export function ProductCard({ product }: { product: CatalogItem }) {
  const { addToCart, toast } = useStore();
  const out = product.in_stock <= 0 || product.status !== 'active';

  return (
    <article className="card">
      <Link to={`/catalog/${product.sku}`} className="card__media" style={{ background: product.tint }}>
        {product.badge && <span className="card__badge">{product.badge}</span>}
        <span className="card__fav" aria-hidden>
          <HeartIcon size={16} />
        </span>
        <div style={{ width: '72%', height: '78%' }}>
          <ProductArt category={product.category} tint={product.tint} size={110} />
        </div>
      </Link>
      <div className="card__body">
        <span className="card__brand">{product.brand}</span>
        <Link to={`/catalog/${product.sku}`} className="card__name">
          {product.name}
        </Link>
        <Rating value={product.rating} reviews={product.reviews} />
        <div className="card__foot">
          <div>
            <span className="price">{formatPrice(product.price)}</span>
            {product.oldPrice && <span className="price--old">{formatPrice(product.oldPrice)}</span>}
          </div>
          <button
            className="card__add"
            disabled={out}
            aria-label={`Добавить «${product.name}» в корзину`}
            onClick={() => {
              addToCart(product.sku);
              toast(`«${product.name}» в корзине`);
            }}
          >
            <CartIcon size={17} />
          </button>
        </div>
      </div>
    </article>
  );
}
