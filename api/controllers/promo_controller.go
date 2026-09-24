package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"shop/api/dto"
	"shop/application/services"
)

type PromoController struct {
	service *services.PromoCodeService
}

func NewPromoController(service *services.PromoCodeService) *PromoController {
	return &PromoController{service: service}
}

func (ctrl *PromoController) RegisterRoutes(rg *gin.RouterGroup, authRequired gin.HandlerFunc, adminRequired gin.HandlerFunc) {
	rg.POST("/create", authRequired, adminRequired, ctrl.Create)
	rg.POST("/validate", authRequired, ctrl.Validate)
}

// Create godoc
// @Summary      Сгенерировать промокоды (admin)
// @Tags         promo
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        request body dto.CreatePromoRequest true "Параметры генерации"
// @Success      200 {array} entities.PromoCode
// @Router       /promo/create [post]
func (ctrl *PromoController) Create(c *gin.Context) {
	var req dto.CreatePromoRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	promos, err := ctrl.service.GeneratePromoCodes(c.Request.Context(), req.Count, req.Discount, req.ValidDays)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, promos)
}

// Validate godoc
// @Summary      Проверить промокод
// @Tags         promo
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        request body dto.ActivatePromoRequest true "Код промокода"
// @Success      200 {object} entities.PromoCode
// @Failure      400 {object} map[string]string
// @Router       /promo/validate [post]
func (ctrl *PromoController) Validate(c *gin.Context) {
	var req dto.ActivatePromoRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	promo, err := ctrl.service.Validate(c.Request.Context(), req.Code)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, promo)
}
