package session

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/pkg/apperr"
	"github.com/bimal009/atithi/pkg/hash"
	"github.com/bimal009/atithi/pkg/utils"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

type Issued struct {
	Session model.Session
	Token   string
}

type Meta struct {
	IPAddress string
	UserAgent string
}

type SessionService interface {
	Issue(ctx context.Context, tx pgx.Tx, userID string, meta Meta) (Issued, error)
	Authenticate(ctx context.Context, rawToken string) (model.Session, error)
	Refresh(ctx context.Context, rawToken string) (Issued, error)
	Revoke(ctx context.Context, rawToken string) error
	PurgeExpired(ctx context.Context) (int64, error)
}

type sessionService struct {
	slog        *slog.Logger
	repo        SessionRepo
	idleTTL     time.Duration
	absoluteTTL time.Duration
}

func NewSessionService(slog *slog.Logger, repo SessionRepo, idleTTL, absoluteTTL time.Duration) SessionService {
	return &sessionService{
		slog:        slog,
		repo:        repo,
		idleTTL:     idleTTL,
		absoluteTTL: absoluteTTL,
	}
}

func (s *sessionService) Issue(ctx context.Context, tx pgx.Tx, userID string, meta Meta) (Issued, error) {
	rawToken, err := utils.GenerateSessionToken()
	if err != nil {
		return Issued{}, fmt.Errorf("failed to generate session token: %w", err)
	}

	now := time.Now()

	newSession := &model.Session{
		ID:                uuid.NewString(),
		UserID:            userID,
		TokenHash:         hash.Token(rawToken),
		ExpiresAt:         now.Add(s.idleTTL),
		AbsoluteExpiresAt: now.Add(s.absoluteTTL),
		IPAddress:         optionalString(meta.IPAddress),
		UserAgent:         optionalString(meta.UserAgent),
	}

	created, err := s.repo.Create(ctx, tx, newSession)
	if err != nil {
		s.slog.Error("failed to create session", "user_id", userID, "error", err)
		return Issued{}, fmt.Errorf("failed to create session: %w", err)
	}

	return Issued{Session: created, Token: rawToken}, nil
}

func (s *sessionService) Authenticate(ctx context.Context, rawToken string) (model.Session, error) {
	if rawToken == "" {
		return model.Session{}, apperr.ErrSessionNotFound
	}

	found, err := s.repo.GetByTokenHash(ctx, hash.Token(rawToken))
	if err != nil {
		return model.Session{}, err
	}

	now := time.Now()
	if !found.ExpiresAt.After(now) || !found.AbsoluteExpiresAt.After(now) {
		return model.Session{}, apperr.ErrSessionExpired
	}

	return found, nil
}

func (s *sessionService) Refresh(ctx context.Context, rawToken string) (Issued, error) {
	if rawToken == "" {
		return Issued{}, apperr.ErrSessionNotFound
	}

	newToken, err := utils.GenerateSessionToken()
	if err != nil {
		return Issued{}, fmt.Errorf("failed to generate session token: %w", err)
	}

	rotated, err := s.repo.Rotate(ctx, hash.Token(rawToken), hash.Token(newToken), s.idleTTL.Seconds())
	if err != nil {
		return Issued{}, err
	}

	s.slog.Info("session refreshed",
		"session_id", rotated.ID,
		"user_id", rotated.UserID,
		"expires_at", rotated.ExpiresAt,
	)

	return Issued{Session: rotated, Token: newToken}, nil
}

func (s *sessionService) Revoke(ctx context.Context, rawToken string) error {
	if rawToken == "" {
		return apperr.ErrSessionNotFound
	}

	return s.repo.DeleteByTokenHash(ctx, hash.Token(rawToken))
}

func (s *sessionService) PurgeExpired(ctx context.Context) (int64, error) {
	return s.repo.DeleteExpired(ctx)
}

func optionalString(value string) *string {
	if value == "" {
		return nil
	}

	return &value
}
