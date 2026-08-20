package reservations

import (
	"context"
	"encoding/json"
	"errors"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/pkg/apperr"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ReservationRepo interface {
	Create(ctx context.Context, reservation *model.Reservation, tableIDs, cabinIDs []string, userID string) (model.Reservation, error)
	Get(ctx context.Context, id, hotelID, userID string) (model.Reservation, error)
	ListForHotel(ctx context.Context, hotelID, userID, status string, pagination model.Pagination) ([]model.Reservation, int, error)
	Update(ctx context.Context, reservation *model.Reservation, tableIDs, cabinIDs *[]string, userID string) (model.Reservation, error)
	UpdateStatus(ctx context.Context, id, hotelID, userID, status string) (model.Reservation, error)
	Delete(ctx context.Context, id, hotelID, userID string) error
}

type reservationRepo struct {
	DB *pgxpool.Pool
}

func NewReservationRepo(db *pgxpool.Pool) ReservationRepo {
	return &reservationRepo{DB: db}
}

func (r *reservationRepo) Create(ctx context.Context, reservation *model.Reservation, tableIDs, cabinIDs []string, userID string) (model.Reservation, error) {
	tx, err := r.DB.Begin(ctx)
	if err != nil {
		return model.Reservation{}, err
	}
	defer tx.Rollback(ctx)

	var created model.Reservation
	err = tx.QueryRow(ctx, `
		INSERT INTO reservations (id, hotel_id, guest_name, guest_phone, party_size, reserved_at, reserved_by, status, notes)
		SELECT $1::uuid, $2::uuid, $3, $4, $5, $6, m.id, $7, $8
		FROM members m
		WHERE m.hotel_id = $2::uuid AND m.user_id = $9::uuid AND m.status = 'active'
		RETURNING id, hotel_id, guest_name, guest_phone, party_size, reserved_at, reserved_by, status, notes, created_at, updated_at
	`,
		reservation.ID,
		reservation.HotelID,
		reservation.GuestName,
		reservation.GuestPhone,
		reservation.PartySize,
		reservation.ReservedAt,
		reservation.Status,
		reservation.Notes,
		userID,
	).Scan(
		&created.ID, &created.HotelID, &created.GuestName, &created.GuestPhone, &created.PartySize,
		&created.ReservedAt, &created.ReservedBy, &created.Status, &created.Notes,
		&created.CreatedAt, &created.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.Reservation{}, apperr.ErrHotelNotFound
		}
		return model.Reservation{}, err
	}
	created.Tables = []model.ReservationResourceRef{}
	created.Cabins = []model.ReservationResourceRef{}

	if len(tableIDs) > 0 {
		tag, err := tx.Exec(ctx, `
			INSERT INTO reservation_tables (reservation_id, table_id)
			SELECT $1::uuid, t.id FROM dining_tables t
			WHERE t.id = ANY($2::uuid[]) AND t.hotel_id = $3::uuid
		`, created.ID, tableIDs, reservation.HotelID)
		if err != nil {
			return model.Reservation{}, err
		}
		if tag.RowsAffected() != int64(len(tableIDs)) {
			return model.Reservation{}, apperr.ErrTableInvalid
		}
	}

	if len(cabinIDs) > 0 {
		tag, err := tx.Exec(ctx, `
			INSERT INTO reservation_cabins (reservation_id, cabin_id)
			SELECT $1::uuid, cb.id FROM cabins cb
			WHERE cb.id = ANY($2::uuid[]) AND cb.hotel_id = $3::uuid
		`, created.ID, cabinIDs, reservation.HotelID)
		if err != nil {
			return model.Reservation{}, err
		}
		if tag.RowsAffected() != int64(len(cabinIDs)) {
			return model.Reservation{}, apperr.ErrCabinInvalid
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return model.Reservation{}, err
	}

	return created, nil
}

func (r *reservationRepo) Get(ctx context.Context, id, hotelID, userID string) (model.Reservation, error) {
	var reservation model.Reservation
	var tablesJSON, cabinsJSON []byte

	err := r.DB.QueryRow(ctx, `
		SELECT r.id, r.hotel_id, r.guest_name, r.guest_phone, r.party_size, r.reserved_at, r.reserved_by, u.name,
		       r.status, r.notes, r.created_at, r.updated_at,
		       COALESCE(json_agg(DISTINCT jsonb_build_object('id', t.id, 'name', t.name)) FILTER (WHERE t.id IS NOT NULL), '[]'),
		       COALESCE(json_agg(DISTINCT jsonb_build_object('id', cb.id, 'name', cb.name)) FILTER (WHERE cb.id IS NOT NULL), '[]')
		FROM reservations r
		JOIN members rm ON rm.id = r.reserved_by
		JOIN users u ON u.id = rm.user_id
		LEFT JOIN reservation_tables rt ON rt.reservation_id = r.id
		LEFT JOIN dining_tables t ON t.id = rt.table_id
		LEFT JOIN reservation_cabins rc ON rc.reservation_id = r.id
		LEFT JOIN cabins cb ON cb.id = rc.cabin_id
		WHERE r.id = $1::uuid AND r.hotel_id = $2::uuid
		  AND EXISTS (
			SELECT 1 FROM members m WHERE m.hotel_id = r.hotel_id AND m.user_id = $3::uuid AND m.status = 'active'
		  )
		GROUP BY r.id, u.name
	`, id, hotelID, userID).Scan(
		&reservation.ID, &reservation.HotelID, &reservation.GuestName, &reservation.GuestPhone, &reservation.PartySize,
		&reservation.ReservedAt, &reservation.ReservedBy, &reservation.ReservedByName,
		&reservation.Status, &reservation.Notes, &reservation.CreatedAt, &reservation.UpdatedAt,
		&tablesJSON, &cabinsJSON,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.Reservation{}, apperr.ErrReservationNotFound
		}
		return model.Reservation{}, err
	}
	if err := json.Unmarshal(tablesJSON, &reservation.Tables); err != nil {
		return model.Reservation{}, err
	}
	if err := json.Unmarshal(cabinsJSON, &reservation.Cabins); err != nil {
		return model.Reservation{}, err
	}

	return reservation, nil
}

func (r *reservationRepo) ListForHotel(ctx context.Context, hotelID, userID, status string, pagination model.Pagination) ([]model.Reservation, int, error) {
	rows, err := r.DB.Query(ctx, `
		SELECT r.id, r.hotel_id, r.guest_name, r.guest_phone, r.party_size, r.reserved_at, r.reserved_by, u.name,
		       r.status, r.notes, r.created_at, r.updated_at,
		       COALESCE(json_agg(DISTINCT jsonb_build_object('id', t.id, 'name', t.name)) FILTER (WHERE t.id IS NOT NULL), '[]'),
		       COALESCE(json_agg(DISTINCT jsonb_build_object('id', cb.id, 'name', cb.name)) FILTER (WHERE cb.id IS NOT NULL), '[]'),
		       COUNT(*) OVER() AS total
		FROM reservations r
		JOIN members rm ON rm.id = r.reserved_by
		JOIN users u ON u.id = rm.user_id
		LEFT JOIN reservation_tables rt ON rt.reservation_id = r.id
		LEFT JOIN dining_tables t ON t.id = rt.table_id
		LEFT JOIN reservation_cabins rc ON rc.reservation_id = r.id
		LEFT JOIN cabins cb ON cb.id = rc.cabin_id
		WHERE r.hotel_id = $1::uuid
		  AND ($2 = '' OR r.guest_name ILIKE '%' || $2 || '%' OR r.guest_phone ILIKE '%' || $2 || '%')
		  AND ($6 = '' OR r.status = $6)
		  AND EXISTS (
			SELECT 1 FROM members m WHERE m.hotel_id = r.hotel_id AND m.user_id = $3::uuid AND m.status = 'active'
		  )
		GROUP BY r.id, u.name
		ORDER BY r.reserved_at DESC
		LIMIT $4 OFFSET $5
	`, hotelID, pagination.Search, userID, pagination.Limit, pagination.Offset(), status)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	list := make([]model.Reservation, 0)
	var total int

	for rows.Next() {
		var reservation model.Reservation
		var tablesJSON, cabinsJSON []byte
		if err := rows.Scan(
			&reservation.ID, &reservation.HotelID, &reservation.GuestName, &reservation.GuestPhone, &reservation.PartySize,
			&reservation.ReservedAt, &reservation.ReservedBy, &reservation.ReservedByName,
			&reservation.Status, &reservation.Notes, &reservation.CreatedAt, &reservation.UpdatedAt,
			&tablesJSON, &cabinsJSON, &total,
		); err != nil {
			return nil, 0, err
		}
		if err := json.Unmarshal(tablesJSON, &reservation.Tables); err != nil {
			return nil, 0, err
		}
		if err := json.Unmarshal(cabinsJSON, &reservation.Cabins); err != nil {
			return nil, 0, err
		}
		list = append(list, reservation)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, err
	}

	return list, total, nil
}

func (r *reservationRepo) Update(ctx context.Context, reservation *model.Reservation, tableIDs, cabinIDs *[]string, userID string) (model.Reservation, error) {
	tx, err := r.DB.Begin(ctx)
	if err != nil {
		return model.Reservation{}, err
	}
	defer tx.Rollback(ctx)

	var updated model.Reservation
	err = tx.QueryRow(ctx, `
		UPDATE reservations r
		SET guest_name = $1, guest_phone = $2, party_size = $3, reserved_at = $4, notes = $5, updated_at = now()
		WHERE r.id = $6::uuid AND r.hotel_id = $7::uuid
		  AND EXISTS (
			SELECT 1 FROM members m WHERE m.hotel_id = r.hotel_id AND m.user_id = $8::uuid AND m.status = 'active'
		  )
		RETURNING id, hotel_id, guest_name, guest_phone, party_size, reserved_at, reserved_by, status, notes, created_at, updated_at
	`,
		reservation.GuestName, reservation.GuestPhone, reservation.PartySize, reservation.ReservedAt, reservation.Notes,
		reservation.ID, reservation.HotelID, userID,
	).Scan(
		&updated.ID, &updated.HotelID, &updated.GuestName, &updated.GuestPhone, &updated.PartySize,
		&updated.ReservedAt, &updated.ReservedBy, &updated.Status, &updated.Notes,
		&updated.CreatedAt, &updated.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.Reservation{}, apperr.ErrReservationNotFound
		}
		return model.Reservation{}, err
	}
	updated.Tables = []model.ReservationResourceRef{}
	updated.Cabins = []model.ReservationResourceRef{}

	if tableIDs != nil {
		if _, err := tx.Exec(ctx, `DELETE FROM reservation_tables WHERE reservation_id = $1::uuid`, updated.ID); err != nil {
			return model.Reservation{}, err
		}
		if len(*tableIDs) > 0 {
			tag, err := tx.Exec(ctx, `
				INSERT INTO reservation_tables (reservation_id, table_id)
				SELECT $1::uuid, t.id FROM dining_tables t
				WHERE t.id = ANY($2::uuid[]) AND t.hotel_id = $3::uuid
			`, updated.ID, *tableIDs, reservation.HotelID)
			if err != nil {
				return model.Reservation{}, err
			}
			if tag.RowsAffected() != int64(len(*tableIDs)) {
				return model.Reservation{}, apperr.ErrTableInvalid
			}
		}
	}

	if cabinIDs != nil {
		if _, err := tx.Exec(ctx, `DELETE FROM reservation_cabins WHERE reservation_id = $1::uuid`, updated.ID); err != nil {
			return model.Reservation{}, err
		}
		if len(*cabinIDs) > 0 {
			tag, err := tx.Exec(ctx, `
				INSERT INTO reservation_cabins (reservation_id, cabin_id)
				SELECT $1::uuid, cb.id FROM cabins cb
				WHERE cb.id = ANY($2::uuid[]) AND cb.hotel_id = $3::uuid
			`, updated.ID, *cabinIDs, reservation.HotelID)
			if err != nil {
				return model.Reservation{}, err
			}
			if tag.RowsAffected() != int64(len(*cabinIDs)) {
				return model.Reservation{}, apperr.ErrCabinInvalid
			}
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return model.Reservation{}, err
	}

	return updated, nil
}

func (r *reservationRepo) UpdateStatus(ctx context.Context, id, hotelID, userID, status string) (model.Reservation, error) {
	var updated model.Reservation
	err := r.DB.QueryRow(ctx, `
		UPDATE reservations r
		SET status = $1, updated_at = now()
		WHERE r.id = $2::uuid AND r.hotel_id = $3::uuid
		  AND EXISTS (
			SELECT 1 FROM members m WHERE m.hotel_id = r.hotel_id AND m.user_id = $4::uuid AND m.status = 'active'
		  )
		RETURNING id, hotel_id, guest_name, guest_phone, party_size, reserved_at, reserved_by, status, notes, created_at, updated_at
	`, status, id, hotelID, userID).Scan(
		&updated.ID, &updated.HotelID, &updated.GuestName, &updated.GuestPhone, &updated.PartySize,
		&updated.ReservedAt, &updated.ReservedBy, &updated.Status, &updated.Notes,
		&updated.CreatedAt, &updated.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.Reservation{}, apperr.ErrReservationNotFound
		}
		return model.Reservation{}, err
	}
	updated.Tables = []model.ReservationResourceRef{}
	updated.Cabins = []model.ReservationResourceRef{}

	return updated, nil
}

func (r *reservationRepo) Delete(ctx context.Context, id, hotelID, userID string) error {
	result, err := r.DB.Exec(ctx, `
		DELETE FROM reservations
		WHERE id = $1::uuid AND hotel_id = $2::uuid
		  AND EXISTS (
			SELECT 1 FROM members m WHERE m.hotel_id = reservations.hotel_id AND m.user_id = $3::uuid AND m.status = 'active'
		  )
	`, id, hotelID, userID)
	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return apperr.ErrReservationNotFound
	}

	return nil
}
