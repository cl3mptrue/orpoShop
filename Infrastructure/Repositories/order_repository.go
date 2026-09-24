package repositories

import (
	"context"

	"gorm.io/gorm"

	"shop/domain/entities"
)

type OrderRepository struct {
	db *gorm.DB
}

func NewOrderRepository(db *gorm.DB) *OrderRepository {
	return &OrderRepository{db: db}
}

func (r *OrderRepository) GetByID(ctx context.Context, id int) (*entities.Order, error) {
	var order entities.Order
	err := r.db.WithContext(ctx).Preload("Items").First(&order, "id = ?", id).Error
	if err == gorm.ErrRecordNotFound {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &order, nil
}

func (r *OrderRepository) GetByUser(ctx context.Context, email string) ([]entities.Order, error) {
	var orders []entities.Order
	err := r.db.WithContext(ctx).Preload("Items").Where("user_email = ?", email).Find(&orders).Error
	return orders, err
}

func (r *OrderRepository) Create(ctx context.Context, order *entities.Order) error {
	return r.db.WithContext(ctx).Create(order).Error
}

func (r *OrderRepository) Update(ctx context.Context, order *entities.Order) error {
	return r.db.WithContext(ctx).Save(order).Error
}
