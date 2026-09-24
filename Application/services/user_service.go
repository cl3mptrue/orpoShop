package services

import (
	"context"
	"errors"

	"shop/domain/entities"
	"shop/domain/interfaces"
)

type UserService struct {
	userRepo interfaces.UserRepository
}

func NewUserService(userRepo interfaces.UserRepository) *UserService {
	return &UserService{userRepo: userRepo}
}

func (s *UserService) GetAll(ctx context.Context) ([]entities.User, error) {
	return s.userRepo.GetAll(ctx)
}

func (s *UserService) GetByEmail(ctx context.Context, email string) (*entities.User, error) {
	return s.userRepo.GetByEmail(ctx, email)
}

func (s *UserService) Register(ctx context.Context, email, password, fio string) (*entities.User, error) {
	existing, err := s.userRepo.GetByEmail(ctx, email)
	if err != nil {
		return nil, err
	}
	if existing != nil {
		return nil, errors.New("user already exists")
	}

	user, err := entities.NewUser(email, password, fio)
	if err != nil {
		return nil, err
	}

	if err := s.userRepo.Create(ctx, user); err != nil {
		return nil, err
	}
	return user, nil
}

func (s *UserService) Login(ctx context.Context, email, password string) (*entities.User, error) {
	user, err := s.userRepo.GetByEmail(ctx, email)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, errors.New("user not found")
	}
	if !user.IsActive {
		return nil, errors.New("user is not active")
	}
	if !user.CheckPassword(password) {
		return nil, errors.New("invalid email or password")
	}
	return user, nil
}

func (s *UserService) Deactivate(ctx context.Context, email string) error {
	user, err := s.userRepo.GetByEmail(ctx, email)
	if err != nil {
		return err
	}
	if user == nil {
		return errors.New("user not found")
	}
	user.Deactivate()
	return s.userRepo.Update(ctx, user)
}

func (s *UserService) Activate(ctx context.Context, email string) error {
	user, err := s.userRepo.GetByEmail(ctx, email)
	if err != nil {
		return err
	}
	if user == nil {
		return errors.New("user not found")
	}
	user.Activate()
	return s.userRepo.Update(ctx, user)
}
