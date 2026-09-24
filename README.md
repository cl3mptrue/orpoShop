# Shop API — Go

Переписанный на Go бэкенд, структура БД взята с приложенной ER-диаграммы
(Пользователь, Промокод, Заказ, Позиция заказа, Товар, История цены),
бизнес-логика — из исходного C#/.NET проекта.

## Стек
- **Gin** — веб-фреймворк (аналог ASP.NET Core Controllers)
- **GORM** + **PostgreSQL** — ORM (аналог EF Core / `AppDbContext`)
- **golang-jwt/jwt** — JWT (аналог `JwtService.cs`)
- **golang.org/x/crypto/bcrypt** — хэширование паролей (как `BCrypt.Net` в C#)

## Соответствие сущностей диаграмме

| Диаграмма (рус.) | Go-структура | Файл |
|---|---|---|
| ПОЛЬЗОВАТЕЛЬ (почта PK, роль, пароль, ФИО) | `entities.User` | `domain/entities/user.go` |
| ПРОМОКОД (промокод PK, скидка, создан, годен до) | `entities.PromoCode` | `domain/entities/promocode.go` |
| ЗАКАЗ (id PK, почта FK, промокод, статус, создан, сумма) | `entities.Order` | `domain/entities/order.go` |
| ПОЗИЦИЯ ЗАКАЗА (id заказа PK/FK, артикул PK/FK, количество) | `entities.OrderItem` | `domain/entities/order.go` |
| ТОВАР (артикул PK, название, статус, на складе) | `entities.Product` | `domain/entities/product.go` |
| ИСТОРИЯ ЦЕНЫ (артикул PK/FK, дата начала PK, цена, дата конца) | `entities.PriceHistory` | `domain/entities/pricehistory.go` |

Связи с диаграммы реализованы так:
- **Оформляет** — `Order.UserEmail` → `User.Email`.
- **Используется** — `Order.PromoCode` → `PromoCode.Code`; расчёт скидки в `OrderService.CreateOrder`.
- **Содержит** — `Order.Items []OrderItem`.
- **Ссылается на** — `OrderItem.ProductSKU` → `Product.SKU`.
- **Хранит в** — `PriceHistory.ProductSKU` → `Product.SKU`; при смене цены старая запись
  закрывается (`end_date`), открывается новая — история, а не перезапись поля.

> В отличие от исходного C#-кода, промокод в этой модели даёт скидку на **заказ**
> (как показано на диаграмме через связь ПРОМОКОД—ЗАКАЗ), а не начисляет бонусный
> баланс пользователю (таблицы `UserBalance` на диаграмме нет).

## Соответствие C# → Go

| C# | Go |
|---|---|
| `User.cs` (конструктор с валидацией + bcrypt) | `entities.NewUser` |
| `UserService.cs` | `application/services/user_service.go`, `order_service.go`, `promocode_service.go`, `product_service.go` |
| `IUserRepository.cs` | `domain/interfaces/repositories.go` |
| `UserRepository.cs` | `infrastructure/repositories/*.go` |
| `AppDbContext.cs` (+ `OnModelCreating`) | `infrastructure/data/db.go` (`AutoMigrate`) |
| `JwtService.cs` | `api/jwt/jwt_service.go` |
| `UsersController.cs` | `api/controllers/*_controller.go` |
| `[Authorize]` / `[Authorize(Roles = "Admin")]` | `api/middleware/auth.go` (`RequireAuth`, `RequireRole`) |
| `CreateUserRequest.cs` и т.п. | `api/dto/requests.go` |

## Запуск

```bash
go install github.com/swaggo/swag/cmd/swag@latest   # один раз, для генерации Swagger-доков
swag init                                             # генерирует папку docs/ с docs.go
go mod tidy
export DATABASE_URL="host=localhost user=postgres password=postgres dbname=shopgo port=5432 sslmode=disable"
export JWT_SECRET="your-secret"
go run main.go
```

Таблицы создаются автоматически через `AutoMigrate` при старте (аналог миграций EF Core).

## Swagger UI

После `swag init` и запуска сервера документация с формами для тестирования запросов
прямо в браузере доступна по адресу:

```
http://localhost:8080/swagger/index.html
```

Для эндпоинтов с `[Authorize]` (помечены 🔒 `BearerAuth` в UI) нажмите кнопку
**Authorize** вверху страницы и вставьте `Bearer <ваш JWT-токен>`, полученный из `/api/users/login`.

> Если поменяете сигнатуры/комментарии `@Summary`, `@Param` и т.п. в контроллерах —
> нужно перезапустить `swag init`, чтобы обновить `docs/`.

## Основные эндпоинты

```
GET    /api/users/GetAll
POST   /api/users/register
POST   /api/users/login
PUT    /api/users/{email}/delete      (admin)
PUT    /api/users/{email}/activate    (admin)

POST   /api/promo/create              (admin)
POST   /api/promo/validate            (auth)

GET    /api/products/GetAll
POST   /api/products/create           (admin)
PUT    /api/products/{sku}/price      (admin)

POST   /api/orders                    (auth)
GET    /api/orders/my                 (auth)
GET    /api/orders/{id}               (auth)
PUT    /api/orders/{id}/status        (auth)
```

## Что стоит доработать дальше
- Проверка прав на конкретный заказ (сейчас любой авторизованный может запросить заказ по id).
- Уменьшение `Product.InStock` при создании заказа и его возврат при отмене.
- Пагинация для `GetAll`.
- Юнит-тесты (в Go — стандартный `testing` + `testify`).
