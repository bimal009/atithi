package session

import (
	"context"
	"errors"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/pkg/apperr"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type SessionRepo interface {
	Create(ctx context.Context, tx pgx.Tx, session *model.Session) (model.Session, error)
	GetById(ctx context.Context, id string) (model.Session, error)
	GetByTokenHash(ctx context.Context, tokenHash string) (model.Session, error)
	Rotate(ctx context.Context, currentHash, newHash string, idleSeconds float64) (model.Session, error)
	DeleteByTokenHash(ctx context.Context, tokenHash string) error
	DeleteExpired(ctx context.Context) (int64, error)
}

type sessionRepo struct {
	DB *pgxpool.Pool
}

func NewSessionRepo(db *pgxpool.Pool) SessionRepo {
	return &sessionRepo{
		DB: db,
	}
}

func (r *sessionRepo) Create(ctx context.Context, tx pgx.Tx, session *model.Session) (model.Session, error) {
	query := `
		INSERT INTO sessions (id, user_id, token_hash, ip_address, user_agent, expires_at, absolute_expires_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, user_id, token_hash, ip_address, user_agent, expires_at, absolute_expires_at, created_at, updated_at
	`

	var created model.Session

	err := tx.QueryRow(
		ctx, query,
		session.ID,
		session.UserID,
		session.TokenHash,
		session.IPAddress,
		session.UserAgent,
		session.ExpiresAt,
		session.AbsoluteExpiresAt,
	).Scan(
		&created.ID,
		&created.UserID,
		&created.TokenHash,
		&created.IPAddress,
		&created.UserAgent,
		&created.ExpiresAt,
		&created.AbsoluteExpiresAt,
		&created.CreatedAt,
		&created.UpdatedAt,
	)

	if err != nil {
		return model.Session{}, err
	}

	return created, nil
}

func (r *sessionRepo) GetById(ctx context.Context, id string) (model.Session, error) {
	query := `
		SELECT id, user_id, token_hash, ip_address, user_agent, expires_at, absolute_expires_at, created_at, updated_at
		FROM sessions
		WHERE id = $1
	`

	var s model.Session

	err := r.DB.QueryRow(ctx, query, id).Scan(
		&s.ID,
		&s.UserID,
		&s.TokenHash,
		&s.IPAddress,
		&s.UserAgent,
		&s.ExpiresAt,
		&s.AbsoluteExpiresAt,
		&s.CreatedAt,
		&s.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.Session{}, apperr.ErrSessionNotFound
		}
		return model.Session{}, err
	}

	return s, nil
}

func (r *sessionRepo) GetByTokenHash(ctx context.Context, tokenHash string) (model.Session, error) {
	query := `
		SELECT id, user_id, token_hash, ip_address, user_agent, expires_at, absolute_expires_at, created_at, updated_at
		FROM sessions
		WHERE token_hash = $1
	`

	var s model.Session

	err := r.DB.QueryRow(ctx, query, tokenHash).Scan(
		&s.ID,
		&s.UserID,
		&s.TokenHash,
		&s.IPAddress,
		&s.UserAgent,
		&s.ExpiresAt,
		&s.AbsoluteExpiresAt,
		&s.CreatedAt,
		&s.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.Session{}, apperr.ErrSessionNotFound
		}
		return model.Session{}, err
	}

	return s, nil
}

// Rotate swaps the token and pushes the idle deadline out, clamped to
// absolute_expires_at. The deadline checks sit in the WHERE clause so an
// expired token can never be traded for a fresh one.
func (r *sessionRepo) Rotate(ctx context.Context, currentHash, newHash string, idleSeconds float64) (model.Session, error) {
	query := `
		UPDATE sessions
		SET token_hash = $2,
			expires_at = LEAST(now() + make_interval(secs => $3::double precision), absolute_expires_at),
			updated_at = now()
		WHERE token_hash = $1 AND expires_at > now() AND absolute_expires_at > now()
		RETURNING id, user_id, token_hash, ip_address, user_agent, expires_at, absolute_expires_at, created_at, updated_at
	`

	var rotated model.Session

	err := r.DB.QueryRow(ctx, query, currentHash, newHash, idleSeconds).Scan(
		&rotated.ID,
		&rotated.UserID,
		&rotated.TokenHash,
		&rotated.IPAddress,
		&rotated.UserAgent,
		&rotated.ExpiresAt,
		&rotated.AbsoluteExpiresAt,
		&rotated.CreatedAt,
		&rotated.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.Session{}, apperr.ErrSessionExpired
		}
		return model.Session{}, err
	}

	return rotated, nil
}

func (r *sessionRepo) DeleteByTokenHash(ctx context.Context, tokenHash string) error {
	result, err := r.DB.Exec(ctx, `DELETE FROM sessions WHERE token_hash = $1`, tokenHash)
	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return apperr.ErrSessionNotFound
	}

	return nil
}

func (r *sessionRepo) DeleteExpired(ctx context.Context) (int64, error) {
	result, err := r.DB.Exec(ctx, `
		DELETE FROM sessions
		WHERE expires_at <= now() OR absolute_expires_at <= now()
	`)
	if err != nil {
		return 0, err
	}

	return result.RowsAffected(), nil
}
