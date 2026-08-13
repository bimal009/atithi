package account

import (
	"context"
	"errors"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/pkg/apperr"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type AccountRepo interface {
	Create(ctx context.Context, tx pgx.Tx, account *model.Account) (model.Account, error)
	GetByUserID(ctx context.Context, userID string) ([]model.Account, error)
	GetByProviderAndAccountID(ctx context.Context, providerID, accountID string) (model.Account, error)
	Update(ctx context.Context, account *model.Account) (model.Account, error)
	Delete(ctx context.Context, id string) error
}

type accountRepo struct {
	DB *pgxpool.Pool
}

func NewAccountRepo(db *pgxpool.Pool) AccountRepo {
	return &accountRepo{DB: db}
}

func (r *accountRepo) Create(ctx context.Context, tx pgx.Tx, account *model.Account) (model.Account, error) {
	query := `
		INSERT INTO accounts (
			id,
			account_id,
			provider_id,
			user_id,
			access_token,
			refresh_token,
			id_token,
			access_token_expires_at,
			refresh_token_expires_at,
			scope,
			password
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		RETURNING
			id, account_id, provider_id, user_id,
			access_token, refresh_token, id_token,
			access_token_expires_at, refresh_token_expires_at,
			scope, password, created_at, updated_at
	`

	var created model.Account

	err := tx.QueryRow(ctx, query,
		account.ID, account.AccountID, account.ProviderID, account.UserID,
		account.AccessToken, account.RefreshToken, account.IDToken,
		account.AccessTokenExpiresAt, account.RefreshTokenExpiresAt,
		account.Scope, account.Password,
	).Scan(
		&created.ID,
		&created.AccountID,
		&created.ProviderID,
		&created.UserID,
		&created.AccessToken,
		&created.RefreshToken,
		&created.IDToken,
		&created.AccessTokenExpiresAt,
		&created.RefreshTokenExpiresAt,
		&created.Scope,
		&created.Password,
		&created.CreatedAt,
		&created.UpdatedAt,
	)

	if err != nil {
		return model.Account{}, err
	}

	return created, nil
}

func (r *accountRepo) GetByUserID(ctx context.Context, userID string) ([]model.Account, error) {
	query := `
		SELECT
			id, account_id, provider_id, user_id,
			access_token, refresh_token, id_token,
			access_token_expires_at, refresh_token_expires_at,
			scope, password, created_at, updated_at
		FROM accounts
		WHERE user_id = $1
	`

	rows, err := r.DB.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	accounts := make([]model.Account, 0)

	for rows.Next() {
		var a model.Account

		err := rows.Scan(
			&a.ID,
			&a.AccountID,
			&a.ProviderID,
			&a.UserID,
			&a.AccessToken,
			&a.RefreshToken,
			&a.IDToken,
			&a.AccessTokenExpiresAt,
			&a.RefreshTokenExpiresAt,
			&a.Scope,
			&a.Password,
			&a.CreatedAt,
			&a.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		accounts = append(accounts, a)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return accounts, nil
}

func (r *accountRepo) GetByProviderAndAccountID(ctx context.Context, providerID, accountID string) (model.Account, error) {
	query := `
		SELECT
			id, account_id, provider_id, user_id,
			access_token, refresh_token, id_token,
			access_token_expires_at, refresh_token_expires_at,
			scope, password, created_at, updated_at
		FROM accounts
		WHERE provider_id = $1 AND account_id = $2
	`

	var a model.Account

	err := r.DB.QueryRow(ctx, query, providerID, accountID).Scan(
		&a.ID,
		&a.AccountID,
		&a.ProviderID,
		&a.UserID,
		&a.AccessToken,
		&a.RefreshToken,
		&a.IDToken,
		&a.AccessTokenExpiresAt,
		&a.RefreshTokenExpiresAt,
		&a.Scope,
		&a.Password,
		&a.CreatedAt,
		&a.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.Account{}, apperr.ErrAccountNotFound
		}
		return model.Account{}, err
	}

	return a, nil
}

func (r *accountRepo) Update(ctx context.Context, account *model.Account) (model.Account, error) {
	query := `
		UPDATE accounts
		SET
			access_token = $1,
			refresh_token = $2,
			id_token = $3,
			access_token_expires_at = $4,
			refresh_token_expires_at = $5,
			scope = $6,
			password = $7,
			updated_at = NOW()
		WHERE id = $8
		RETURNING
			id, account_id, provider_id, user_id,
			access_token, refresh_token, id_token,
			access_token_expires_at, refresh_token_expires_at,
			scope, password, created_at, updated_at
	`

	var updated model.Account

	err := r.DB.QueryRow(
		ctx, query,
		account.AccessToken,
		account.RefreshToken,
		account.IDToken,
		account.AccessTokenExpiresAt,
		account.RefreshTokenExpiresAt,
		account.Scope,
		account.Password,
		account.ID,
	).Scan(
		&updated.ID,
		&updated.AccountID,
		&updated.ProviderID,
		&updated.UserID,
		&updated.AccessToken,
		&updated.RefreshToken,
		&updated.IDToken,
		&updated.AccessTokenExpiresAt,
		&updated.RefreshTokenExpiresAt,
		&updated.Scope,
		&updated.Password,
		&updated.CreatedAt,
		&updated.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.Account{}, apperr.ErrAccountNotFound
		}
		return model.Account{}, err
	}

	return updated, nil
}

func (r *accountRepo) Delete(ctx context.Context, id string) error {
	query := `
		DELETE FROM accounts
		WHERE id = $1
	`

	result, err := r.DB.Exec(ctx, query, id)
	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return apperr.ErrAccountNotFound
	}

	return nil
}
