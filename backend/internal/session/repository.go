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
		INSERT INTO sessions (
			id,
			user_id,
			token,
			ip_address,
			user_agent,
			expires_at
		)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, user_id, token, ip_address, user_agent, expires_at, created_at, updated_at
	`

	var created model.Session

	err := tx.QueryRow(
		ctx,
		query,
		session.ID,
		session.UserID,
		session.Token,
		session.IPAddress,
		session.UserAgent,
		session.ExpiresAt,
	).Scan(
		&created.ID,
		&created.UserID,
		&created.Token,
		&created.IPAddress,
		&created.UserAgent,
		&created.ExpiresAt,
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
		SELECT id, user_id, token, ip_address, user_agent, expires_at, created_at, updated_at
		FROM sessions
		WHERE id = $1
	`

	var s model.Session

	err := r.DB.QueryRow(ctx, query, id).Scan(
		&s.ID,
		&s.UserID,
		&s.Token,
		&s.IPAddress,
		&s.UserAgent,
		&s.ExpiresAt,
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
