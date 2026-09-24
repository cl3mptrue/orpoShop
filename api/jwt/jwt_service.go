package jwt

import (
	"time"

	"github.com/golang-jwt/jwt/v5"

	"shop/domain/entities"
)

type Service struct {
	secret []byte
	issuer string
}

func NewService(secret, issuer string) *Service {
	return &Service{secret: []byte(secret), issuer: issuer}
}

type Claims struct {
	Email string `json:"email"`
	Role  string `json:"role"`
	jwt.RegisteredClaims
}

// GenerateToken — аналог JwtService.GenerateToken из C#: email в качестве subject, роль в claims.
func (s *Service) GenerateToken(user *entities.User) (string, error) {
	claims := Claims{
		Email: user.Email,
		Role:  user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   user.Email,
			Issuer:    s.issuer,
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(s.secret)
}

func (s *Service) ParseToken(tokenString string) (*Claims, error) {
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(t *jwt.Token) (interface{}, error) {
		return s.secret, nil
	})
	if err != nil || !token.Valid {
		return nil, err
	}
	return claims, nil
}
