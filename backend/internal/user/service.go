package user

import (
	"context"
	"errors"
	"log/slog"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/pkg/apperr"
	"github.com/bimal009/atithi/pkg/validator"
)

type UserService interface {
	// CreateUser(ctx context.Context, req CreateUserRequest) (model.User, error)
	GetUser(ctx context.Context, id string) (model.User, error)
	GetUserByEmail(ctx context.Context, email string) (model.User, error)
	ListUsers(ctx context.Context) ([]model.User, error)
	UpdateUser(ctx context.Context, id string, req CreateUserRequest) (model.User, error)
	DeleteUser(ctx context.Context, id string) error
}

type userService struct {
	slog     *slog.Logger
	userRepo userRepo
}

func NewUserService(logger *slog.Logger, userRepo userRepo) UserService {
	return &userService{
		slog:     logger,
		userRepo: userRepo,
	}
}

// func (s *userService) CreateUser(ctx context.Context, req CreateUserRequest) (model.User, error) {
// 	if err := validator.ValidateStruct(req); err != nil {
// 		s.slog.Warn("create user validation failed", "email", req.Email, "error", err)
// 		return model.User{}, err
// 	}

// 	_, err := s.userRepo.GetByEmail(ctx, req.Email)
// 	if err == nil {
// 		s.slog.Warn("user already exists", "email", req.Email)
// 		return model.User{}, apperr.ErrUserAlreadyExists
// 	}
// 	if !errors.Is(err, apperr.ErrUserNotFound) {
// 		s.slog.Error("failed to check existing user", "email", req.Email, "error", err)
// 		return model.User{}, err
// 	}

// 	newUser := &model.User{
// 		ID:    uuid.NewString(),
// 		Name:  req.Name,
// 		Email: req.Email,
// 	}

// 	created, err := s.userRepo.Create(ctx, newUser)
// 	if err != nil {
// 		s.slog.Error("failed to create user", "email", req.Email, "error", err)
// 		return model.User{}, err
// 	}

// 	s.slog.Info("user created", "user_id", created.ID, "email", created.Email)
// 	return created, nil
// }

func (s *userService) GetUser(ctx context.Context, id string) (model.User, error) {
	user, err := s.userRepo.Get(ctx, id)
	if err != nil {
		if !errors.Is(err, apperr.ErrUserNotFound) {
			s.slog.Error("failed to get user", "id", id, "error", err)
		}
		return model.User{}, err
	}
	return user, nil
}

func (s *userService) GetUserByEmail(ctx context.Context, email string) (model.User, error) {
	user, err := s.userRepo.GetByEmail(ctx, email)
	if err != nil {
		if !errors.Is(err, apperr.ErrUserNotFound) {
			s.slog.Error("failed to get user by email", "email", email, "error", err)
		}
		return model.User{}, err
	}
	return user, nil
}

func (s *userService) ListUsers(ctx context.Context) ([]model.User, error) {
	users, err := s.userRepo.GetAll(ctx)
	if err != nil {
		s.slog.Error("failed to list users", "error", err)
		return nil, err
	}
	return users, nil
}

func (s *userService) UpdateUser(ctx context.Context, id string, req CreateUserRequest) (model.User, error) {
	if err := validator.ValidateStruct(req); err != nil {
		s.slog.Warn("update user validation failed", "id", id, "error", err)
		return model.User{}, err
	}

	existing, err := s.userRepo.Get(ctx, id)
	if err != nil {
		if !errors.Is(err, apperr.ErrUserNotFound) {
			s.slog.Error("failed to fetch user for update", "id", id, "error", err)
		}
		return model.User{}, err
	}

	existing.Name = req.Name
	existing.Email = req.Email

	updated, err := s.userRepo.Update(ctx, &existing)
	if err != nil {
		s.slog.Error("failed to update user", "id", id, "error", err)
		return model.User{}, err
	}

	s.slog.Info("user updated", "user_id", updated.ID)
	return updated, nil
}

func (s *userService) DeleteUser(ctx context.Context, id string) error {
	if err := s.userRepo.Delete(ctx, id); err != nil {
		if !errors.Is(err, apperr.ErrUserNotFound) {
			s.slog.Error("failed to delete user", "id", id, "error", err)
		}
		return err
	}

	s.slog.Info("user deleted", "user_id", id)
	return nil
}
