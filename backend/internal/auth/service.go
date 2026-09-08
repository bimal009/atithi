package auth

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"log/slog"
	"time"

	"github.com/bimal009/atithi/config"
	"github.com/bimal009/atithi/internal/account"
	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/internal/session"
	"github.com/bimal009/atithi/internal/user"
	"github.com/bimal009/atithi/pkg/apperr"
	"github.com/bimal009/atithi/pkg/validator"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
	"golang.org/x/crypto/bcrypt"
	"golang.org/x/oauth2"
	googleoauth "golang.org/x/oauth2/google"
	"google.golang.org/api/idtoken"
)

type AuthService interface {
	LoginWithPassword(ctx context.Context, req *LoginRequest, meta SessionMeta) (model.User, session.Issued, error)
	Register(ctx context.Context, req *RegisterRequest) (model.User, error)

	GoogleAuthURL(ctx context.Context) (string, error)
	GoogleCallback(ctx context.Context, code, state string, meta SessionMeta) (model.User, session.Issued, error)

	Refresh(ctx context.Context, rawToken string) (session.Issued, error)
	Logout(ctx context.Context, rawToken string) error
	Me(ctx context.Context, userID string) (model.User, error)
	Onboard(ctx context.Context, userID string, req *OnboardingRequest) (model.User, error)
}

type authService struct {
	slog        *slog.Logger
	userRepo    user.UserRepo
	redis       *redis.Client
	accountRepo account.AccountRepo
	sessions    session.SessionService
	DB          *pgxpool.Pool
	oauthConfig *oauth2.Config
	cfg         config.AuthConfig
}

func NewAuthService(
	slog *slog.Logger,
	userRepo user.UserRepo,
	redisClient *redis.Client,
	accountRepo account.AccountRepo,
	sessions session.SessionService,
	db *pgxpool.Pool,
	cfg config.AuthConfig,
	googleClientID, googleClientSecret, googleRedirectURL string,
) AuthService {
	return &authService{
		slog:        slog,
		userRepo:    userRepo,
		redis:       redisClient,
		accountRepo: accountRepo,
		sessions:    sessions,
		DB:          db,
		cfg:         cfg,
		oauthConfig: &oauth2.Config{
			ClientID:     googleClientID,
			ClientSecret: googleClientSecret,
			RedirectURL:  googleRedirectURL,
			Scopes:       []string{"openid", "email", "profile"},
			Endpoint:     googleoauth.Endpoint,
		},
	}
}

func (s *authService) hashPassword(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), s.cfg.BcryptCost)
	if err != nil {
		return "", err
	}
	return string(hash), nil
}

func checkPassword(hash, password string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)) == nil
}

func (s *authService) generateState() (string, error) {
	b := make([]byte, s.cfg.OAuthStateBytes)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(b), nil
}

func oauthStateKey(state string) string {
	return "oauth:state:" + state
}

func (s *authService) Register(ctx context.Context, req *RegisterRequest) (model.User, error) {
	if err := validator.ValidateStruct(req); err != nil {
		return model.User{}, err
	}

	_, err := s.userRepo.GetByEmail(ctx, req.Email)
	if err == nil {
		return model.User{}, apperr.ErrEmailTaken
	}
	if !errors.Is(err, apperr.ErrUserNotFound) {
		return model.User{}, err
	}

	passwordHash, err := s.hashPassword(req.Password)
	if err != nil {
		s.slog.Error("failed to hash password", "error", err)
		return model.User{}, fmt.Errorf("failed to hash password: %w", err)
	}

	tx, err := s.DB.Begin(ctx)
	if err != nil {
		s.slog.Error("failed to begin tx", "error", err)
		return model.User{}, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	now := time.Now()
	newUser := &model.User{
		ID:            uuid.NewString(),
		Email:         req.Email,
		Name:          req.Name,
		EmailVerified: false,
		CreatedAt:     now,
		UpdatedAt:     now,
		Role:          model.RoleUser,
	}

	createdUser, err := s.userRepo.Create(ctx, tx, newUser)
	if err != nil {
		s.slog.Error("failed to create user", "email", req.Email, "error", err)
		return model.User{}, fmt.Errorf("failed to create user: %w", err)
	}

	credAccount := &model.Account{
		ID:         uuid.NewString(),
		AccountID:  createdUser.ID,
		ProviderID: s.cfg.ProviderCredential,
		UserID:     createdUser.ID,
		Password:   &passwordHash,
	}

	if _, err := s.accountRepo.Create(ctx, tx, credAccount); err != nil {
		if errors.Is(err, apperr.ErrAccountAlreadyExists) {
			return model.User{}, apperr.ErrEmailTaken
		}
		s.slog.Error("failed to create credential account", "user_id", createdUser.ID, "error", err)
		return model.User{}, fmt.Errorf("failed to create credential account: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		s.slog.Error("failed to commit tx", "error", err)
		return model.User{}, fmt.Errorf("failed to commit transaction: %w", err)
	}

	s.slog.Info("user registered", "user_id", createdUser.ID, "email", createdUser.Email)

	return createdUser, nil
}
func (s *authService) LoginWithPassword(ctx context.Context, req *LoginRequest, meta SessionMeta) (model.User, session.Issued, error) {
	if err := validator.ValidateStruct(req); err != nil {
		return model.User{}, session.Issued{}, err
	}

	existingUser, err := s.userRepo.GetByEmail(ctx, req.Email)
	if err != nil {
		if errors.Is(err, apperr.ErrUserNotFound) {
			return model.User{}, session.Issued{}, apperr.ErrInvalidCredentials
		}
		return model.User{}, session.Issued{}, err
	}

	accounts, err := s.accountRepo.GetByUserID(ctx, existingUser.ID)
	if err != nil {
		return model.User{}, session.Issued{}, err
	}

	if len(accounts) == 0 || accounts[0].ProviderID != s.cfg.ProviderCredential {
		return model.User{}, session.Issued{}, apperr.ErrInvalidCredentials
	}

	credAccount := accounts[0]

	if credAccount.Password == nil || !checkPassword(*credAccount.Password, req.Password) {
		return model.User{}, session.Issued{}, apperr.ErrInvalidCredentials
	}

	tx, err := s.DB.Begin(ctx)
	if err != nil {
		s.slog.Error("failed to begin tx", "error", err)
		return model.User{}, session.Issued{}, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	issued, err := s.sessions.Issue(ctx, tx, existingUser.ID, session.Meta{
		IPAddress: meta.IPAddress,
		UserAgent: meta.UserAgent,
	})
	if err != nil {
		return model.User{}, session.Issued{}, err
	}

	if err := tx.Commit(ctx); err != nil {
		s.slog.Error("failed to commit tx", "error", err)
		return model.User{}, session.Issued{}, fmt.Errorf("failed to commit transaction: %w", err)
	}

	s.slog.Info("user logged in", "user_id", existingUser.ID, "session_id", issued.Session.ID)

	return existingUser, issued, nil
}
func (s *authService) GoogleAuthURL(ctx context.Context) (string, error) {
	state, err := s.generateState()
	if err != nil {
		return "", fmt.Errorf("failed to generate state: %w", err)
	}

	if err := s.redis.Set(ctx, oauthStateKey(state), "1", s.cfg.OAuthStateTTL).Err(); err != nil {
		s.slog.Error("failed to store oauth state", "error", err)
		return "", fmt.Errorf("failed to store oauth state: %w", err)
	}

	url := s.oauthConfig.AuthCodeURL(state, oauth2.AccessTypeOnline)
	return url, nil
}

func (s *authService) GoogleCallback(ctx context.Context, code, state string, meta SessionMeta) (model.User, session.Issued, error) {
	if state == "" || code == "" {
		return model.User{}, session.Issued{}, apperr.ErrInvalidCredentials
	}

	deleted, err := s.redis.Del(ctx, oauthStateKey(state)).Result()
	if err != nil {
		s.slog.Error("failed to check oauth state", "error", err)
		return model.User{}, session.Issued{}, fmt.Errorf("failed to check oauth state: %w", err)
	}
	if deleted == 0 {
		s.slog.Warn("oauth state mismatch or expired", "state", state)
		return model.User{}, session.Issued{}, apperr.ErrInvalidCredentials
	}

	token, err := s.oauthConfig.Exchange(ctx, code)
	if err != nil {
		s.slog.Warn("failed to exchange oauth code", "error", err)
		return model.User{}, session.Issued{}, apperr.ErrInvalidCredentials
	}

	rawIDToken, ok := token.Extra("id_token").(string)
	if !ok || rawIDToken == "" {
		s.slog.Error("google token exchange missing id_token")
		return model.User{}, session.Issued{}, apperr.ErrInvalidCredentials
	}

	payload, err := idtoken.Validate(ctx, rawIDToken, s.oauthConfig.ClientID)
	if err != nil {
		s.slog.Warn("invalid google id token", "error", err)
		return model.User{}, session.Issued{}, apperr.ErrInvalidCredentials
	}

	email, _ := payload.Claims["email"].(string)
	emailVerified, _ := payload.Claims["email_verified"].(bool)
	name, _ := payload.Claims["name"].(string)
	googleSubject := payload.Subject

	if email == "" {
		return model.User{}, session.Issued{}, apperr.ErrInvalidCredentials
	}

	tx, err := s.DB.Begin(ctx)
	if err != nil {
		s.slog.Error("failed to begin tx", "error", err)
		return model.User{}, session.Issued{}, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	existingAccount, err := s.accountRepo.GetByProviderAndAccountID(ctx, s.cfg.ProviderGoogle, googleSubject)

	var resultUser model.User

	switch {
	case err == nil:
		resultUser, err = s.userRepo.Get(ctx, existingAccount.UserID)
		if err != nil {
			return model.User{}, session.Issued{}, err
		}

	case errors.Is(err, apperr.ErrAccountNotFound):
		_, getErr := s.userRepo.GetByEmail(ctx, email)

		switch {
		case getErr == nil:
			return model.User{}, session.Issued{}, apperr.ErrAccountMethodMismatch

		case errors.Is(getErr, apperr.ErrUserNotFound):
			now := time.Now()
			newUser := &model.User{
				ID:            uuid.NewString(),
				Email:         email,
				Name:          name,
				EmailVerified: emailVerified,
				CreatedAt:     now,
				UpdatedAt:     now,
				Role:          model.RoleUser,
			}

			createdUser, createErr := s.userRepo.Create(ctx, tx, newUser)
			if createErr != nil {
				s.slog.Error("failed to create user via google", "email", email, "error", createErr)
				return model.User{}, session.Issued{}, fmt.Errorf("failed to create user: %w", createErr)
			}
			resultUser = createdUser

			googleAccount := &model.Account{
				ID:         uuid.NewString(),
				AccountID:  googleSubject,
				ProviderID: s.cfg.ProviderGoogle,
				UserID:     resultUser.ID,
				IDToken:    &rawIDToken,
			}

			if _, createErr := s.accountRepo.Create(ctx, tx, googleAccount); createErr != nil {
				if errors.Is(createErr, apperr.ErrAccountAlreadyExists) {
					return model.User{}, session.Issued{}, apperr.ErrAccountMethodMismatch
				}
				s.slog.Error("failed to create google account", "user_id", resultUser.ID, "error", createErr)
				return model.User{}, session.Issued{}, createErr
			}

		default:
			return model.User{}, session.Issued{}, getErr
		}

	default:
		return model.User{}, session.Issued{}, err
	}

	issued, err := s.sessions.Issue(ctx, tx, resultUser.ID, session.Meta{
		IPAddress: meta.IPAddress,
		UserAgent: meta.UserAgent,
	})
	if err != nil {
		return model.User{}, session.Issued{}, err
	}

	if err := tx.Commit(ctx); err != nil {
		s.slog.Error("failed to commit tx", "error", err)
		return model.User{}, session.Issued{}, fmt.Errorf("failed to commit transaction: %w", err)
	}

	s.slog.Info("user logged in via google", "user_id", resultUser.ID, "session_id", issued.Session.ID)

	return resultUser, issued, nil
}

func (s *authService) Refresh(ctx context.Context, rawToken string) (session.Issued, error) {
	return s.sessions.Refresh(ctx, rawToken)
}

func (s *authService) Logout(ctx context.Context, rawToken string) error {
	return s.sessions.Revoke(ctx, rawToken)
}

func (s *authService) Me(ctx context.Context, userID string) (model.User, error) {
	return s.userRepo.Get(ctx, userID)
}

func (s *authService) Onboard(ctx context.Context, userID string, req *OnboardingRequest) (model.User, error) {
	if err := validator.ValidateStruct(req); err != nil {
		return model.User{}, err
	}

	existingUser, err := s.userRepo.Get(ctx, userID)
	if err != nil {
		return model.User{}, err
	}

	if req.Email != existingUser.Email {
		existingUser.Email = req.Email
		existingUser.EmailVerified = false
	}

	existingUser.Name = req.Name
	if req.Image != nil {
		existingUser.Image = req.Image
	}

	updatedUser, err := s.userRepo.Update(ctx, &existingUser)
	if err != nil {
		if errors.Is(err, apperr.ErrUserAlreadyExists) {
			return model.User{}, apperr.ErrEmailTaken
		}
		s.slog.Error("failed to onboard user", "user_id", userID, "error", err)
		return model.User{}, fmt.Errorf("failed to onboard user: %w", err)
	}

	s.slog.Info("user onboarded", "user_id", updatedUser.ID)

	return updatedUser, nil
}
