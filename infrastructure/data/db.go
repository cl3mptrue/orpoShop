package data

import (
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"shop/domain/entities"
)

// NewDB открывает подключение и накатывает автомиграцию — аналог AppDbContext + OnModelCreating.
func NewDB(dsn string) (*gorm.DB, error) {
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	if err := db.AutoMigrate(
		&entities.User{},
		&entities.PromoCode{},
		&entities.Product{},
		&entities.PriceHistory{},
		&entities.Order{},
		&entities.OrderItem{},
	); err != nil {
		return nil, err
	}

	return db, nil
}
