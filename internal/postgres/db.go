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
	"github.com/thanhpk/randstr"
)

var _ rest.Database = (*Database)(nil)

const (
	dbDateTimeFormat = `YYYY-MM-DD"T"HH24:MI:ss"Z"`
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
			(id, event_start, event_end, event_name, visible, contact, email, status, rate_id, details) 
			values($1, $2, $3, $4, $5, $6, $7, $8, 'default', $9)`, uuid.New(), event.Event.From, event.Event.To, event.Event.Name, event.Event.PubliclyVisible, event.Contact.Name, event.Contact.EmailAddress, consts.EventStatusProvisional, event.Event.Details)
		if err != nil {
			return errors.Join(err, errors.New("failed to insert new booking"))
		}

		return nil
	})
}

func (db *Database) AddInvoice(ctx context.Context, invoice *rest.SendInvoiceBody) (*rest.Invoice, error) {
	inv := &rest.Invoice{
		Id:        uuid.New().String(),
		Reference: randstr.String(6, consts.ReferenceLetters),
		Contact:   invoice.Contact,
	}

	err := pgx.BeginFunc(ctx, db.pool, func(tx pgx.Tx) error {
		_, err := tx.Exec(ctx, `insert into booking_invoices (id, reference, contact) values($1, $2, $3)`, inv.Id, inv.Reference, inv.Contact)
		if err != nil {
			return errors.Join(err, errors.New("failed to insert new invoice"))
		}

		for _, item := range invoice.Items {
			id := uuid.New().String()
			i := rest.InvoiceItem{
				Id:          &id,
				Description: item.Description,
				Cost:        item.Cost,
				EventID:     item.EventID,
			}

			_, err := tx.Exec(ctx, `insert into booking_invoice_items 
    				(id, invoice_id, event_id, description, cost) 
					values($1, $2, $3, $4, $5)`, i.Id, inv.Id, i.EventID, i.Description, i.Cost)
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
		order by event_start, event_end, event_name`, from, to, dbDateTimeFormat)
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
	rows, err := db.pool.Query(ctx, `select id, to_char(event_start, $3), to_char(event_end, $3), event_name, visible, status, contact, email, 
       		assignee, keyholder_in, keyholder_out
		from booking_events
		where (event_start >= $1 and event_start <= $2)
		or event_end >= $1 and event_end <= $2
		order by event_start, event_end, event_name`, from, to, dbDateTimeFormat)
	if err != nil {
		return nil, err
	}

	return pgx.CollectRows(rows, func(row pgx.CollectableRow) (rest.Event, error) {
		var event rest.Event

		if err := row.Scan(&event.Id, &event.From, &event.To, &event.Name, &event.Visible, &event.Status, &event.Contact, &event.Email, &event.Assignee, &event.KeyholderIn, &event.KeyholderOut); err != nil {
			return event, err
		}

		return event, nil
	})
}

func (db *Database) GetEvent(ctx context.Context, id string) (rest.Event, error) {
	row := db.pool.QueryRow(ctx, `select id, to_char(event_start, $2), to_char(event_end, $2), event_name, visible, status, contact, email, 
       		assignee, keyholder_in, keyholder_out, rate_id, details
		from booking_events
		where id = $1`, id, dbDateTimeFormat)

	var event rest.Event
	if err := row.Scan(&event.Id, &event.From, &event.To, &event.Name, &event.Visible, &event.Status, &event.Contact, &event.Email, &event.Assignee, &event.KeyholderIn, &event.KeyholderOut, &event.RateID, &event.Details); err != nil {
		return event, err
	}

	rows, err := db.pool.Query(ctx, `select distinct(bi.id), bi.reference, bi.status	
		from booking_invoices bi
		right join public.booking_invoice_items bii on bi.id = bii.invoice_id
		where bii.event_id = $1`, id)
	if err != nil {
		return event, err
	}

	invoiceRefs, err := pgx.CollectRows(rows, func(row pgx.CollectableRow) (rest.InvoiceRef, error) {
		var eventRef rest.InvoiceRef
		if err := row.Scan(&eventRef.Id, &eventRef.Reference, &eventRef.Status); err != nil {
			return eventRef, err
		}

		return eventRef, nil
	})

	event.Invoices = &invoiceRefs

	return event, nil
}

func (db *Database) MarkInvoiceSent(ctx context.Context, id string) error {
	_, err := db.pool.Exec(ctx, "update booking_invoices set sent = $1 where id = $2", time.Now(), id)
	if err != nil {
		return err
	}

	return nil
}

func (db *Database) GetInvoiceEvents(ctx context.Context, ids []string) ([]rest.DBInvoiceEvent, error) {
	rows, err := db.pool.Query(ctx, `select be.id, to_char(be.event_start, $2), to_char(be.event_end, $2), be.event_name, be.status, be.email, 
       			br.hourly_rate::numeric::decimal, br.discount_table
		from booking_events be
		join booking_rates br on be.rate_id = br.id
		where be.id = any($1)
		order by contact, event_name`, ids, dbDateTimeFormat)
	if err != nil {
		return nil, err
	}

	return pgx.CollectRows(rows, func(row pgx.CollectableRow) (rest.DBInvoiceEvent, error) {
		var event rest.DBInvoiceEvent
		if err := row.Scan(&event.Id, &event.From, &event.To, &event.Name, &event.Status, &event.Email, &event.Rate, &event.DiscountTable); err != nil {
			return event, err
		}

		return event, nil
	})
}

func (db *Database) GetInvoiceByID(ctx context.Context, id string) (rest.Invoice, error) {
	row := db.pool.QueryRow(ctx, `select id, reference, contact, to_char(sent, $2), to_char(paid, $2), status
		from booking_invoices
		where id = $1`, id, dbDateTimeFormat)

	var invoice rest.Invoice
	if err := row.Scan(&invoice.Id, &invoice.Reference, &invoice.Contact, &invoice.Sent, &invoice.Paid, &invoice.Status); err != nil {
		return invoice, err
	}

	rows, err := db.pool.Query(ctx, `select id, event_id, description, cost::numeric::decimal
		from booking_invoice_items
		where invoice_id = $1`, id)
	if err != nil {
		return invoice, err
	}

	items, err := pgx.CollectRows(rows, func(row pgx.CollectableRow) (rest.InvoiceItem, error) {
		var item rest.InvoiceItem
		if err := row.Scan(&item.Id, &item.EventID, &item.Description, &item.Cost); err != nil {
			return item, err
		}

		return item, nil
	})

	invoice.Items = items

	return invoice, nil
}

func (db *Database) MarkInvoicePaid(ctx context.Context, id string) error {
	_, err := db.pool.Exec(ctx, "update booking_invoices set paid = $1, status = 'paid' where id = $2", time.Now(), id)
	if err != nil {
		return err
	}

	return nil
}

func (db *Database) GetRates(ctx context.Context) ([]rest.Rate, error) {
	rows, err := db.pool.Query(ctx, `select id, description, hourly_rate::numeric::decimal, discount_table
		from booking_rates
		order by id`)
	if err != nil {
		return nil, err
	}

	return pgx.CollectRows(rows, func(row pgx.CollectableRow) (rest.Rate, error) {
		var rate rest.Rate
		if err := row.Scan(&rate.Id, &rate.Description, &rate.HourlyRate, &rate.DiscountTable); err != nil {
			return rate, err
		}

		return rate, nil
	})
}

func (db *Database) SetRate(ctx context.Context, eventID string, rate string) error {
	_, err := db.pool.Exec(ctx, "update booking_events set rate_id = $1 where id = $2", rate, eventID)
	if err != nil {
		return err
	}

	return nil
}

func (db *Database) SetEventStatus(ctx context.Context, eventID string, status string) error {
	_, err := db.pool.Exec(ctx, "update booking_events set status = $1 where id = $2", status, eventID)
	if err != nil {
		return err
	}

	return nil
}
