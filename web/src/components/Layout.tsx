import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../lib/store';
import { FEATURES } from '../lib/catalog';
import { CartIcon, ICONS, SearchIcon, SparkIcon, UserIcon } from './icons';

export function Layout() {
  const { session, cartCount, logout } = useStore();
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') ?? '');
  const navigate = useNavigate();
  const location = useLocation();

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/catalog?q=${encodeURIComponent(q)}` : '/catalog');
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="container topbar__row">
          <Link to="/" className="logo">
            <span className="logo__mark">
              <SparkIcon size={19} />
            </span>
            <span>
              Miroy Shop
              <span className="logo__sub">Корейская продукция</span>
            </span>
          </Link>

          <nav className="nav">
            <NavLink to="/" end className={({ isActive }) => `nav__link${isActive ? ' nav__link--active' : ''}`}>
              Главная
            </NavLink>
            <NavLink
              to="/catalog"
              className={() => (location.pathname.startsWith('/catalog') ? 'nav__link nav__link--active' : 'nav__link')}
            >
              Каталог
            </NavLink>
            <NavLink to="/orders" className={({ isActive }) => `nav__link${isActive ? ' nav__link--active' : ''}`}>
              Мои заказы
            </NavLink>
          </nav>

          <form className="search" onSubmit={submitSearch} role="search">
            <SearchIcon size={17} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск по каталогу"
              aria-label="Поиск товаров"
            />
          </form>

          <div className="actions">
            {session ? (
              <>
                {session.role === 'admin' && (
                  <Link to="/admin" className="btn-link">
                    Админ
                  </Link>
                )}
                <Link to="/profile" className="icon-btn" title={session.email}>
                  <UserIcon />
                </Link>
                <button className="btn-link" onClick={logout}>
                  Выйти
                </button>
              </>
            ) : (
              <Link to="/login" className="btn-link">
                Войти
              </Link>
            )}
            <Link to="/cart" className="icon-btn" aria-label="Корзина">
              <CartIcon />
              {cartCount > 0 && <span className="icon-btn__badge">{cartCount}</span>}
            </Link>
          </div>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer__grid">
            <div>
              <Link to="/" className="logo">
                <span className="logo__mark">
                  <SparkIcon size={19} />
                </span>
                <span>
                  Miroy Shop
                  <span className="logo__sub">Корейская продукция</span>
                </span>
              </Link>
              <p className="footer__text">
                Отборная косметика, чай и товары для дома из Кореи — с доставкой по всей России.
              </p>
            </div>
            <div>
              <div className="footer__title">Магазин</div>
              <Link to="/catalog" className="footer__link">Каталог</Link>
              <Link to="/catalog?category=skincare" className="footer__link">Уход за кожей</Link>
              <Link to="/catalog?category=makeup" className="footer__link">Макияж</Link>
              <Link to="/catalog?category=food" className="footer__link">Продукты и напитки</Link>
            </div>
            <div>
              <div className="footer__title">Покупателям</div>
              <Link to="/orders" className="footer__link">Мои заказы</Link>
              <Link to="/cart" className="footer__link">Корзина</Link>
              <Link to="/profile" className="footer__link">Профиль</Link>
              <Link to="/register" className="footer__link">Регистрация</Link>
            </div>
            <div>
              <div className="footer__title">Поддержка</div>
              {FEATURES.map((f) => (
                <span key={f.icon} className="footer__link">
                  {f.title}
                </span>
              ))}
            </div>
          </div>
          <div className="footer__bottom">
            <span>© {new Date().getFullYear()} Miroy Shop. Все права защищены.</span>
            <span className="row">
              {FEATURES.slice(0, 3).map((f) => {
                const Icon = ICONS[f.icon];
                return (
                  <span key={f.icon} className="row muted" style={{ gap: 6 }}>
                    <Icon size={15} /> {f.title}
                  </span>
                );
              })}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
