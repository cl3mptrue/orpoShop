package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"shop/api/dto"
	"shop/application/services"
)

type ProductController struct {
	service *services.ProductService
}

func NewProductController(service *services.ProductService) *ProductController {
	return &ProductController{service: service}
}

func (ctrl *ProductController) RegisterRoutes(rg *gin.RouterGroup, authRequired gin.HandlerFunc, adminRequired gin.HandlerFunc) {
	rg.GET("/GetAll", ctrl.GetAll)
	rg.POST("/create", authRequired, adminRequired, ctrl.Create)
	rg.PUT("/:sku/price", authRequired, adminRequired, ctrl.ChangePrice)
}

// GetAll godoc
// @Summary      Список товаров
// @Tags         products
// @Produce      json
// @Success      200 {array} entities.Product
// @Router       /products/GetAll [get]
func (ctrl *ProductController) GetAll(c *gin.Context) {
	products, err := ctrl.service.GetAll(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, products)
}

// Create godoc
// @Summary      Создать товар (admin)
// @Tags         products
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        request body dto.CreateProductRequest true "Данные товара"
// @Success      200 {object} entities.Product
// @Router       /products/create [post]
func (ctrl *ProductController) Create(c *gin.Context) {
	var req dto.CreateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	product, err := ctrl.service.CreateProduct(c.Request.Context(), req.SKU, req.Name, req.InStock, req.Price)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, product)
}

// ChangePrice godoc
// @Summary      Изменить цену товара (admin)
// @Tags         products
// @Security     BearerAuth
// @Accept       json
// @Param        sku path string true "Артикул товара"
// @Param        request body dto.ChangePriceRequest true "Новая цена"
// @Success      204
// @Router       /products/{sku}/price [put]
func (ctrl *ProductController) ChangePrice(c *gin.Context) {
	sku := c.Param("sku")
	var req dto.ChangePriceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := ctrl.service.ChangePrice(c.Request.Context(), sku, req.Price); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusNoContent)
}
