package services

import (
	"context"
	"errors"

	"shop/domain/entities"
	"shop/domain/interfaces"
)

type OrderService struct {
	orderRepo   interfaces.OrderRepository
	productRepo interfaces.ProductRepository
	promoRepo   interfaces.PromoCodeRepository
}

func NewOrderService(
	orderRepo interfaces.OrderRepository,
	productRepo interfaces.ProductRepository,
	promoRepo interfaces.PromoCodeRepository,
) *OrderService {
	return &OrderService{orderRepo: orderRepo, productRepo: productRepo, promoRepo: promoRepo}
}

type OrderItemInput struct {
	ProductSKU string
	Quantity   int
}

// CreateOrder — аналог "Оформляет" + "Содержит" + "Ссылается на" на диаграмме:
// пользователь оформляет заказ, состоящий из позиций, каждая ссылается на товар.
func (s *OrderService) CreateOrder(ctx context.Context, userEmail string, items []OrderItemInput, promoCode *string) (*entities.Order, error) {
	if len(items) == 0 {
		return nil, errors.New("order must contain at least one item")
	}

	order := &entities.Order{
		UserEmail: userEmail,
		Status:    entities.OrderStatusNew,
		PromoCode: promoCode,
	}

	var total float64
	for _, item := range items {
		product, err := s.productRepo.GetBySKU(ctx, item.ProductSKU)
		if err != nil {
			return nil, err
		}
		if product == nil {
			return nil, errors.New("product not found: " + item.ProductSKU)
		}
		if product.Status != entities.ProductStatusActive {
			return nil, errors.New("product not available: " + item.ProductSKU)
		}
		if product.InStock < item.Quantity {
			return nil, errors.New("not enough stock for: " + item.ProductSKU)
		}

		price, err := s.productRepo.CurrentPrice(ctx, item.ProductSKU)
		if err != nil {
			return nil, err
		}

		order.Items = append(order.Items, entities.OrderItem{
			ProductSKU: item.ProductSKU,
			Quantity:   item.Quantity,
		})
		total += price * float64(item.Quantity)
	}

	if promoCode != nil {
		promo, err := s.promoRepo.GetByCode(ctx, *promoCode)
		if err != nil {
			return nil, err
		}
		if promo == nil {
			return nil, errors.New("promocode not found")
		}
		if promo.IsExpired() {
			return nil, errors.New("promocode expired")
		}
		if promo.IsPercent {
			total -= total * promo.Discount / 100
		} else {
			total -= promo.Discount
		}
		if total < 0 {
			total = 0
		}
	}

	order.Amount = total

	if err := s.orderRepo.Create(ctx, order); err != nil {
		return nil, err
	}
	return order, nil
}

func (s *OrderService) GetByID(ctx context.Context, id int) (*entities.Order, error) {
	return s.orderRepo.GetByID(ctx, id)
}

func (s *OrderService) GetByUser(ctx context.Context, email string) ([]entities.Order, error) {
	return s.orderRepo.GetByUser(ctx, email)
}

func (s *OrderService) UpdateStatus(ctx context.Context, id int, status string) (*entities.Order, error) {
	order, err := s.orderRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if order == nil {
		return nil, errors.New("order not found")
	}
	order.Status = status
	if err := s.orderRepo.Update(ctx, order); err != nil {
		return nil, err
	}
	return order, nil
}
