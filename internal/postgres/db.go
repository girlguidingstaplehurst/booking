package postgres

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"strings"
	"time"

	"github.com/girlguidingstaplehurst/booking/internal/consts"
	"github.com/girlguidingstaplehurst/booking/internal/rest"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	openapi_types "github.com/oapi-codegen/runtime/types"
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
	if err := db.ensureContactExists(ctx, string(event.Contact.EmailAddress), event.Contact.Name); err != nil {
		return err
	}

	return pgx.BeginFunc(ctx, db.pool, func(tx pgx.Tx) error {
		_, err := tx.Exec(ctx, "lock table booking_events in share row exclusive mode")
		if err != nil {
			return errors.Join(err, errors.New("failed to lock table"))
		}

		err = db.checkForNearbyBookings(ctx, tx, event.Event.From, event.Event.To)
		if err != nil {
			return err
		}

		err = db.insertEvent(ctx, tx, event, consts.EventStatusProvisional, consts.RateDefault)
		if err != nil {
			return err
		}

		return nil
	})
}

func (db *Database) ensureContactExists(ctx context.Context, email, name string) error {
	// We only insert if the contact (identified by email) doesn't already exist - we don't update the name if the
	// record already exists.
	_, err := db.pool.Exec(ctx, `INSERT INTO booking_contacts (email, name) 
				SELECT $1, $2 WHERE NOT EXISTS(SELECT 1 FROM booking_contacts WHERE email=$1)`, email, name)
	if err != nil {
		return errors.Join(err, errors.New("failed to ensure contact exists"))
	}

	return nil
}

func (db *Database) insertEvent(ctx context.Context, tx pgx.Tx, event *rest.AddEventJSONRequestBody, status, rate string) error {
	_, err := tx.Exec(ctx, `insert into booking_events
			(id, event_start, event_end, event_name, visible, email, status, rate_id, details) 
			values($1, $2, $3, $4, $5, $6, $7, $8, $9)`, uuid.New(), event.Event.From, event.Event.To, event.Event.Name, event.Event.PubliclyVisible, event.Contact.EmailAddress, status, rate, event.Event.Details)
	if err != nil {
		return errors.Join(err, errors.New("failed to insert new booking"))
	}
	return nil
}

func (db *Database) checkForNearbyBookings(ctx context.Context, tx pgx.Tx, from, to string) error {
	rows, err := tx.Query(ctx, `select count(*) from booking_events 
			where (event_start - interval '30 minutes' <= $1 and event_end + interval '30 minutes' >= $1)
			or (event_start - interval '30 minutes' <= $2 and event_end + interval '30 minutes'>= $2)
			or (event_start - interval '30 minutes'>= $1 and event_end + interval '30 minutes' <= $2)`, from, to)
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
	return nil
}

func (db *Database) AddInvoice(ctx context.Context, invoice *rest.SendInvoiceBody) (*rest.Invoice, error) {
	inv := &rest.Invoice{
		Id:        uuid.New().String(),
		Reference: randstr.String(6, consts.ReferenceLetters),
		Contact:   invoice.Contact,
	}
	err := pgx.BeginFunc(ctx, db.pool, func(tx pgx.Tx) error {
		for _, item := range invoice.Items {
			if item.EventID == nil {
				continue
			}

			var grouped bool
			if err := tx.QueryRow(ctx, `select event_group_id is not null from booking_events where id = $1`, *item.EventID).Scan(&grouped); err != nil {
				return err
			}
			if grouped && invoice.EventGroup == nil {
				return errors.New("individual invoices are not allowed for event group events")
			}
		}

		_, err := tx.Exec(ctx, `insert into booking_invoices (id, reference, contact, event_group_id) values($1, $2, $3, $4)`, inv.Id, inv.Reference, inv.Contact, invoice.EventGroup)
		if err != nil {
			return errors.Join(err, errors.New("failed to insert new invoice"))
		}

		if invoice.Events != nil {
			for _, eventID := range *invoice.Events {
				if _, err := tx.Exec(ctx, `insert into booking_invoice_events (invoice_id, event_id) values ($1, $2)`, inv.Id, eventID); err != nil {
					return errors.Join(err, errors.New("failed to associate invoice with event"))
				}
			}
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
    				(id, invoice_id, description, cost)
					values($1, $2, $3, $4)`, i.Id, inv.Id, i.Description, i.Cost)
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
		var event rest.ListEvent

		if err := row.Scan(&event.Id, &event.From, &event.To, &event.Name, &event.Visible, &event.Status); err != nil {
			return event, err
		}

		if !event.Visible {
			event.Name = "Private Event"
		}

		return event, nil
	})
}

func (db *Database) ListEventsForContact(ctx context.Context, contactID string, from, to time.Time) ([]rest.ListEvent, error) {
	rows, err := db.pool.Query(ctx, `select id, to_char(event_start, $3), to_char(event_end, $3), event_name, visible, status 
		from booking_events
		where (
		    (event_start >= $1 and event_start <= $2) or (event_end >= $1 and event_end <= $2)
		)
		and email = $4
		order by event_start, event_end, event_name`, from, to, dbDateTimeFormat, contactID)
	if err != nil {
		return nil, err
	}

	return pgx.CollectRows(rows, func(row pgx.CollectableRow) (rest.ListEvent, error) {
		var event rest.ListEvent

		if err := row.Scan(&event.Id, &event.From, &event.To, &event.Name, &event.Visible, &event.Status); err != nil {
			return event, err
		}

		if !event.Visible {
			event.Name = "Private Event"
		}

		return event, nil
	})
}

func (db *Database) AdminListEvents(ctx context.Context, from, to time.Time) (rest.AdminEventList, error) {
	rows, err := db.pool.Query(ctx, `select e.id, to_char(e.event_start, $3), to_char(e.event_end, $3), e.event_name, e.visible, e.status, contact.name, contact.email,
	        	 e.assignee, e.keyholder_in, e.keyholder_out, e.event_group_id,
		coalesce(json_agg(json_build_object('id', bi.id, 'reference', bi.reference, 'status', bi.status, 'sent', bi.sent, 'paid', bi.paid)) filter (where bi.id is not null), '[]'::json)
		from booking_events e
		JOIN booking_contacts contact ON e.email = contact.email 
		left join booking_invoice_events bie on bie.event_id = e.id
		left join booking_invoices bi on bi.id = bie.invoice_id
		where (e.event_start >= $1 and e.event_start <= $2)
		or e.event_end >= $1 and e.event_end <= $2
		group by e.id, e.event_start, e.event_end, e.event_name, e.visible, e.status, contact.name, contact.email, e.assignee, e.keyholder_in, e.keyholder_out, e.event_group_id
		order by e.event_start, e.event_end, e.event_name`, from, to, dbDateTimeFormat)
	if err != nil {
		return rest.AdminEventList{}, err
	}

	events, err := pgx.CollectRows(rows, func(row pgx.CollectableRow) (rest.Event, error) {
		var event rest.Event

		var invoiceJSON []byte
		if err := row.Scan(&event.Id, &event.From, &event.To, &event.Name, &event.Visible, &event.Status, &event.Contact, &event.Email, &event.Assignee, &event.KeyholderIn, &event.KeyholderOut, &event.EventGroupID, &invoiceJSON); err != nil {
			return event, err
		}
		var invoices []rest.InvoiceRef
		if err := json.Unmarshal(invoiceJSON, &invoices); err != nil {
			return event, err
		}
		event.Invoices = &invoices

		return event, nil
	})
	if err != nil {
		return rest.AdminEventList{}, err
	}

	groupRows, err := db.pool.Query(ctx, `select g.id, g.event_name,
		to_char(min(e.event_start), $3), to_char(max(e.event_end), $3),
		coalesce(jsonb_agg(distinct jsonb_build_object('id', bi.id, 'reference', bi.reference, 'status', bi.status, 'sent', bi.sent, 'paid', bi.paid)) filter (where bi.id is not null), '[]'::jsonb)
		from booking_event_groups g
		join booking_events e on e.event_group_id = g.id
		left join booking_invoices bi on bi.event_group_id = g.id
		where (e.event_start >= $1 and e.event_start <= $2)
		or e.event_end >= $1 and e.event_end <= $2
		group by g.id, g.event_name
		order by min(e.event_start), g.event_name`, from, to, dbDateTimeFormat)
	if err != nil {
		return rest.AdminEventList{}, err
	}

	eventGroups, err := pgx.CollectRows(groupRows, func(row pgx.CollectableRow) (rest.AdminEventGroup, error) {
		var group rest.AdminEventGroup
		var invoiceJSON []byte
		if err := row.Scan(&group.Id, &group.Name, &group.From, &group.To, &invoiceJSON); err != nil {
			return group, err
		}
		if err := json.Unmarshal(invoiceJSON, &group.Invoices); err != nil {
			return group, err
		}
		return group, nil
	})
	if err != nil {
		return rest.AdminEventList{}, err
	}

	return rest.AdminEventList{Events: events, EventGroups: eventGroups}, nil
}

func (db *Database) GetEvent(ctx context.Context, id string) (rest.Event, error) {
	row := db.pool.QueryRow(ctx, `select id, to_char(event_start, $2), to_char(event_end, $2), event_name, visible, status, contact.name, contact.email, 
       		assignee, keyholder_in, keyholder_out, rate_id, details
		from booking_events e
		JOIN booking_contacts contact ON e.email = contact.email
		where id = $1`, id, dbDateTimeFormat)

	var event rest.Event
	if err := row.Scan(&event.Id, &event.From, &event.To, &event.Name, &event.Visible, &event.Status, &event.Contact, &event.Email, &event.Assignee, &event.KeyholderIn, &event.KeyholderOut, &event.RateID, &event.Details); err != nil {
		return event, err
	}

	rows, err := db.pool.Query(ctx, `select distinct(bi.id), bi.reference, bi.status, bi.sent, bi.paid	
		from booking_invoices bi
		where bi.id in (select invoice_id from booking_invoice_events where event_id = $1)`, id)
	if err != nil {
		return event, err
	}

	invoiceRefs, err := pgx.CollectRows(rows, func(row pgx.CollectableRow) (rest.InvoiceRef, error) {
		var ir rest.InvoiceRef
		if err := row.Scan(&ir.Id, &ir.Reference, &ir.Status, &ir.Sent, &ir.Paid); err != nil {
			return ir, err
		}

		return ir, nil
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

func (db *Database) GetInvoiceEvents(ctx context.Context, ids ...string) ([]rest.DBInvoiceEvent, error) {
	var idPlaceholders []string
	var ne []any
	for i, id := range ids {
		idPlaceholders = append(idPlaceholders, fmt.Sprintf("$%d", i+1))
		ne = append(ne, id)
	}

	join := strings.Join(idPlaceholders, ",")

	rows, err := db.pool.Query(ctx, `select be.id, 
			to_char(be.event_start, '`+dbDateTimeFormat+`'), 
			to_char(be.event_end, '`+dbDateTimeFormat+`'), 
			be.event_name, be.status, be.email, 
			bc.name,
       		br.hourly_rate::numeric::decimal, br.discount_table
		from booking_events be
		join booking_contacts bc on bc.email = be.email
		join booking_rates br on be.rate_id = br.id
		where be.id in (`+join+`)
		order by be.email, be.event_name, be.event_start`, ne...)
	if err != nil {
		return nil, err
	}

	slog.Info("dumping rows", "rows", rows)

	return pgx.CollectRows(rows, func(row pgx.CollectableRow) (rest.DBInvoiceEvent, error) {
		slog.Info("dumping row", "row", row)
		var event rest.DBInvoiceEvent
		if err := row.Scan(&event.Id, &event.From, &event.To, &event.Name, &event.Status, &event.Email, &event.ContactName, &event.Rate, &event.DiscountTable); err != nil {
			return event, err
		}

		return event, nil
	})
}

func (db *Database) GetInvoiceEventsForGroup(ctx context.Context, groupID string) ([]rest.DBInvoiceEvent, error) {
	rows, err := db.pool.Query(ctx, `select be.id,
		to_char(be.event_start, '`+dbDateTimeFormat+`'),
		to_char(be.event_end, '`+dbDateTimeFormat+`'),
		be.event_name, be.status, be.email, bc.name,
		beg.id, beg.event_name,
		br.id, br.description, br.hourly_rate::numeric::decimal, br.discount_table, br.per_session
		from booking_events be
		join booking_event_groups beg on beg.id = be.event_group_id
		join booking_contacts bc on bc.email = beg.email
		join booking_rates br on br.id = beg.rate
		where be.event_group_id = $1
		order by be.event_start`, groupID)
	if err != nil {
		return nil, err
	}

	return pgx.CollectRows(rows, func(row pgx.CollectableRow) (rest.DBInvoiceEvent, error) {
		var event rest.DBInvoiceEvent
		var standardDiscount, standardPerSession []byte
		var standardID, standardDescription string
		var standardHourly float32
		if err := row.Scan(
			&event.Id, &event.From, &event.To, &event.Name, &event.Status, &event.Email, &event.ContactName,
			&event.EventGroup, &event.GroupName,
			&standardID, &standardDescription, &standardHourly, &standardDiscount, &standardPerSession,
		); err != nil {
			return event, err
		}

		if err := json.Unmarshal(standardDiscount, &event.DiscountTable); err != nil {
			return event, err
		}
		standardPricing := rest.PerSessionPricing{}
		if err := json.Unmarshal(standardPerSession, &standardPricing); err != nil {
			return event, err
		}
		event.Rate = standardHourly
		event.RateDefinition = rateFromFields(standardID, standardDescription, standardHourly, standardDiscount, standardPricing)
		return event, nil
	})
}

func rateFromFields(id, description string, hourly float32, discountJSON []byte, perSession rest.PerSessionPricing) *rest.Rate {
	var discountTable map[string]interface{}
	if err := json.Unmarshal(discountJSON, &discountTable); err != nil {
		discountTable = map[string]interface{}{}
	}
	return &rest.Rate{
		Id:            id,
		Description:   description,
		HourlyRate:    hourly,
		DiscountTable: &discountTable,
		PerSession:    perSession,
	}
}

func (db *Database) GetInvoiceByID(ctx context.Context, id string) (rest.Invoice, error) {
	row := db.pool.QueryRow(ctx, `select id, reference, contact, to_char(sent, $2), to_char(paid, $2), status
		from booking_invoices
		where id = $1`, id, dbDateTimeFormat)

	var invoice rest.Invoice
	if err := row.Scan(&invoice.Id, &invoice.Reference, &invoice.Contact, &invoice.Sent, &invoice.Paid, &invoice.Status); err != nil {
		return invoice, err
	}

	rows, err := db.pool.Query(ctx, `select id, description, cost::numeric::decimal
		from booking_invoice_items
		where invoice_id = $1`, id)
	if err != nil {
		return invoice, err
	}

	items, err := pgx.CollectRows(rows, func(row pgx.CollectableRow) (rest.InvoiceItem, error) {
		var item rest.InvoiceItem
		if err := row.Scan(&item.Id, &item.Description, &item.Cost); err != nil {
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
	rows, err := db.pool.Query(ctx, `select id, description, hourly_rate::numeric::decimal, discount_table, per_session
		from booking_rates
		order by id`)
	if err != nil {
		return nil, err
	}

	return pgx.CollectRows(rows, func(row pgx.CollectableRow) (rest.Rate, error) {
		var rate rest.Rate
		if err := row.Scan(&rate.Id, &rate.Description, &rate.HourlyRate, &rate.DiscountTable, &rate.PerSession); err != nil {
			return rate, err
		}

		return rate, nil
	})
}

func (db *Database) CreateRate(ctx context.Context, input rest.CreateRateBody) (rest.Rate, error) {
	perSession, err := json.Marshal(input.PerSession)
	if err != nil {
		return rest.Rate{}, err
	}

	var rate rest.Rate
	err = db.pool.QueryRow(ctx, `
		insert into booking_rates (id, description, hourly_rate, discount_table, per_session)
		values ($1, $2, $3, '{}', $4)
		returning id, description, hourly_rate::numeric::decimal, discount_table, per_session`,
		input.Id, input.Description, input.HourlyRate, perSession,
	).Scan(&rate.Id, &rate.Description, &rate.HourlyRate, &rate.DiscountTable, &rate.PerSession)
	return rate, err
}

func (db *Database) UpdateRate(ctx context.Context, id string, input rest.UpdateRateBody) (rest.Rate, error) {
	perSession, err := json.Marshal(input.PerSession)
	if err != nil {
		return rest.Rate{}, err
	}

	var rate rest.Rate
	err = db.pool.QueryRow(ctx, `
		update booking_rates
		set description = $1, hourly_rate = $2, per_session = $3
		where id = $4
		returning id, description, hourly_rate::numeric::decimal, discount_table, per_session`,
		input.Description, input.HourlyRate, perSession, id,
	).Scan(&rate.Id, &rate.Description, &rate.HourlyRate, &rate.DiscountTable, &rate.PerSession)
	return rate, err
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

func (db *Database) AddEvents(ctx context.Context, event rest.AdminAddEventsRequestObject) error {
	return pgx.BeginFunc(ctx, db.pool, func(tx pgx.Tx) error {
		_, err := tx.Exec(ctx, "lock table booking_events in share row exclusive mode")
		if err != nil {
			return errors.Join(err, errors.New("failed to lock table"))
		}

		for _, instance := range event.Body.Event.Instances {
			evt := &rest.NewEvent{
				Contact: struct {
					EmailAddress openapi_types.Email `json:"email_address"`
					Name         string              `json:"name"`
				}{
					EmailAddress: event.Body.Contact.EmailAddress,
					Name:         event.Body.Contact.Name,
				},
				Event: struct {
					Details         string `json:"details"`
					From            string `json:"from"`
					Name            string `json:"name"`
					PubliclyVisible bool   `json:"publicly_visible"`
					To              string `json:"to"`
				}{
					Name:            event.Body.Event.Name,
					Details:         event.Body.Event.Details,
					From:            instance.From,
					To:              instance.To,
					PubliclyVisible: event.Body.Event.PubliclyVisible,
				},
			}

			err = db.ensureContactExists(ctx, string(event.Body.Contact.EmailAddress), event.Body.Contact.Name)
			if err != nil {
				rberr := tx.Rollback(ctx)
				if rberr != nil {
					err = errors.Join(err, rberr)
				}

				return err
			}

			err = db.checkForNearbyBookings(ctx, tx, instance.From, instance.To)
			if err != nil {
				return err
			}

			err = db.insertEvent(ctx, tx, evt, event.Body.Event.Status, event.Body.Event.Rate)
			if err != nil {
				return err
			}
		}

		return nil
	})
}

func (db *Database) AddEventGroup(ctx context.Context, request rest.AdminAddEventGroupRequestObject) error {
	group := request.Body
	if err := db.ensureContactExists(ctx, string(group.Contact.EmailAddress), group.Contact.Name); err != nil {
		return err
	}

	return pgx.BeginFunc(ctx, db.pool, func(tx pgx.Tx) error {
		groupID := uuid.New().String()
		if _, err := tx.Exec(ctx, `insert into booking_event_groups
			(id, event_name, details, visible, email, rate)
			values ($1, $2, $3, $4, $5, $6)`, groupID, group.Name, group.Details,
			group.PubliclyVisible, group.Contact.EmailAddress, group.Rate); err != nil {
			return errors.Join(err, errors.New("failed to insert event group"))
		}

		_, err := tx.Exec(ctx, "lock table booking_events in share row exclusive mode")
		if err != nil {
			return errors.Join(err, errors.New("failed to lock table"))
		}

		for _, instance := range group.Instances {
			if err := db.checkForNearbyBookings(ctx, tx, instance.From, instance.To); err != nil {
				return err
			}
			if _, err := tx.Exec(ctx, `insert into booking_events
				(id, event_start, event_end, event_name, visible, email, status, rate_id, details, event_group_id, keyholder_in, keyholder_out)
				values ($1, $2, $3, $4, $5, $6, 'approved', $7, $8, $9, $10, $10)`, uuid.New(), instance.From, instance.To,
				group.Name, group.PubliclyVisible, group.Contact.EmailAddress, group.Rate, group.Details, groupID, group.Keyholder); err != nil {
				return errors.Join(err, errors.New("failed to insert event group instance"))
			}
		}

		return nil
	})
}
