package services

import (
	"context"
	"errors"
	"math/rand"
	"strings"
	"time"

	"shop/domain/entities"
	"shop/domain/interfaces"
)

type PromoCodeService struct {
	promoRepo interfaces.PromoCodeRepository
}

func NewPromoCodeService(promoRepo interfaces.PromoCodeRepository) *PromoCodeService {
	return &PromoCodeService{promoRepo: promoRepo}
}

const codeAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

// GenerateCode — аналог UserService.GenerateCode из C#: формат XXXX-XXXX-XXXX.
func GenerateCode() string {
	part := func() string {
		var b strings.Builder
		for i := 0; i < 4; i++ {
			b.WriteByte(codeAlphabet[rand.Intn(len(codeAlphabet))])
		}
		return b.String()
	}
	return part() + "-" + part() + "-" + part()
}

func (s *PromoCodeService) GeneratePromoCodes(ctx context.Context, count int, discount float64, validDays int) ([]entities.PromoCode, error) {
	promos := make([]entities.PromoCode, 0, count)
	for i := 0; i < count; i++ {
		promos = append(promos, entities.PromoCode{
			Code:      GenerateCode(),
			Discount:  discount,
			IsPercent: true,
			ValidTo:   time.Now().AddDate(0, 0, validDays),
		})
	}

	if err := s.promoRepo.Create(ctx, promos); err != nil {
		return nil, err
	}
	return promos, nil
}

func (s *PromoCodeService) Validate(ctx context.Context, code string) (*entities.PromoCode, error) {
	promo, err := s.promoRepo.GetByCode(ctx, code)
	if err != nil {
		return nil, err
	}
	if promo == nil {
		return nil, errors.New("promocode not found")
	}
	if promo.IsExpired() {
		return nil, errors.New("promocode expired")
	}
	return promo, nil
}
