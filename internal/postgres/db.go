package postgres

import (
	"context"
	"errors"

	"github.com/girlguidingstaplehurst/booking/internal/rest"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var _ rest.Database = (*Database)(nil)

const (
	EventStatusProvisional = "provisional"
	EventStatusApproved    = "approved"
)

var (
	ErrBookingExists = errors.New("a booking already exists between those dates")
)

type Database struct {
	pool *pgxpool.Pool
}

func NewDatabase(pool *pgxpool.Pool) *Database {
	return &Database{pool: pool}
}

func (db *Database) AddEvent(ctx context.Context, event *rest.AddEventJSONRequestBody) error {
	return pgx.BeginFunc(ctx, db.pool, func(tx pgx.Tx) error {
		_, err := tx.Exec(ctx, "lock table booking_events in share row exclusive mode")
		if err != nil {
			return errors.Join(err, errors.New("failed to lock table"))
		}

		rows, err := tx.Query(ctx,
			`select count(*) from booking_events 
			where (event_start - interval '30 minutes' <= $1 and event_end + interval '30 minutes' >= $1)
			or (event_start - interval '30 minutes' <= $2 and event_end + interval '30 minutes'>= $2)
			or (event_start - interval '30 minutes'>= $1 and event_end + interval '30 minutes' <= $2)`,
			event.Event.From,
			event.Event.To,
		)
		if err != nil {
			return errors.Join(err, errors.New("failed to count existing overlapping bookings"))
		}

		count, err := pgx.CollectOneRow(rows, pgx.RowTo[int])
		if err != nil {
			return errors.Join(err, errors.New("failed to extract count of rows"))
		}

		if count > 0 {
			return ErrBookingExists
		}

		_, err = tx.Exec(ctx,
			`insert into booking_events
			(id, event_start, event_end, event_name, visible, contact, email, status) 
			values($1, $2, $3, $4, $5, $6, $7, $8)`,
			uuid.New(),
			event.Event.From,
			event.Event.To,
			event.Event.Name,
			event.Event.PubliclyVisible,
			event.Contact.Name,
			event.Contact.EmailAddress,
			EventStatusProvisional)
		if err != nil {
			return errors.Join(err, errors.New("failed to insert new booking"))
		}

		return nil
	})
}
