package interfaces

import (
	"context"

	"shop/domain/entities"
)

type UserRepository interface {
	GetAll(ctx context.Context) ([]entities.User, error)
	GetByEmail(ctx context.Context, email string) (*entities.User, error)
	Create(ctx context.Context, user *entities.User) error
	Update(ctx context.Context, user *entities.User) error
}

type PromoCodeRepository interface {
	GetByCode(ctx context.Context, code string) (*entities.PromoCode, error)
	Create(ctx context.Context, promos []entities.PromoCode) error
}

type ProductRepository interface {
	GetAll(ctx context.Context) ([]entities.Product, error)
	GetBySKU(ctx context.Context, sku string) (*entities.Product, error)
	Create(ctx context.Context, product *entities.Product) error
	Update(ctx context.Context, product *entities.Product) error
	CurrentPrice(ctx context.Context, sku string) (float64, error)
}

type OrderRepository interface {
	GetByID(ctx context.Context, id int) (*entities.Order, error)
	GetByUser(ctx context.Context, email string) ([]entities.Order, error)
	Create(ctx context.Context, order *entities.Order) error
	Update(ctx context.Context, order *entities.Order) error
}
