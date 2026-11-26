package entities

import "time"

// PriceHistory соответствует сущности "ИСТОРИЯ ЦЕНЫ": артикул (PK, FK), дата начала (PK), цена, дата конца.
type PriceHistory struct {
	ProductSKU string     `gorm:"column:product_sku;primaryKey" json:"product_sku"`
	Product    Product    `gorm:"foreignKey:ProductSKU;references:SKU" json:"-"`
	StartDate  time.Time  `gorm:"column:start_date;primaryKey" json:"start_date"`
	Price      float64    `gorm:"column:price;not null" json:"price"`
	EndDate    *time.Time `gorm:"column:end_date" json:"end_date,omitempty"`
}
