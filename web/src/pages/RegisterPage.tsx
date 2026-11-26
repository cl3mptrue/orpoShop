import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../lib/store';
import { SparkIcon } from '../components/icons';

const PASSWORD_HINT = 'Не менее 12 символов: строчная и заглавная буквы, цифра и спецсимвол';

export function RegisterPage() {
  const { register } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [fio, setFio] = useState('');
  const [password, setPassword] = useState('');
  const [repeat, setRepeat] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== repeat) {
      setError('Пароли не совпадают');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await register(email.trim(), password, fio.trim());
      navigate('/');
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
        <h1 className="auth__title">Регистрация</h1>
        <p className="auth__sub">Создайте аккаунт, чтобы отслеживать заказы и получать скидки</p>

        {error && <div className="form-error">{error}</div>}

        <div className="field">
          <label className="field__label" htmlFor="fio">
            ФИО
          </label>
          <input id="fio" value={fio} onChange={(e) => setFio(e.target.value)} required placeholder="Иванова Мария Сергеевна" />
        </div>
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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="repeat">
            Повторите пароль
          </label>
          <input
            id="repeat"
            type="password"
            autoComplete="new-password"
            value={repeat}
            onChange={(e) => setRepeat(e.target.value)}
            required
          />
          <div className="field__hint">{PASSWORD_HINT}</div>
        </div>

        <button className="btn btn--primary btn--block" disabled={busy}>
          {busy ? 'Создаём…' : 'Создать аккаунт'}
        </button>

        <div className="auth__switch">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </div>
      </form>
    </div>
  );
}
