package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"shop/api/dto"
	"shop/api/jwt"
	"shop/api/middleware"
	"shop/application/services"
)

type OrderController struct {
	service *services.OrderService
}

func NewOrderController(service *services.OrderService) *OrderController {
	return &OrderController{service: service}
}

func (ctrl *OrderController) RegisterRoutes(rg *gin.RouterGroup, authRequired gin.HandlerFunc) {
	rg.POST("", authRequired, ctrl.Create)
	rg.GET("/my", authRequired, ctrl.GetMy)
	rg.GET("/:id", authRequired, ctrl.GetByID)
	rg.PUT("/:id/status", authRequired, ctrl.UpdateStatus)
}

// Create godoc
// @Summary      Оформить заказ
// @Tags         orders
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        request body dto.CreateOrderRequest true "Позиции заказа и промокод"
// @Success      200 {object} entities.Order
// @Failure      400 {object} map[string]string
// @Router       /orders [post]
func (ctrl *OrderController) Create(c *gin.Context) {
	claims := c.MustGet(middleware.ClaimsKey).(*jwt.Claims)

	var req dto.CreateOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	items := make([]services.OrderItemInput, 0, len(req.Items))
	for _, i := range req.Items {
		items = append(items, services.OrderItemInput{ProductSKU: i.ProductSKU, Quantity: i.Quantity})
	}

	order, err := ctrl.service.CreateOrder(c.Request.Context(), claims.Email, items, req.PromoCode)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, order)
}

// GetMy godoc
// @Summary      Мои заказы
// @Tags         orders
// @Security     BearerAuth
// @Produce      json
// @Success      200 {array} entities.Order
// @Router       /orders/my [get]
func (ctrl *OrderController) GetMy(c *gin.Context) {
	claims := c.MustGet(middleware.ClaimsKey).(*jwt.Claims)
	orders, err := ctrl.service.GetByUser(c.Request.Context(), claims.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, orders)
}

// GetByID godoc
// @Summary      Заказ по id
// @Tags         orders
// @Security     BearerAuth
// @Produce      json
// @Param        id path int true "ID заказа"
// @Success      200 {object} entities.Order
// @Failure      404 {object} map[string]string
// @Router       /orders/{id} [get]
func (ctrl *OrderController) GetByID(c *gin.Context) {
	id, err := parseIntParam(c, "id")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	order, err := ctrl.service.GetByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if order == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "order not found"})
		return
	}
	c.JSON(http.StatusOK, order)
}

// UpdateStatus godoc
// @Summary      Изменить статус заказа
// @Tags         orders
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        id path int true "ID заказа"
// @Param        request body object true "{\"status\": \"paid\"}"
// @Success      200 {object} entities.Order
// @Router       /orders/{id}/status [put]
func (ctrl *OrderController) UpdateStatus(c *gin.Context) {
	id, err := parseIntParam(c, "id")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	var body struct {
		Status string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	order, err := ctrl.service.UpdateStatus(c.Request.Context(), id, body.Status)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, order)
}
