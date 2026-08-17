package reservations

import (
	"context"
	"errors"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/pkg/apperr"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ReservationRepo interface {
	Create(ctx context.Context, reservation *model.Reservation, userID string) (model.Reservation, error)
	Get(ctx context.Context, id, hotelID, userID string) (model.Reservation, error)
	ListForHotel(ctx context.Context, hotelID, userID, status string, pagination model.Pagination) ([]model.Reservation, int, error)
	Update(ctx context.Context, reservation *model.Reservation, userID string) (model.Reservation, error)
	UpdateStatus(ctx context.Context, id, hotelID, userID, status string) (model.Reservation, error)
	Delete(ctx context.Context, id, hotelID, userID string) error
}

type reservationRepo struct {
	DB *pgxpool.Pool
}

func NewReservationRepo(db *pgxpool.Pool) ReservationRepo {
	return &reservationRepo{DB: db}
}

func (r *reservationRepo) Create(ctx context.Context, reservation *model.Reservation, userID string) (model.Reservation, error) {
	query := `
		INSERT INTO reservations (id, hotel_id, table_id, guest_name, guest_phone, party_size, reserved_at, reserved_by, status, notes)
		SELECT $1::uuid, $2::uuid, $3::uuid, $4, $5, $6, $7, $8, $9, $10
		WHERE EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = $2::uuid AND m.user_id = $11::uuid AND m.status = 'active'
		) AND EXISTS (
			SELECT 1 FROM dining_tables t WHERE t.id = $3::uuid AND t.hotel_id = $2::uuid
		)
		RETURNING id, hotel_id, table_id, guest_name, guest_phone, party_size, reserved_at, reserved_by, status, notes, created_at, updated_at
	`

	var created model.Reservation

	err := r.DB.QueryRow(
		ctx, query,
		reservation.ID,
		reservation.HotelID,
		reservation.TableID,
		reservation.GuestName,
		reservation.GuestPhone,
		reservation.PartySize,
		reservation.ReservedAt,
		reservation.ReservedBy,
		reservation.Status,
		reservation.Notes,
		userID,
	).Scan(
		&created.ID,
		&created.HotelID,
		&created.TableID,
		&created.GuestName,
		&created.GuestPhone,
		&created.PartySize,
		&created.ReservedAt,
		&created.ReservedBy,
		&created.Status,
		&created.Notes,
		&created.CreatedAt,
		&created.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.Reservation{}, apperr.ErrTableInvalid
		}
		return model.Reservation{}, err
	}

	return created, nil
}

func (r *reservationRepo) Get(ctx context.Context, id, hotelID, userID string) (model.Reservation, error) {
	query := `
		SELECT id, hotel_id, table_id, guest_name, guest_phone, party_size, reserved_at, reserved_by, status, notes, created_at, updated_at
		FROM reservations
		WHERE id = $1::uuid AND hotel_id = $2::uuid
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = reservations.hotel_id AND m.user_id = $3::uuid AND m.status = 'active'
		  )
	`

	var reservation model.Reservation

	err := r.DB.QueryRow(ctx, query, id, hotelID, userID).Scan(
		&reservation.ID,
		&reservation.HotelID,
		&reservation.TableID,
		&reservation.GuestName,
		&reservation.GuestPhone,
		&reservation.PartySize,
		&reservation.ReservedAt,
		&reservation.ReservedBy,
		&reservation.Status,
		&reservation.Notes,
		&reservation.CreatedAt,
		&reservation.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.Reservation{}, apperr.ErrReservationNotFound
		}
		return model.Reservation{}, err
	}

	return reservation, nil
}

func (r *reservationRepo) ListForHotel(ctx context.Context, hotelID, userID, status string, pagination model.Pagination) ([]model.Reservation, int, error) {
	query := `
		SELECT id, hotel_id, table_id, guest_name, guest_phone, party_size, reserved_at, reserved_by, status, notes, created_at, updated_at,
		       COUNT(*) OVER() AS total
		FROM reservations
		WHERE hotel_id = $1::uuid
		  AND ($2 = '' OR guest_name ILIKE '%' || $2 || '%' OR guest_phone ILIKE '%' || $2 || '%')
		  AND ($6 = '' OR status = $6)
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = reservations.hotel_id AND m.user_id = $3::uuid AND m.status = 'active'
		  )
		ORDER BY reserved_at DESC
		LIMIT $4 OFFSET $5
	`

	rows, err := r.DB.Query(ctx, query, hotelID, pagination.Search, userID, pagination.Limit, pagination.Offset(), status)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	list := make([]model.Reservation, 0)
	var total int

	for rows.Next() {
		var reservation model.Reservation
		if err := rows.Scan(
			&reservation.ID,
			&reservation.HotelID,
			&reservation.TableID,
			&reservation.GuestName,
			&reservation.GuestPhone,
			&reservation.PartySize,
			&reservation.ReservedAt,
			&reservation.ReservedBy,
			&reservation.Status,
			&reservation.Notes,
			&reservation.CreatedAt,
			&reservation.UpdatedAt,
			&total,
		); err != nil {
			return nil, 0, err
		}
		list = append(list, reservation)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, err
	}

	return list, total, nil
}

func (r *reservationRepo) Update(ctx context.Context, reservation *model.Reservation, userID string) (model.Reservation, error) {
	query := `
		UPDATE reservations
		SET
			table_id = $1,
			guest_name = $2,
			guest_phone = $3,
			party_size = $4,
			reserved_at = $5,
			reserved_by = $6,
			notes = $7,
			updated_at = now()
		WHERE id = $8::uuid AND hotel_id = $9::uuid
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = reservations.hotel_id AND m.user_id = $10::uuid AND m.status = 'active'
		  )
		  AND EXISTS (
			SELECT 1 FROM dining_tables t WHERE t.id = $1::uuid AND t.hotel_id = $9::uuid
		  )
		RETURNING id, hotel_id, table_id, guest_name, guest_phone, party_size, reserved_at, reserved_by, status, notes, created_at, updated_at
	`

	var updated model.Reservation

	err := r.DB.QueryRow(
		ctx, query,
		reservation.TableID,
		reservation.GuestName,
		reservation.GuestPhone,
		reservation.PartySize,
		reservation.ReservedAt,
		reservation.ReservedBy,
		reservation.Notes,
		reservation.ID,
		reservation.HotelID,
		userID,
	).Scan(
		&updated.ID,
		&updated.HotelID,
		&updated.TableID,
		&updated.GuestName,
		&updated.GuestPhone,
		&updated.PartySize,
		&updated.ReservedAt,
		&updated.ReservedBy,
		&updated.Status,
		&updated.Notes,
		&updated.CreatedAt,
		&updated.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.Reservation{}, apperr.ErrReservationNotFound
		}
		return model.Reservation{}, err
	}

	return updated, nil
}

func (r *reservationRepo) UpdateStatus(ctx context.Context, id, hotelID, userID, status string) (model.Reservation, error) {
	query := `
		UPDATE reservations
		SET status = $1, updated_at = now()
		WHERE id = $2::uuid AND hotel_id = $3::uuid
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = reservations.hotel_id AND m.user_id = $4::uuid AND m.status = 'active'
		  )
		RETURNING id, hotel_id, table_id, guest_name, guest_phone, party_size, reserved_at, reserved_by, status, notes, created_at, updated_at
	`

	var updated model.Reservation

	err := r.DB.QueryRow(ctx, query, status, id, hotelID, userID).Scan(
		&updated.ID,
		&updated.HotelID,
		&updated.TableID,
		&updated.GuestName,
		&updated.GuestPhone,
		&updated.PartySize,
		&updated.ReservedAt,
		&updated.ReservedBy,
		&updated.Status,
		&updated.Notes,
		&updated.CreatedAt,
		&updated.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.Reservation{}, apperr.ErrReservationNotFound
		}
		return model.Reservation{}, err
	}

	return updated, nil
}

func (r *reservationRepo) Delete(ctx context.Context, id, hotelID, userID string) error {
	query := `
		DELETE FROM reservations
		WHERE id = $1::uuid AND hotel_id = $2::uuid
		  AND EXISTS (
			SELECT 1 FROM members m
			WHERE m.hotel_id = reservations.hotel_id AND m.user_id = $3::uuid AND m.status = 'active'
		  )
	`

	result, err := r.DB.Exec(ctx, query, id, hotelID, userID)
	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return apperr.ErrReservationNotFound
	}

	return nil
}
