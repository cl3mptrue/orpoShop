import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../lib/store';
import { SparkIcon } from '../components/icons';

const PASSWORD_HINT = 'Не менее 12 символов: строчная и заглавная буквы, цифра и спецсимвол';

export function LoginPage() {
  const { login } = useStore();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email.trim(), password);
      navigate(params.get('next') ?? '/');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container auth">
      <form className="auth__card" onSubmit={submit}>
        <div className="row" style={{ marginBottom: 18, gap: 10 }}>
          <span className="logo__mark">
            <SparkIcon size={18} />
          </span>
          <span className="logo__sub">Miroy Shop</span>
        </div>
        <h1 className="auth__title">Вход в аккаунт</h1>
        <p className="auth__sub">Войдите, чтобы оформлять заказы и пользоваться промокодами</p>

        {error && <div className="form-error">{error}</div>}

        <div className="field">
          <label className="field__label" htmlFor="email">
            Электронная почта
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
          />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="password">
            Пароль
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="field__hint">{PASSWORD_HINT}</div>
        </div>

        <button className="btn btn--primary btn--block" disabled={busy}>
          {busy ? 'Вход…' : 'Войти'}
        </button>

        <div className="auth__switch">
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </div>
      </form>
    </div>
  );
}
