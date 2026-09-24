package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"shop/api/jwt"
)

const ClaimsKey = "claims"

// RequireAuth — аналог атрибута [Authorize].
func RequireAuth(jwtService *jwt.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		header := c.GetHeader("Authorization")
		if header == "" || !strings.HasPrefix(header, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing token"})
			return
		}

		tokenString := strings.TrimPrefix(header, "Bearer ")
		claims, err := jwtService.ParseToken(tokenString)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			return
		}

		c.Set(ClaimsKey, claims)
		c.Next()
	}
}

// RequireRole — аналог [Authorize(Roles = "Admin")]. Вызывать после RequireAuth.
func RequireRole(role string) gin.HandlerFunc {
	return func(c *gin.Context) {
		claims := c.MustGet(ClaimsKey).(*jwt.Claims)
		if claims.Role != role {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "forbidden"})
			return
		}
		c.Next()
	}
}
