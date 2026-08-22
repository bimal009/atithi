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

func (r *roomRepo) imagesForRoom(ctx context.Context, roomID string) ([]string, error) {
	rows, err := r.DB.Query(ctx, `
		SELECT url FROM hotel_images
		WHERE entity_type = 'room' AND entity_id = $1::uuid
		ORDER BY position, created_at
	`, roomID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	images := []string{}
	for rows.Next() {
		var url string
		if err := rows.Scan(&url); err != nil {
			return nil, err
		}
		images = append(images, url)
	}
	return images, rows.Err()
}

func (r *roomRepo) imagesForRooms(ctx context.Context, hotelID string) (map[string][]string, error) {
	rows, err := r.DB.Query(ctx, `
		SELECT entity_id, url FROM hotel_images
		WHERE hotel_id = $1::uuid AND entity_type = 'room'
		ORDER BY position, created_at
	`, hotelID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	byRoom := map[string][]string{}
	for rows.Next() {
		var roomID *string
		var url string
		if err := rows.Scan(&roomID, &url); err != nil {
			return nil, err
		}
		if roomID == nil {
			continue
		}
		byRoom[*roomID] = append(byRoom[*roomID], url)
	}
	return byRoom, rows.Err()
}

func (r *roomRepo) Create(ctx context.Context, room *model.Room, userID string) (model.Room, error) {
	query := `
		INSERT INTO rooms (id, hotel_id, room_type_id, number, floor, status)
		SELECT $1::uuid, $2::uuid, $3::uuid, $4, $5, $6
		WHERE EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = $2::uuid AND m.user_id = $7::uuid AND m.status = 'active'
		) AND EXISTS (
			SELECT 1 FROM room_types rt WHERE rt.id = $3::uuid AND rt.hotel_id = $2::uuid
		)
		RETURNING id, hotel_id, room_type_id, number, floor, status, created_at, updated_at
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
		userID,
	).Scan(
		&created.ID,
		&created.HotelID,
		&created.RoomTypeID,
		&created.Number,
		&created.Floor,
		&created.Status,
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

	created.Images = []string{}
	return created, nil
}

func (r *roomRepo) Get(ctx context.Context, id, hotelID, userID string) (model.Room, error) {
	query := `
		SELECT id, hotel_id, room_type_id, number, floor, status, created_at, updated_at
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
		&room.CreatedAt,
		&room.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.Room{}, apperr.ErrRoomNotFound
		}
		return model.Room{}, err
	}

	images, err := r.imagesForRoom(ctx, room.ID)
	if err != nil {
		return model.Room{}, err
	}
	room.Images = images

	return room, nil
}

func (r *roomRepo) ListForHotel(ctx context.Context, hotelID, userID, status string, pagination model.Pagination) ([]model.Room, int, error) {
	query := `
		SELECT id, hotel_id, room_type_id, number, floor, status, created_at, updated_at,
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

	imagesByRoom, err := r.imagesForRooms(ctx, hotelID)
	if err != nil {
		return nil, 0, err
	}
	for i := range list {
		if imgs, ok := imagesByRoom[list[i].ID]; ok {
			list[i].Images = imgs
		} else {
			list[i].Images = []string{}
		}
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
			updated_at = now()
		WHERE id = $4::uuid AND hotel_id = $5::uuid
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = rooms.hotel_id AND m.user_id = $6::uuid AND m.status = 'active'
		  )
		  AND EXISTS (
			SELECT 1 FROM room_types rt WHERE rt.id = $1::uuid AND rt.hotel_id = $5::uuid
		  )
		RETURNING id, hotel_id, room_type_id, number, floor, status, created_at, updated_at
	`

	var updated model.Room

	err := r.DB.QueryRow(
		ctx, query,
		room.RoomTypeID,
		room.Number,
		room.Floor,
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

	images, err := r.imagesForRoom(ctx, updated.ID)
	if err != nil {
		return model.Room{}, err
	}
	updated.Images = images

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
		RETURNING id, hotel_id, room_type_id, number, floor, status, created_at, updated_at
	`

	var updated model.Room

	err := r.DB.QueryRow(ctx, query, status, id, hotelID, userID).Scan(
		&updated.ID,
		&updated.HotelID,
		&updated.RoomTypeID,
		&updated.Number,
		&updated.Floor,
		&updated.Status,
		&updated.CreatedAt,
		&updated.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.Room{}, apperr.ErrRoomNotFound
		}
		return model.Room{}, err
	}

	images, err := r.imagesForRoom(ctx, updated.ID)
	if err != nil {
		return model.Room{}, err
	}
	updated.Images = images

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

	if _, err := r.DB.Exec(ctx, `DELETE FROM hotel_images WHERE entity_type = 'room' AND entity_id = $1::uuid`, id); err != nil {
		return err
	}

	return nil
}
