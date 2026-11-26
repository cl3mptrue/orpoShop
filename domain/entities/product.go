package entities

const (
	ProductStatusActive   = "active"
	ProductStatusInactive = "inactive"
)

// Product соответствует сущности "ТОВАР": артикул (PK), название, статус, на складе.
type Product struct {
	SKU      string `gorm:"column:sku;primaryKey" json:"sku"`
	Name     string `gorm:"column:name;not null" json:"name"`
	Status   string `gorm:"column:status;not null;default:active" json:"status"`
	InStock  int    `gorm:"column:in_stock;not null;default:0" json:"in_stock"`
}
