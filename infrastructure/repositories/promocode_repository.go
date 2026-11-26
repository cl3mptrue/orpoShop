package repositories

import (
	"context"

	"gorm.io/gorm"

	"shop/domain/entities"
)

type PromoCodeRepository struct {
	db *gorm.DB
}

func NewPromoCodeRepository(db *gorm.DB) *PromoCodeRepository {
	return &PromoCodeRepository{db: db}
}

func (r *PromoCodeRepository) GetByCode(ctx context.Context, code string) (*entities.PromoCode, error) {
	var promo entities.PromoCode
	err := r.db.WithContext(ctx).First(&promo, "code = ?", code).Error
	if err == gorm.ErrRecordNotFound {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &promo, nil
}

func (r *PromoCodeRepository) Create(ctx context.Context, promos []entities.PromoCode) error {
	return r.db.WithContext(ctx).Create(&promos).Error
}
