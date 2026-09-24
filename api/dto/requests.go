package dto

type CreateUserRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
	Fio      string `json:"fio" binding:"required"`
}

type LoginUserRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type CreatePromoRequest struct {
	Count      int     `json:"count" binding:"required,gt=0"`
	Discount   float64 `json:"discount" binding:"required,gt=0"`
	ValidDays  int     `json:"valid_days" binding:"required,gt=0"`
}

type CreateProductRequest struct {
	SKU     string  `json:"sku" binding:"required"`
	Name    string  `json:"name" binding:"required"`
	InStock int     `json:"in_stock" binding:"gte=0"`
	Price   float64 `json:"price" binding:"required,gt=0"`
}

type ChangePriceRequest struct {
	Price float64 `json:"price" binding:"required,gt=0"`
}

type CreateOrderItem struct {
	ProductSKU string `json:"product_sku" binding:"required"`
	Quantity   int    `json:"quantity" binding:"required,gt=0"`
}

type CreateOrderRequest struct {
	Items     []CreateOrderItem `json:"items" binding:"required,dive"`
	PromoCode *string           `json:"promo_code"`
}

type ActivatePromoRequest struct {
	Code string `json:"code" binding:"required"`
}
