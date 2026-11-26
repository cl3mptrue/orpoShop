# Miroy Shop — веб-приложение

Фронтенд интернет-магазина корейской продукции на **TypeScript + Bun + React**.
Работает поверх существующего Go-бэкенда (`main.go`, Gin + GORM + PostgreSQL).

## Запуск (Bun)

```bash
# 1. Бэкенд (Go). Каталоги домена переименованы в нижний регистр (domain/, application/, infrastructure/)
DATABASE_URL="host=localhost user=postgres password=postgres dbname=shopgo port=5432 sslmode=disable" go run .

# 2. Витрина + прокси /api → :8080 (из корня репозитория)
bun install --cwd web
bun run dev.ts          # http://localhost:5173

# 3. Тестовые данные (пользователи, 8 товаров, промокод)
bun run backend/seed.ts
```

Если `go` не установлен, официальный тулчейн можно распаковать локально (каталог в `.gitignore`):

```bash
mkdir -p .toolchain && curl -sSL https://go.dev/dl/go1.27.4.linux-amd64.tar.gz | tar -xz -C .toolchain
.toolchain/go/bin/go build -o .toolchain/shop-api . && ./.toolchain/shop-api
```

## Тестовые учётные записи

| Роль | Почта | Пароль |
|---|---|---|
| Администратор | `admin@miroy.ru` | `MiroyAdmin#2026` |
| Покупатель | `maria@miroy.ru` | `MiroyBuyer#2026` |

Скрипт сида печатает действующий промокод. Роль `admin` через API не выдаётся —
при регистрации всем назначается `user`, поэтому администратору роль выставляется в БД:

```bash
psql "$DATABASE_URL" -c "UPDATE users SET role='admin' WHERE email='admin@miroy.ru'"
```

## Проверки

```bash
bun run typecheck            # из каталога web
bun run e2e.ts               # сквозной E2E в headless Chromium (backend/e2e.ts)
bun build ./web/index.html --outdir=web/dist --minify
```
