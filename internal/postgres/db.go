package postgres

import (
	"context"
	"errors"
	"time"

	"github.com/girlguidingstaplehurst/booking/internal/consts"
	"github.com/girlguidingstaplehurst/booking/internal/rest"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/shopspring/decimal"
	"github.com/thanhpk/randstr"
)

var _ rest.Database = (*Database)(nil)

const (
	EventStatusProvisional       = "provisional"
	EventStatusAwaitingDocuments = "awaiting documents"
	EventStatusApproved          = "approved"
	EventStatusCancelled         = "cancelled"
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

		rows, err := tx.Query(ctx, `select count(*) from booking_events 
			where (event_start - interval '30 minutes' <= $1 and event_end + interval '30 minutes' >= $1)
			or (event_start - interval '30 minutes' <= $2 and event_end + interval '30 minutes'>= $2)
			or (event_start - interval '30 minutes'>= $1 and event_end + interval '30 minutes' <= $2)`, event.Event.From, event.Event.To)
		if err != nil {
			return errors.Join(err, errors.New("failed to count existing overlapping bookings"))
		}

		count, err := pgx.CollectOneRow(rows, pgx.RowTo[int])
		if err != nil {
			return errors.Join(err, errors.New("failed to extract count of rows"))
		}

		if count > 0 {
			return consts.ErrBookingExists
		}

		_, err = tx.Exec(ctx, `insert into booking_events
			(id, event_start, event_end, event_name, visible, contact, email, status) 
			values($1, $2, $3, $4, $5, $6, $7, $8)`, uuid.New(), event.Event.From, event.Event.To, event.Event.Name, event.Event.PubliclyVisible, event.Contact.Name, event.Contact.EmailAddress, EventStatusProvisional)
		if err != nil {
			return errors.Join(err, errors.New("failed to insert new booking"))
		}

		return nil
	})
}

func (db *Database) AddInvoice(ctx context.Context, invoice *rest.SendInvoiceBody) (*rest.Invoice, error) {
	inv := &rest.Invoice{
		ID:        uuid.New(),
		Reference: randstr.String(6, consts.ReferenceLetters),
		Contact:   string(invoice.Contact),
	}

	err := pgx.BeginFunc(ctx, db.pool, func(tx pgx.Tx) error {
		_, err := tx.Exec(ctx,
			`insert into booking_invoices (id, reference, contact) values($1, $2, $3)`,
			inv.ID.String(), inv.Reference, inv.Contact)
		if err != nil {
			return errors.Join(err, errors.New("failed to insert new invoice"))
		}

		for _, item := range invoice.Items {
			i := &rest.InvoiceItem{
				ID:          uuid.New(),
				Description: item.Description,
				Cost:        decimal.NewFromFloat32(item.Cost),
			}
			if item.EventID != nil {
				i.EventID, err = uuid.Parse(*item.EventID)
				if err != nil {
					return errors.Join(err, errors.New("failed to parse event id"))
				}
			}

			_, err := tx.Exec(ctx, `insert into booking_invoice_items 
    				(id, invoice_id, event_id, description, cost) 
					values($1, $2, $3, $4, $5)`,
				i.ID.String(),
				inv.ID.String(),
				i.EventID.String(),
				i.Description,
				i.Cost.String(),
			)
			if err != nil {
				return errors.Join(err, errors.New("failed to insert invoice item"))
			}

			inv.Items = append(inv.Items, i)
		}

		return nil
	})

	return inv, err
}

func (db *Database) ListEvents(ctx context.Context, from, to time.Time) ([]rest.ListEvent, error) {
	rows, err := db.pool.Query(ctx, `select id, to_char(event_start, $3), to_char(event_end, $3), event_name, visible, status 
		from booking_events
		where (event_start >= $1 and event_start <= $2)
		or event_end >= $1 and event_end <= $2
		order by event_start, event_end, event_name`, from, to, `YYYY-MM-DD"T"HH:MI:ss"Z"`)
	if err != nil {
		return nil, err
	}

	return pgx.CollectRows(rows, func(row pgx.CollectableRow) (rest.ListEvent, error) {
		var (
			event   rest.ListEvent
			visible bool
		)

		if err := row.Scan(&event.Id, &event.From, &event.To, &event.Name, &visible, &event.Status); err != nil {
			return event, err
		}

		if !visible {
			event.Name = "Private Event"
		}

		return event, nil
	})
}

func (db *Database) AdminListEvents(ctx context.Context, from, to time.Time) ([]rest.Event, error) {
	rows, err := db.pool.Query(ctx,
		`select id, to_char(event_start, $3), to_char(event_end, $3), event_name, visible, status, contact, email, 
       		assignee, keyholder_in, keyholder_out
		from booking_events
		where (event_start >= $1 and event_start <= $2)
		or event_end >= $1 and event_end <= $2
		order by event_start, event_end, event_name`, from, to, `YYYY-MM-DD"T"HH:MI:ss"Z"`)
	if err != nil {
		return nil, err
	}

	return pgx.CollectRows(rows, func(row pgx.CollectableRow) (rest.Event, error) {
		var event rest.Event

		if err := row.Scan(&event.Id, &event.From, &event.To, &event.Name, &event.Visible, &event.Status,
			&event.Contact, &event.Email, &event.Assignee, &event.KeyholderIn, &event.KeyholderOut); err != nil {
			return event, err
		}

		return event, nil
	})
}

func (db *Database) GetEvent(ctx context.Context, id string) (rest.Event, error) {
	row := db.pool.QueryRow(ctx,
		`select id, to_char(event_start, $2), to_char(event_end, $2), event_name, visible, status, contact, email, 
       		assignee, keyholder_in, keyholder_out 
		from booking_events
		where id = $1`, id, `YYYY-MM-DD"T"HH:MI:ss"Z"`)

	var event rest.Event
	if err := row.Scan(&event.Id, &event.From, &event.To, &event.Name, &event.Visible, &event.Status,
		&event.Contact, &event.Email, &event.Assignee, &event.KeyholderIn, &event.KeyholderOut); err != nil {
		return event, err
	}

	return event, nil
}

func (db *Database) MarkInvoiceSent(ctx context.Context, id uuid.UUID) error {
	_, err := db.pool.Exec(ctx, "update booking_invoices set sent = $1 where id = $2", time.Now(), id)
	if err != nil {
		return err
	}

	return nil
}
