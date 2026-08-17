package rooms

import (
	"context"
	"errors"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/pkg/apperr"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type RoomRepo interface {
	Create(ctx context.Context, room *model.Room, userID string) (model.Room, error)
	Get(ctx context.Context, id, hotelID, userID string) (model.Room, error)
	ListForHotel(ctx context.Context, hotelID, userID, status string, pagination model.Pagination) ([]model.Room, int, error)
	Update(ctx context.Context, room *model.Room, userID string) (model.Room, error)
	UpdateStatus(ctx context.Context, id, hotelID, userID, status string) (model.Room, error)
	Delete(ctx context.Context, id, hotelID, userID string) error
}

type roomRepo struct {
	DB *pgxpool.Pool
}

func NewRoomRepo(db *pgxpool.Pool) RoomRepo {
	return &roomRepo{DB: db}
}

func (r *roomRepo) Create(ctx context.Context, room *model.Room, userID string) (model.Room, error) {
	query := `
		INSERT INTO rooms (id, hotel_id, room_type_id, number, floor, status, images)
		SELECT $1::uuid, $2::uuid, $3::uuid, $4, $5, $6, $7
		WHERE EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = $2::uuid AND m.user_id = $8::uuid AND m.status = 'active'
		) AND EXISTS (
			SELECT 1 FROM room_types rt WHERE rt.id = $3::uuid AND rt.hotel_id = $2::uuid
		)
		RETURNING id, hotel_id, room_type_id, number, floor, status, images, created_at, updated_at
	`

	var created model.Room

	err := r.DB.QueryRow(
		ctx, query,
		room.ID,
		room.HotelID,
		room.RoomTypeID,
		room.Number,
		room.Floor,
		room.Status,
		room.Images,
		userID,
	).Scan(
		&created.ID,
		&created.HotelID,
		&created.RoomTypeID,
		&created.Number,
		&created.Floor,
		&created.Status,
		&created.Images,
		&created.CreatedAt,
		&created.UpdatedAt,
	)

	if err != nil {
		if apperr.IsUniqueViolation(err) {
			return model.Room{}, apperr.ErrRoomNumberExists
		}
		if errors.Is(err, pgx.ErrNoRows) {
			return model.Room{}, apperr.ErrRoomTypeInvalid
		}
		return model.Room{}, err
	}

	return created, nil
}

func (r *roomRepo) Get(ctx context.Context, id, hotelID, userID string) (model.Room, error) {
	query := `
		SELECT id, hotel_id, room_type_id, number, floor, status, images, created_at, updated_at
		FROM rooms
		WHERE id = $1::uuid AND hotel_id = $2::uuid
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = rooms.hotel_id AND m.user_id = $3::uuid AND m.status = 'active'
		  )
	`

	var room model.Room

	err := r.DB.QueryRow(ctx, query, id, hotelID, userID).Scan(
		&room.ID,
		&room.HotelID,
		&room.RoomTypeID,
		&room.Number,
		&room.Floor,
		&room.Status,
		&room.Images,
		&room.CreatedAt,
		&room.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.Room{}, apperr.ErrRoomNotFound
		}
		return model.Room{}, err
	}

	return room, nil
}

func (r *roomRepo) ListForHotel(ctx context.Context, hotelID, userID, status string, pagination model.Pagination) ([]model.Room, int, error) {
	query := `
		SELECT id, hotel_id, room_type_id, number, floor, status, images, created_at, updated_at,
		       COUNT(*) OVER() AS total
		FROM rooms
		WHERE hotel_id = $1::uuid
		  AND ($2 = '' OR number ILIKE '%' || $2 || '%')
		  AND ($6 = '' OR status = $6)
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = rooms.hotel_id AND m.user_id = $3::uuid AND m.status = 'active'
		  )
		ORDER BY floor, number
		LIMIT $4 OFFSET $5
	`

	rows, err := r.DB.Query(ctx, query, hotelID, pagination.Search, userID, pagination.Limit, pagination.Offset(), status)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	list := make([]model.Room, 0)
	var total int

	for rows.Next() {
		var room model.Room
		if err := rows.Scan(
			&room.ID,
			&room.HotelID,
			&room.RoomTypeID,
			&room.Number,
			&room.Floor,
			&room.Status,
			&room.Images,
			&room.CreatedAt,
			&room.UpdatedAt,
			&total,
		); err != nil {
			return nil, 0, err
		}
		list = append(list, room)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, err
	}

	return list, total, nil
}

func (r *roomRepo) Update(ctx context.Context, room *model.Room, userID string) (model.Room, error) {
	query := `
		UPDATE rooms
		SET
			room_type_id = $1,
			number = $2,
			floor = $3,
			images = $4,
			updated_at = now()
		WHERE id = $5::uuid AND hotel_id = $6::uuid
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = rooms.hotel_id AND m.user_id = $7::uuid AND m.status = 'active'
		  )
		  AND EXISTS (
			SELECT 1 FROM room_types rt WHERE rt.id = $1::uuid AND rt.hotel_id = $6::uuid
		  )
		RETURNING id, hotel_id, room_type_id, number, floor, status, images, created_at, updated_at
	`

	var updated model.Room

	err := r.DB.QueryRow(
		ctx, query,
		room.RoomTypeID,
		room.Number,
		room.Floor,
		room.Images,
		room.ID,
		room.HotelID,
		userID,
	).Scan(
		&updated.ID,
		&updated.HotelID,
		&updated.RoomTypeID,
		&updated.Number,
		&updated.Floor,
		&updated.Status,
		&updated.Images,
		&updated.CreatedAt,
		&updated.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.Room{}, apperr.ErrRoomNotFound
		}
		if apperr.IsUniqueViolation(err) {
			return model.Room{}, apperr.ErrRoomNumberExists
		}
		return model.Room{}, err
	}

	return updated, nil
}

func (r *roomRepo) UpdateStatus(ctx context.Context, id, hotelID, userID, status string) (model.Room, error) {
	query := `
		UPDATE rooms
		SET status = $1, updated_at = now()
		WHERE id = $2::uuid AND hotel_id = $3::uuid
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = rooms.hotel_id AND m.user_id = $4::uuid AND m.status = 'active'
		  )
		RETURNING id, hotel_id, room_type_id, number, floor, status, images, created_at, updated_at
	`

	var updated model.Room

	err := r.DB.QueryRow(ctx, query, status, id, hotelID, userID).Scan(
		&updated.ID,
		&updated.HotelID,
		&updated.RoomTypeID,
		&updated.Number,
		&updated.Floor,
		&updated.Status,
		&updated.Images,
		&updated.CreatedAt,
		&updated.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.Room{}, apperr.ErrRoomNotFound
		}
		return model.Room{}, err
	}

	return updated, nil
}

func (r *roomRepo) Delete(ctx context.Context, id, hotelID, userID string) error {
	query := `
		DELETE FROM rooms
		WHERE id = $1::uuid AND hotel_id = $2::uuid
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = rooms.hotel_id AND m.user_id = $3::uuid AND m.status = 'active'
		  )
	`

	result, err := r.DB.Exec(ctx, query, id, hotelID, userID)
	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return apperr.ErrRoomNotFound
	}

	return nil
}
