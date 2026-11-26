package entities

import "time"

// PromoCode соответствует сущности "ПРОМОКОД": промокод (PK), скидка, создан, годен до.
type PromoCode struct {
	Code      string    `gorm:"column:code;primaryKey" json:"code"`
	Discount  float64   `gorm:"column:discount;not null" json:"discount"` // % или фикс. сумма — см. IsPercent
	IsPercent bool      `gorm:"column:is_percent;not null;default:true" json:"is_percent"`
	CreatedAt time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	ValidTo   time.Time `gorm:"column:valid_to;not null" json:"valid_to"`
}

func (p *PromoCode) IsExpired() bool {
	return time.Now().After(p.ValidTo)
}
