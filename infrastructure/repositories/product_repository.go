package repositories

import (
	"context"
	"errors"

	"gorm.io/gorm"

	"shop/domain/entities"
)

type ProductRepository struct {
	db *gorm.DB
}

func NewProductRepository(db *gorm.DB) *ProductRepository {
	return &ProductRepository{db: db}
}

func (r *ProductRepository) GetAll(ctx context.Context) ([]entities.Product, error) {
	var products []entities.Product
	err := r.db.WithContext(ctx).Find(&products).Error
	return products, err
}

func (r *ProductRepository) GetBySKU(ctx context.Context, sku string) (*entities.Product, error) {
	var product entities.Product
	err := r.db.WithContext(ctx).First(&product, "sku = ?", sku).Error
	if err == gorm.ErrRecordNotFound {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &product, nil
}

func (r *ProductRepository) Create(ctx context.Context, product *entities.Product) error {
	return r.db.WithContext(ctx).Create(product).Error
}

func (r *ProductRepository) Update(ctx context.Context, product *entities.Product) error {
	return r.db.WithContext(ctx).Save(product).Error
}

// CurrentPrice берёт актуальную цену из "ИСТОРИИ ЦЕНЫ" — запись с пустой датой конца.
func (r *ProductRepository) CurrentPrice(ctx context.Context, sku string) (float64, error) {
	var ph entities.PriceHistory
	err := r.db.WithContext(ctx).
		Where("product_sku = ? AND end_date IS NULL", sku).
		Order("start_date desc").
		First(&ph).Error
	if err == gorm.ErrRecordNotFound {
		return 0, errors.New("no active price for product")
	}
	if err != nil {
		return 0, err
	}
	return ph.Price, nil
}
