package services

import (
	"context"
	"errors"
	"time"

	"gorm.io/gorm"

	"shop/domain/entities"
	"shop/domain/interfaces"
)

type ProductService struct {
	db          *gorm.DB
	productRepo interfaces.ProductRepository
}

func NewProductService(db *gorm.DB, productRepo interfaces.ProductRepository) *ProductService {
	return &ProductService{db: db, productRepo: productRepo}
}

func (s *ProductService) GetAll(ctx context.Context) ([]entities.Product, error) {
	return s.productRepo.GetAll(ctx)
}

func (s *ProductService) CreateProduct(ctx context.Context, sku, name string, inStock int, price float64) (*entities.Product, error) {
	existing, err := s.productRepo.GetBySKU(ctx, sku)
	if err != nil {
		return nil, err
	}
	if existing != nil {
		return nil, errors.New("product already exists")
	}

	product := &entities.Product{
		SKU:     sku,
		Name:    name,
		Status:  entities.ProductStatusActive,
		InStock: inStock,
	}
	if err := s.productRepo.Create(ctx, product); err != nil {
		return nil, err
	}

	// Открываем первую запись в "ИСТОРИИ ЦЕНЫ" для товара.
	history := entities.PriceHistory{
		ProductSKU: sku,
		StartDate:  time.Now(),
		Price:      price,
	}
	if err := s.db.WithContext(ctx).Create(&history).Error; err != nil {
		return nil, err
	}

	return product, nil
}

// ChangePrice закрывает текущую запись цены (проставляет дату конца) и открывает новую —
// именно так связь "Хранит в" на диаграмме превращается в историю цен, а не перезапись.
func (s *ProductService) ChangePrice(ctx context.Context, sku string, newPrice float64) error {
	return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		now := time.Now()

		if err := tx.Model(&entities.PriceHistory{}).
			Where("product_sku = ? AND end_date IS NULL", sku).
			Update("end_date", now).Error; err != nil {
			return err
		}

		return tx.Create(&entities.PriceHistory{
			ProductSKU: sku,
			StartDate:  now,
			Price:      newPrice,
		}).Error
	})
}
