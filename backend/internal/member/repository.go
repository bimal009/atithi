package member

import (
	"context"
	"errors"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/pkg/apperr"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type MemberRepo interface {
	Create(ctx context.Context, member *model.Member, tx pgx.Tx) (model.Member, error)
	Get(ctx context.Context, id string) (model.Member, error)
	GetByHotelAndUser(ctx context.Context, hotelID, userID string) (model.Member, error)
	ListByHotel(ctx context.Context, hotelID, roleID string, pagination model.Pagination) ([]model.MemberDetail, int, error)
	ListByUser(ctx context.Context, userID string) ([]model.Member, error)
	Update(ctx context.Context, member *model.Member) (model.Member, error)
	Delete(ctx context.Context, id string) error
}

type memberRepo struct {
	DB *pgxpool.Pool
}

func NewMemberRepo(db *pgxpool.Pool) MemberRepo {
	return &memberRepo{
		DB: db,
	}
}

func (r *memberRepo) Create(ctx context.Context, member *model.Member, tx pgx.Tx) (model.Member, error) {
	query := `
		INSERT INTO members (hotel_id, user_id, role_id, status, invited_by, joined_at)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, hotel_id, user_id, role_id, status, invited_by, joined_at, created_at, updated_at
	`

	var created model.Member

	err := tx.QueryRow(
		ctx, query,
		member.HotelID,
		member.UserID,
		member.RoleID,
		member.Status,
		member.InvitedBy,
		member.JoinedAt,
	).Scan(
		&created.ID,
		&created.HotelID,
		&created.UserID,
		&created.RoleID,
		&created.Status,
		&created.InvitedBy,
		&created.JoinedAt,
		&created.CreatedAt,
		&created.UpdatedAt,
	)

	if err != nil {
		if apperr.IsUniqueViolation(err) {
			return model.Member{}, apperr.ErrMemberExists
		}
		return model.Member{}, err
	}

	return created, nil
}

func (r *memberRepo) Get(ctx context.Context, id string) (model.Member, error) {
	query := `
		SELECT id, hotel_id, user_id, role_id, status, invited_by, joined_at, created_at, updated_at
		FROM members
		WHERE id = $1
	`

	var member model.Member

	err := r.DB.QueryRow(ctx, query, id).Scan(
		&member.ID,
		&member.HotelID,
		&member.UserID,
		&member.RoleID,
		&member.Status,
		&member.InvitedBy,
		&member.JoinedAt,
		&member.CreatedAt,
		&member.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.Member{}, apperr.ErrMemberNotFound
		}
		return model.Member{}, err
	}

	return member, nil
}

func (r *memberRepo) GetByHotelAndUser(ctx context.Context, hotelID, userID string) (model.Member, error) {
	query := `
		SELECT id, hotel_id, user_id, role_id, status, invited_by, joined_at, created_at, updated_at
		FROM members
		WHERE hotel_id = $1 AND user_id = $2
	`

	var member model.Member

	err := r.DB.QueryRow(ctx, query, hotelID, userID).Scan(
		&member.ID,
		&member.HotelID,
		&member.UserID,
		&member.RoleID,
		&member.Status,
		&member.InvitedBy,
		&member.JoinedAt,
		&member.CreatedAt,
		&member.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.Member{}, apperr.ErrMemberNotFound
		}
		return model.Member{}, err
	}

	return member, nil
}

func (r *memberRepo) ListByHotel(ctx context.Context, hotelID, roleID string, pagination model.Pagination) ([]model.MemberDetail, int, error) {
	query := `
		SELECT m.id, m.hotel_id, m.user_id, m.role_id, m.status, m.invited_by, m.joined_at, m.created_at, m.updated_at,
		       u.name, u.email, u.phone_number, u.image,
		       r.name, r.slug,
		       COUNT(*) OVER() AS total
		FROM members m
		JOIN users u ON u.id = m.user_id
		JOIN roles r ON r.id = m.role_id
		WHERE m.hotel_id = $1::uuid
		  AND ($2 = '' OR u.name ILIKE '%' || $2 || '%' OR u.email ILIKE '%' || $2 || '%' OR u.phone_number ILIKE '%' || $2 || '%')
		  AND ($3 = '' OR m.role_id = NULLIF($3, '')::uuid)
		ORDER BY m.created_at DESC
		LIMIT $4 OFFSET $5
	`

	rows, err := r.DB.Query(ctx, query, hotelID, pagination.Search, roleID, pagination.Limit, pagination.Offset())
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	members := make([]model.MemberDetail, 0)
	var total int

	for rows.Next() {
		var member model.MemberDetail
		if err := rows.Scan(
			&member.ID,
			&member.HotelID,
			&member.UserID,
			&member.RoleID,
			&member.Status,
			&member.InvitedBy,
			&member.JoinedAt,
			&member.CreatedAt,
			&member.UpdatedAt,
			&member.UserName,
			&member.UserEmail,
			&member.UserPhone,
			&member.UserImage,
			&member.RoleName,
			&member.RoleSlug,
			&total,
		); err != nil {
			return nil, 0, err
		}
		members = append(members, member)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, err
	}

	return members, total, nil
}

func (r *memberRepo) ListByUser(ctx context.Context, userID string) ([]model.Member, error) {
	query := `
		SELECT id, hotel_id, user_id, role_id, status, invited_by, joined_at, created_at, updated_at
		FROM members
		WHERE user_id = $1
		ORDER BY created_at DESC
	`

	rows, err := r.DB.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	members := make([]model.Member, 0)

	for rows.Next() {
		var member model.Member
		if err := rows.Scan(
			&member.ID,
			&member.HotelID,
			&member.UserID,
			&member.RoleID,
			&member.Status,
			&member.InvitedBy,
			&member.JoinedAt,
			&member.CreatedAt,
			&member.UpdatedAt,
		); err != nil {
			return nil, err
		}
		members = append(members, member)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return members, nil
}

func (r *memberRepo) Update(ctx context.Context, member *model.Member) (model.Member, error) {
	query := `
		UPDATE members
		SET role_id = $1, status = $2, joined_at = $3, updated_at = now()
		WHERE id = $4
		RETURNING id, hotel_id, user_id, role_id, status, invited_by, joined_at, created_at, updated_at
	`

	var updated model.Member

	err := r.DB.QueryRow(
		ctx, query,
		member.RoleID,
		member.Status,
		member.JoinedAt,
		member.ID,
	).Scan(
		&updated.ID,
		&updated.HotelID,
		&updated.UserID,
		&updated.RoleID,
		&updated.Status,
		&updated.InvitedBy,
		&updated.JoinedAt,
		&updated.CreatedAt,
		&updated.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.Member{}, apperr.ErrMemberNotFound
		}
		return model.Member{}, err
	}

	return updated, nil
}

func (r *memberRepo) Delete(ctx context.Context, id string) error {
	result, err := r.DB.Exec(ctx, `DELETE FROM members WHERE id = $1`, id)
	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return apperr.ErrMemberNotFound
	}

	return nil
}
