package entities

import (
	"errors"
	"time"
	"unicode"

	"golang.org/x/crypto/bcrypt"
)

const (
	RoleUser  = "user"
	RoleAdmin = "admin"
)

// User соответствует сущности "ПОЛЬЗОВАТЕЛЬ" на диаграмме: почта (PK), роль, пароль, ФИО.
type User struct {
	Email     string `gorm:"column:email;primaryKey" json:"email"`
	Role      string `gorm:"column:role;not null;default:user" json:"role"`
	Password  string `gorm:"column:password;not null" json:"-"`
	Fio       string `gorm:"column:fio;not null" json:"fio"`
	IsActive  bool   `gorm:"column:is_active;not null;default:true" json:"is_active"`
	CreatedAt time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
}

// isPasswordValid — ручная проверка вместо regex-lookahead'ов (Go's regexp/RE2 их не поддерживает):
// минимум 12 символов, есть строчная, заглавная, цифра и спецсимвол.
func isPasswordValid(password string) bool {
	if len(password) < 12 {
		return false
	}
	var hasLower, hasUpper, hasDigit, hasSpecial bool
	for _, r := range password {
		switch {
		case unicode.IsLower(r):
			hasLower = true
		case unicode.IsUpper(r):
			hasUpper = true
		case unicode.IsDigit(r):
			hasDigit = true
		default:
			hasSpecial = true
		}
	}
	return hasLower && hasUpper && hasDigit && hasSpecial
}

// NewUser создаёт нового пользователя с хэшированием пароля и валидацией,
// аналогично конструктору User в исходном C# коде.
func NewUser(email, password, fio string) (*User, error) {
	if email == "" {
		return nil, errors.New("email cannot be empty")
	}
	if password == "" || !isPasswordValid(password) {
		return nil, errors.New("password does not meet complexity requirements")
	}
	if fio == "" {
		return nil, errors.New("fio cannot be empty")
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	return &User{
		Email:    email,
		Password: string(hashed),
		Fio:      fio,
		Role:     RoleUser,
		IsActive: true,
	}, nil
}

func (u *User) CheckPassword(password string) bool {
	return bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password)) == nil
}

func (u *User) Activate()   { u.IsActive = true }
func (u *User) Deactivate() { u.IsActive = false }
