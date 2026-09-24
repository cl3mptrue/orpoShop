package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"shop/api/dto"
	"shop/api/jwt"
	"shop/application/services"
)

type UserController struct {
	service    *services.UserService
	jwtService *jwt.Service
}

func NewUserController(service *services.UserService, jwtService *jwt.Service) *UserController {
	return &UserController{service: service, jwtService: jwtService}
}

func (ctrl *UserController) RegisterRoutes(rg *gin.RouterGroup, authRequired gin.HandlerFunc, adminRequired gin.HandlerFunc) {
	rg.GET("/GetAll", ctrl.GetAll)
	rg.POST("/register", ctrl.Register)
	rg.POST("/login", ctrl.Login)
	rg.PUT("/:id/delete", authRequired, adminRequired, ctrl.Deactivate)
	rg.PUT("/:id/activate", authRequired, adminRequired, ctrl.Activate)
}

// GetAll godoc
// @Summary      Список пользователей
// @Tags         users
// @Produce      json
// @Success      200 {array} entities.User
// @Router       /users/GetAll [get]
func (ctrl *UserController) GetAll(c *gin.Context) {
	users, err := ctrl.service.GetAll(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, users)
}

// Register godoc
// @Summary      Регистрация пользователя
// @Tags         users
// @Accept       json
// @Produce      json
// @Param        request body dto.CreateUserRequest true "Данные регистрации"
// @Success      200 {object} map[string]interface{}
// @Failure      400 {object} map[string]string
// @Router       /users/register [post]
func (ctrl *UserController) Register(c *gin.Context) {
	var req dto.CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := ctrl.service.Register(c.Request.Context(), req.Email, req.Password, req.Fio)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"email":     user.Email,
		"fio":       user.Fio,
		"is_active": user.IsActive,
	})
}

// Login godoc
// @Summary      Вход и получение JWT-токена
// @Tags         users
// @Accept       json
// @Produce      json
// @Param        request body dto.LoginUserRequest true "Логин и пароль"
// @Success      200 {object} map[string]string
// @Failure      401 {object} map[string]string
// @Router       /users/login [post]
func (ctrl *UserController) Login(c *gin.Context) {
	var req dto.LoginUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := ctrl.service.Login(c.Request.Context(), req.Email, req.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	token, err := ctrl.jwtService.GenerateToken(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"token": token})
}

// Deactivate godoc
// @Summary      Деактивировать пользователя (admin)
// @Tags         users
// @Security     BearerAuth
// @Param        id path string true "Email пользователя"
// @Success      204
// @Router       /users/{id}/delete [put]
func (ctrl *UserController) Deactivate(c *gin.Context) {
	email := c.Param("id") // почта — первичный ключ пользователя
	if err := ctrl.service.Deactivate(c.Request.Context(), email); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusNoContent)
}

// Activate godoc
// @Summary      Активировать пользователя (admin)
// @Tags         users
// @Security     BearerAuth
// @Param        id path string true "Email пользователя"
// @Success      204
// @Router       /users/{id}/activate [put]
func (ctrl *UserController) Activate(c *gin.Context) {
	email := c.Param("id")
	if err := ctrl.service.Activate(c.Request.Context(), email); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusNoContent)
}
