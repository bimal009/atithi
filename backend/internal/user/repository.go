package user

import (
	"context"
	"errors"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/pkg/apperr"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type UserRepo interface {
	Create(ctx context.Context, tx pgx.Tx, user *model.User) (model.User, error)
	GetByPhone(ctx context.Context, phoneNumber string) (model.User, error)
	GetByEmail(ctx context.Context, email string) (model.User, error)
	Get(ctx context.Context, id string) (model.User, error)
	GetAll(ctx context.Context) ([]model.User, error)
	Update(ctx context.Context, user *model.User) (model.User, error)
	UpdateTx(ctx context.Context, tx pgx.Tx, user *model.User) (model.User, error)
	Delete(ctx context.Context, id string) error
}

type userRepo struct {
	DB *pgxpool.Pool
}

func NewUserRepo(db *pgxpool.Pool) UserRepo {
	return &userRepo{
		DB: db,
	}
}

func (r *userRepo) Create(ctx context.Context, tx pgx.Tx, user *model.User) (model.User, error) {
	query := `
		INSERT INTO users (
			id,
			phone_number,
			name,
			email
		)
		VALUES ($1, $2, $3, $4)
		RETURNING id, phone_number, name, email, email_verified, image, created_at, updated_at, role
	`

	var createdUser model.User

	err := tx.QueryRow(ctx, query, user.ID, user.PhoneNumber, user.Name, user.Email).Scan(
		&createdUser.ID,
		&createdUser.PhoneNumber,
		&createdUser.Name,
		&createdUser.Email,
		&createdUser.EmailVerified,
		&createdUser.Image,
		&createdUser.CreatedAt,
		&createdUser.UpdatedAt,
		&createdUser.Role,
	)

	if err != nil {
		return model.User{}, err
	}

	return createdUser, nil
}

func (r *userRepo) GetByPhone(ctx context.Context, phoneNumber string) (model.User, error) {
	query := `
		SELECT id, phone_number, name, email, email_verified, image, created_at, updated_at, role
		FROM users
		WHERE phone_number = $1
	`

	var user model.User

	err := r.DB.QueryRow(ctx, query, phoneNumber).Scan(
		&user.ID,
		&user.PhoneNumber,
		&user.Name,
		&user.Email,
		&user.EmailVerified,
		&user.Image,
		&user.CreatedAt,
		&user.UpdatedAt,
		&user.Role,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.User{}, apperr.ErrUserNotFound
		}

		return model.User{}, err
	}

	return user, nil
}

func (r *userRepo) GetByEmail(ctx context.Context, email string) (model.User, error) {
	query := `
		SELECT id, phone_number, name, email, email_verified, image, created_at, updated_at, role
		FROM users
		WHERE email = $1
	`

	var user model.User

	err := r.DB.QueryRow(ctx, query, email).Scan(
		&user.ID,
		&user.Name,
		&user.Email,
		&user.EmailVerified,
		&user.PhoneNumber,
		&user.Image,
		&user.CreatedAt,
		&user.UpdatedAt,
		&user.Role,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.User{}, apperr.ErrUserNotFound
		}

		return model.User{}, err
	}

	return user, nil
}

func (r *userRepo) Get(ctx context.Context, id string) (model.User, error) {
	query := `
		SELECT id, phone_number, name, email, email_verified, image, created_at, updated_at, role
		FROM users
		WHERE id = $1
	`

	var user model.User

	err := r.DB.QueryRow(ctx, query, id).Scan(
		&user.ID,
		&user.Name,
		&user.Email,
		&user.EmailVerified,
		&user.PhoneNumber,
		&user.Image,
		&user.CreatedAt,
		&user.UpdatedAt,
		&user.Role,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.User{}, apperr.ErrUserNotFound
		}

		return model.User{}, err
	}

	return user, nil
}

func (r *userRepo) GetAll(ctx context.Context) ([]model.User, error) {
	query := `
		SELECT id, phone_number, name, email, email_verified, image, created_at, updated_at, role
		FROM users
		ORDER BY id
	`

	rows, err := r.DB.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	users := make([]model.User, 0)

	for rows.Next() {
		var user model.User

		err := rows.Scan(
			&user.ID,
			&user.Name,
			&user.Email,
			&user.EmailVerified,
			&user.PhoneNumber,
			&user.Image,
			&user.CreatedAt,
			&user.UpdatedAt,
			&user.Role,
		)
		if err != nil {
			return nil, err
		}

		users = append(users, user)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return users, nil
}

func (r *userRepo) Update(ctx context.Context, user *model.User) (model.User, error) {
	return updateUser(ctx, r.DB, user)
}

func (r *userRepo) UpdateTx(ctx context.Context, tx pgx.Tx, user *model.User) (model.User, error) {
	return updateUser(ctx, tx, user)
}

type querier interface {
	QueryRow(ctx context.Context, sql string, args ...any) pgx.Row
}

func updateUser(ctx context.Context, q querier, user *model.User) (model.User, error) {
	query := `
		UPDATE users
		SET
			name = $1,
			email = $2,
			email_verified = $3,
			phone_number = $4,
			image = $5,
			role = $6,
			updated_at = NOW()
		WHERE id = $7
		RETURNING
			id,
			name,
			email,
			email_verified,
			phone_number,
			image,
			created_at,
			updated_at,
			role
	`

	var updatedUser model.User

	err := q.QueryRow(
		ctx,
		query,
		user.Name,
		user.Email,
		user.EmailVerified,
		user.PhoneNumber,
		user.Image,
		user.Role,
		user.ID,
	).Scan(
		&updatedUser.ID,
		&updatedUser.Name,
		&updatedUser.Email,
		&updatedUser.EmailVerified,
		&updatedUser.PhoneNumber,
		&updatedUser.Image,
		&updatedUser.CreatedAt,
		&updatedUser.UpdatedAt,
		&updatedUser.Role,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.User{}, apperr.ErrUserNotFound
		}

		return model.User{}, err
	}

	return updatedUser, nil
}

func (r *userRepo) Delete(ctx context.Context, id string) error {
	query := `
		DELETE FROM users
		WHERE id = $1
	`

	result, err := r.DB.Exec(ctx, query, id)
	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return apperr.ErrUserNotFound
	}

	return nil
}
