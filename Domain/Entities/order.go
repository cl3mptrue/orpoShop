package entities

import "time"

const (
	OrderStatusNew       = "new"
	OrderStatusPaid      = "paid"
	OrderStatusCancelled = "cancelled"
	OrderStatusDone      = "done"
)

// Order соответствует сущности "ЗАКАЗ": id заказа (PK), почта (FK), промокод, статус, создан, сумма.
type Order struct {
	ID          int        `gorm:"column:id;primaryKey;autoIncrement" json:"id"`
	UserEmail   string     `gorm:"column:user_email;not null" json:"user_email"`
	User        User       `gorm:"foreignKey:UserEmail;references:Email" json:"-"`
	PromoCode   *string    `gorm:"column:promo_code" json:"promo_code,omitempty"`
	Status      string     `gorm:"column:status;not null;default:new" json:"status"`
	CreatedAt   time.Time  `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	Amount      float64    `gorm:"column:amount;not null;default:0" json:"amount"`
	Items       []OrderItem `gorm:"foreignKey:OrderID;references:ID" json:"items,omitempty"`
}

// OrderItem соответствует сущности "ПОЗИЦИЯ ЗАКАЗА": id заказа (PK, FK), артикул (PK, FK), количество.
type OrderItem struct {
	OrderID    int     `gorm:"column:order_id;primaryKey" json:"order_id"`
	ProductSKU string  `gorm:"column:product_sku;primaryKey" json:"product_sku"`
	Product    Product `gorm:"foreignKey:ProductSKU;references:SKU" json:"-"`
	Quantity   int     `gorm:"column:quantity;not null" json:"quantity"`
}

func (o *Order) Recalculate(unitPrices map[string]float64, discount float64) {
	var total float64
	for _, item := range o.Items {
		total += unitPrices[item.ProductSKU] * float64(item.Quantity)
	}
	if discount > 0 {
		total -= total * discount / 100
	}
	o.Amount = total
}
