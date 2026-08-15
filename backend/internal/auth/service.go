package auth

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"strings"
	"time"

	"github.com/bimal009/atithi/internal/account"
	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/internal/session"
	"github.com/bimal009/atithi/internal/user"
	"github.com/bimal009/atithi/pkg/apperr"
	"github.com/bimal009/atithi/pkg/utils"
	"github.com/bimal009/atithi/pkg/validator"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

const (
	otpDigits              = 6
	otpTTL                 = 5 * time.Minute
	otpResendCooldown      = 60 * time.Second
	placeholderEmailDomain = "atithi.com"
	// A 6-digit code is only a million guesses. Without a ceiling on attempts
	// any account can be taken over from its phone number alone.
	otpMaxAttempts = 5
)

type AuthService interface {
	Login(ctx context.Context, req *LoginRequest) (model.User, error)
	ValidateOtp(ctx context.Context, phoneNumber, otp string, meta SessionMeta) (model.User, session.Issued, error)
	Resend(ctx context.Context, phoneNumber string) error
	// Refresh rotates the session token; it only works while the session is
	// still alive.
	Refresh(ctx context.Context, rawToken string) (session.Issued, error)
	Logout(ctx context.Context, rawToken string) error
	Me(ctx context.Context, userID string) (model.User, error)
	Onboard(ctx context.Context, userID string, req *OnboardingRequest) (model.User, error)
}

func placeholderEmail(phoneNumber string) string {
	var digits strings.Builder
	for _, r := range phoneNumber {
		if r >= '0' && r <= '9' {
			digits.WriteRune(r)
		}
	}

	return digits.String() + "@" + placeholderEmailDomain
}

type authService struct {
	slog        *slog.Logger
	userRepo    user.UserRepo
	redis       *redis.Client
	accountRepo account.AccountRepo
	sessions    session.SessionService
	DB          *pgxpool.Pool
}

func NewAuthService(
	slog *slog.Logger,
	userRepo user.UserRepo,
	redisClient *redis.Client,
	accountRepo account.AccountRepo,
	sessions session.SessionService,
	db *pgxpool.Pool,
) AuthService {
	return &authService{
		slog:        slog,
		userRepo:    userRepo,
		redis:       redisClient,
		accountRepo: accountRepo,
		sessions:    sessions,
		DB:          db,
	}
}

func otpKey(phoneNumber string) string {
	return "otp:" + phoneNumber
}

func otpCooldownKey(phoneNumber string) string {
	return "otp:cooldown:" + phoneNumber
}

func otpAttemptsKey(phoneNumber string) string {
	return "otp:attempts:" + phoneNumber
}

// registerFailedAttempt counts a wrong guess and burns the code once the
// ceiling is hit, so the attacker has to request a new one and wait out the
// resend cooldown.
func (s *authService) registerFailedAttempt(ctx context.Context, phoneNumber string) error {
	attempts, err := s.redis.Incr(ctx, otpAttemptsKey(phoneNumber)).Result()
	if err != nil {
		return err
	}

	if attempts == 1 {
		s.redis.Expire(ctx, otpAttemptsKey(phoneNumber), otpTTL)
	}

	if attempts >= otpMaxAttempts {
		if err := s.deleteOTP(ctx, phoneNumber); err != nil {
			s.slog.Error("failed to burn otp after too many attempts", "phone", phoneNumber, "error", err)
		}
		s.slog.Warn("otp burned after too many failed attempts", "phone", phoneNumber, "attempts", attempts)
		return apperr.ErrTooManyOtpAttempts
	}

	return nil
}

func (s *authService) setOTP(ctx context.Context, phoneNumber, code string) error {
	return s.redis.Set(ctx, otpKey(phoneNumber), code, otpTTL).Err()
}

func (s *authService) getOTP(ctx context.Context, phoneNumber string) (string, error) {
	code, err := s.redis.Get(ctx, otpKey(phoneNumber)).Result()
	if err != nil {
		if errors.Is(err, redis.Nil) {
			return "", apperr.ErrVerificationNotFound
		}

		return "", err
	}

	return code, nil
}

func (s *authService) deleteOTP(ctx context.Context, phoneNumber string) error {
	return s.redis.Del(ctx, otpKey(phoneNumber)).Err()
}

func (s *authService) checkResendCooldown(ctx context.Context, phoneNumber string) error {
	ok, err := s.redis.SetNX(ctx, otpCooldownKey(phoneNumber), "1", otpResendCooldown).Result()
	if err != nil {
		return err
	}

	if !ok {
		return apperr.ErrTooManyRequests
	}

	return nil
}

func (s *authService) Login(ctx context.Context, req *LoginRequest) (model.User, error) {
	if err := validator.ValidateStruct(req); err != nil {
		return model.User{}, err
	}

	phoneNumber := req.PhoneNumber

	if err := s.checkResendCooldown(ctx, phoneNumber); err != nil {
		return model.User{}, err
	}

	existingUser, err := s.userRepo.GetByPhone(ctx, phoneNumber)
	if err != nil && !errors.Is(err, apperr.ErrUserNotFound) {
		return model.User{}, err
	}

	if err == nil {
		otp, err := utils.GenerateOTP(otpDigits)
		if err != nil {
			return model.User{}, fmt.Errorf("failed to generate otp: %w", err)
		}
		s.slog.Info("otp generated", "phone", existingUser.PhoneNumber, "otp", otp)

		if err := s.setOTP(ctx, existingUser.PhoneNumber, otp); err != nil {
			s.slog.Error("failed to store otp", "user_id", existingUser.ID, "error", err)
			return model.User{}, fmt.Errorf("failed to store otp: %w", err)
		}

		return existingUser, nil
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
		PhoneNumber:   phoneNumber,
		Name:          phoneNumber,
		Email:         placeholderEmail(phoneNumber),
		EmailVerified: false,
		CreatedAt:     now,
		UpdatedAt:     now,
		Role:          model.RoleUser,
	}

	createdUser, err := s.userRepo.Create(ctx, tx, newUser)
	if err != nil {
		s.slog.Error("failed to create user", "phone", phoneNumber, "error", err)
		return model.User{}, fmt.Errorf("failed to create user: %w", err)
	}

	otp, err := utils.GenerateOTP(otpDigits)
	if err != nil {
		return model.User{}, fmt.Errorf("failed to generate otp: %w", err)
	}
	s.slog.Info("otp generated", "phone", createdUser.PhoneNumber, "otp", otp)

	if err := s.setOTP(ctx, createdUser.PhoneNumber, otp); err != nil {
		s.slog.Error("failed to store otp", "user_id", createdUser.ID, "error", err)
		return model.User{}, fmt.Errorf("failed to store otp: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		s.slog.Error("failed to commit tx", "error", err)

		if delErr := s.deleteOTP(ctx, createdUser.PhoneNumber); delErr != nil {
			s.slog.Error("failed to discard otp after failed commit", "error", delErr)
		}

		return model.User{}, fmt.Errorf("failed to commit transaction: %w", err)
	}

	s.slog.Info("user registered", "user_id", createdUser.ID, "phone", createdUser.PhoneNumber)

	return createdUser, nil
}

func (s *authService) ValidateOtp(ctx context.Context, phoneNumber, otp string, meta SessionMeta) (model.User, session.Issued, error) {
	storedOTP, err := s.getOTP(ctx, phoneNumber)
	if err != nil {
		return model.User{}, session.Issued{}, err
	}

	if storedOTP != otp {
		if err := s.registerFailedAttempt(ctx, phoneNumber); err != nil {
			return model.User{}, session.Issued{}, err
		}
		return model.User{}, session.Issued{}, apperr.ErrInvalidOtp
	}

	s.redis.Del(ctx, otpAttemptsKey(phoneNumber))

	existingUser, err := s.userRepo.GetByPhone(ctx, phoneNumber)
	if err != nil {
		return model.User{}, session.Issued{}, err
	}

	tx, err := s.DB.Begin(ctx)
	if err != nil {
		s.slog.Error("failed to begin tx", "error", err)
		return model.User{}, session.Issued{}, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	if !existingUser.EmailVerified {
		existingUser.EmailVerified = true

		updatedUser, err := s.userRepo.UpdateTx(ctx, tx, &existingUser)
		if err != nil {
			s.slog.Error("failed to update user after otp validation", "user_id", existingUser.ID, "error", err)
			return model.User{}, session.Issued{}, err
		}

		existingUser = updatedUser
	}

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

	if err := s.deleteOTP(ctx, phoneNumber); err != nil {
		s.slog.Error("failed to delete otp after validation", "phone", phoneNumber, "error", err)
	}

	s.redis.Del(ctx, otpCooldownKey(phoneNumber))

	s.slog.Info("otp validated", "user_id", existingUser.ID, "session_id", issued.Session.ID, "phone", existingUser.PhoneNumber)

	return existingUser, issued, nil
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

	// A new address has not been proven to belong to them.
	if req.Email != existingUser.Email {
		existingUser.Email = req.Email
		existingUser.EmailVerified = false
	}

	existingUser.Name = req.Name
	if req.Image != nil {
		existingUser.Image = req.Image
	}
	existingUser.IsOnboarded = true

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

func (s *authService) Resend(ctx context.Context, phoneNumber string) error {
	if _, err := s.userRepo.GetByPhone(ctx, phoneNumber); err != nil {
		return err
	}

	if err := s.checkResendCooldown(ctx, phoneNumber); err != nil {
		return err
	}

	otp, err := utils.GenerateOTP(otpDigits)
	if err != nil {
		return fmt.Errorf("failed to generate otp: %w", err)
	}

	if err := s.setOTP(ctx, phoneNumber, otp); err != nil {
		s.slog.Error("failed to store otp", "phone", phoneNumber, "error", err)
		return fmt.Errorf("failed to store otp: %w", err)
	}

	s.slog.Info("otp resent", "phone", phoneNumber, "otp", otp)

	return nil
}
