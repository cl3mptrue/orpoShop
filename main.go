package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"

	_ "shop/docs" // сгенерированная swag'ом документация (docs.go, swagger.json)

	"shop/api/controllers"
	"shop/api/jwt"
	"shop/api/middleware"
	"shop/application/services"
	"shop/domain/entities"
	"shop/infrastructure/data"
	"shop/infrastructure/repositories"
)

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

// @title           Shop API
// @version         1.0
// @description     API магазина: пользователи, промокоды, товары, заказы.
// @host            localhost:8080
// @BasePath        /api
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Введите: Bearer {токен}
func main() {
	dsn := getEnv("DATABASE_URL", "host=localhost user=postgres password=postgres dbname=shopgo port=5432 sslmode=disable")
	jwtSecret := getEnv("JWT_SECRET", "change-me-in-production")
	jwtIssuer := getEnv("JWT_ISSUER", "shop-api")
	port := getEnv("PORT", "8080")

	db, err := data.NewDB(dsn)
	if err != nil {
		log.Fatalf("failed to connect to db: %v", err)
	}

	// репозитории
	userRepo := repositories.NewUserRepository(db)
	promoRepo := repositories.NewPromoCodeRepository(db)
	productRepo := repositories.NewProductRepository(db)
	orderRepo := repositories.NewOrderRepository(db)

	// сервисы
	userService := services.NewUserService(userRepo)
	promoService := services.NewPromoCodeService(promoRepo)
	productService := services.NewProductService(db, productRepo)
	orderService := services.NewOrderService(orderRepo, productRepo, promoRepo)

	jwtService := jwt.NewService(jwtSecret, jwtIssuer)

	// контроллеры
	userController := controllers.NewUserController(userService, jwtService)
	promoController := controllers.NewPromoController(promoService)
	productController := controllers.NewProductController(productService)
	orderController := controllers.NewOrderController(orderService)

	router := gin.Default()

	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	authRequired := middleware.RequireAuth(jwtService)
	adminRequired := middleware.RequireRole(entities.RoleAdmin)

	api := router.Group("/api")
	userController.RegisterRoutes(api.Group("/users"), authRequired, adminRequired)
	promoController.RegisterRoutes(api.Group("/promo"), authRequired, adminRequired)
	productController.RegisterRoutes(api.Group("/products"), authRequired, adminRequired)
	orderController.RegisterRoutes(api.Group("/orders"), authRequired)

	log.Printf("listening on :%s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatal(err)
	}
}
