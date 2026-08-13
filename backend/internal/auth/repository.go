package auth

import (
	"github.com/jackc/pgx/v5/pgxpool"
)

type AuthRepo interface {
}

type authRepo struct {
	DB *pgxpool.Pool
}

func NewAuthRepo(db *pgxpool.Pool) *authRepo {
	return &authRepo{DB: db}
}
