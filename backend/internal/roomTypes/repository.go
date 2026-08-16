package roomtypes

import (
	"context"
	"errors"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/pkg/apperr"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type RoomTypeRepo interface {
	Create(ctx context.Context, roomType *model.RoomType, userID string) (model.RoomType, error)
	Get(ctx context.Context, id, hotelID, userID string) (model.RoomType, error)
	ListForHotel(ctx context.Context, hotelID, userID string) ([]model.RoomType, error)
	Update(ctx context.Context, roomType *model.RoomType, userID string) (model.RoomType, error)
	Delete(ctx context.Context, id, hotelID, userID string) error
}

type roomTypeRepo struct {
	DB *pgxpool.Pool
}

func NewRoomTypeRepo(db *pgxpool.Pool) RoomTypeRepo {
	return &roomTypeRepo{
		DB: db,
	}
}

func (r *roomTypeRepo) Create(ctx context.Context, roomType *model.RoomType, userID string) (model.RoomType, error) {
	query := `
		INSERT INTO room_types (id, hotel_id, name, base_price, capacity, description, amenities)
		SELECT $1::uuid, $2::uuid, $3, $4, $5, $6, $7
		WHERE EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = $2::uuid AND m.user_id = $8::uuid AND m.status = 'active'
		)
		RETURNING id, hotel_id, name, base_price, capacity, description, amenities, created_at, updated_at
	`

	var created model.RoomType

	err := r.DB.QueryRow(
		ctx, query,
		roomType.ID,
		roomType.HotelID,
		roomType.Name,
		roomType.BasePrice,
		roomType.Capacity,
		roomType.Description,
		roomType.Amenities,
		userID,
	).Scan(
		&created.ID,
		&created.HotelID,
		&created.Name,
		&created.BasePrice,
		&created.Capacity,
		&created.Description,
		&created.Amenities,
		&created.CreatedAt,
		&created.UpdatedAt,
	)

	if err != nil {
		if apperr.IsUniqueViolation(err) {
			return model.RoomType{}, apperr.ErrRoomTypeNameExists
		}
		if errors.Is(err, pgx.ErrNoRows) {
			return model.RoomType{}, apperr.ErrHotelNotFound
		}
		return model.RoomType{}, err
	}

	return created, nil
}

func (r *roomTypeRepo) Get(ctx context.Context, id, hotelID, userID string) (model.RoomType, error) {
	query := `
		SELECT id, hotel_id, name, base_price, capacity, description, amenities, created_at, updated_at
		FROM room_types
		WHERE id = $1::uuid AND hotel_id = $2::uuid
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = room_types.hotel_id AND m.user_id = $3::uuid AND m.status = 'active'
		  )
	`

	var roomType model.RoomType

	err := r.DB.QueryRow(ctx, query, id, hotelID, userID).Scan(
		&roomType.ID,
		&roomType.HotelID,
		&roomType.Name,
		&roomType.BasePrice,
		&roomType.Capacity,
		&roomType.Description,
		&roomType.Amenities,
		&roomType.CreatedAt,
		&roomType.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.RoomType{}, apperr.ErrRoomTypeNotFound
		}
		return model.RoomType{}, err
	}

	return roomType, nil
}

func (r *roomTypeRepo) ListForHotel(ctx context.Context, hotelID, userID string) ([]model.RoomType, error) {
	query := `
		SELECT id, hotel_id, name, base_price, capacity, description, amenities, created_at, updated_at
		FROM room_types
		WHERE hotel_id = $1::uuid
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = room_types.hotel_id AND m.user_id = $2::uuid AND m.status = 'active'
		  )
		ORDER BY created_at DESC
	`

	rows, err := r.DB.Query(ctx, query, hotelID, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	roomTypes := make([]model.RoomType, 0)

	for rows.Next() {
		var roomType model.RoomType
		if err := rows.Scan(
			&roomType.ID,
			&roomType.HotelID,
			&roomType.Name,
			&roomType.BasePrice,
			&roomType.Capacity,
			&roomType.Description,
			&roomType.Amenities,
			&roomType.CreatedAt,
			&roomType.UpdatedAt,
		); err != nil {
			return nil, err
		}
		roomTypes = append(roomTypes, roomType)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return roomTypes, nil
}

func (r *roomTypeRepo) Update(ctx context.Context, roomType *model.RoomType, userID string) (model.RoomType, error) {
	query := `
		UPDATE room_types
		SET
			name = $1,
			base_price = $2,
			capacity = $3,
			description = $4,
			amenities = $5,
			updated_at = now()
		WHERE id = $6::uuid AND hotel_id = $7::uuid
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = room_types.hotel_id AND m.user_id = $8::uuid AND m.status = 'active'
		  )
		RETURNING id, hotel_id, name, base_price, capacity, description, amenities, created_at, updated_at
	`

	var updated model.RoomType

	err := r.DB.QueryRow(
		ctx, query,
		roomType.Name,
		roomType.BasePrice,
		roomType.Capacity,
		roomType.Description,
		roomType.Amenities,
		roomType.ID,
		roomType.HotelID,
		userID,
	).Scan(
		&updated.ID,
		&updated.HotelID,
		&updated.Name,
		&updated.BasePrice,
		&updated.Capacity,
		&updated.Description,
		&updated.Amenities,
		&updated.CreatedAt,
		&updated.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.RoomType{}, apperr.ErrRoomTypeNotFound
		}
		if apperr.IsUniqueViolation(err) {
			return model.RoomType{}, apperr.ErrRoomTypeNameExists
		}
		return model.RoomType{}, err
	}

	return updated, nil
}

func (r *roomTypeRepo) Delete(ctx context.Context, id, hotelID, userID string) error {
	query := `
		DELETE FROM room_types
		WHERE id = $1::uuid AND hotel_id = $2::uuid
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = room_types.hotel_id AND m.user_id = $3::uuid AND m.status = 'active'
		  )
	`

	result, err := r.DB.Exec(ctx, query, id, hotelID, userID)
	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return apperr.ErrRoomTypeNotFound
	}

	return nil
}
