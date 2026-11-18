package postgres

import (
	"context"
	"errors"
	"os"
	"testing"
	"time"

	"github.com/girlguidingstaplehurst/booking/internal/consts"
	"github.com/girlguidingstaplehurst/booking/internal/rest"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	openapi_types "github.com/oapi-codegen/runtime/types"
)

func TestAddZeroCostInvoicePersistsPaidInvoiceAtomically(t *testing.T) {
	databaseURL := os.Getenv("BOOKING_TEST_DATABASE_URL")
	if databaseURL == "" {
		t.Skip("BOOKING_TEST_DATABASE_URL is required for PostgreSQL invoice integration tests")
	}

	ctx := context.Background()
	pool, err := pgxpool.New(ctx, databaseURL)
	if err != nil {
		t.Fatalf("connect to test database: %v", err)
	}
	t.Cleanup(pool.Close)
	db := NewDatabase(pool)

	laterEventID := uuid.NewString()
	earlierEventID := uuid.NewString()
	contact := "zero-invoice-" + laterEventID + "@example.org"
	if _, err := pool.Exec(ctx, `insert into booking_contacts (email, name) values ($1, $2)`, contact, "Zero Invoice Contact"); err != nil {
		t.Fatalf("insert test contact: %v", err)
	}
	t.Cleanup(func() {
		_, _ = pool.Exec(ctx, `delete from booking_invoices where contact = $1`, contact)
		_, _ = pool.Exec(ctx, `delete from booking_events where id in ($1, $2)`, laterEventID, earlierEventID)
		_, _ = pool.Exec(ctx, `delete from booking_contacts where email = $1`, contact)
	})

	now := time.Now()
	for _, event := range []struct {
		id   string
		name string
		from time.Time
	}{
		{id: laterEventID, name: "Later Free Event", from: now.Add(2 * time.Hour)},
		{id: earlierEventID, name: "Earlier Free Event", from: now.Add(time.Hour)},
	} {
		if _, err := pool.Exec(ctx, `insert into booking_events (id, event_start, event_end, event_name, visible, email, status, rate_id, details)
			values ($1, $2, $3, $4, true, $5, 'approved', 'default', '')`, event.id, event.from, event.from.Add(time.Hour), event.name, contact); err != nil {
			t.Fatalf("insert test event: %v", err)
		}
	}
	events := []string{laterEventID, earlierEventID}
	validInvoice := &rest.SendInvoiceBody{
		Contact: openapi_types.Email(contact),
		Events:  &events,
		Items:   []rest.SendInvoiceBodyItem{{Description: "Free event hire", Cost: 0}},
	}
	if err := db.AddZeroCostInvoice(ctx, validInvoice); err != nil {
		t.Fatalf("AddZeroCostInvoice() error = %v", err)
	}

	var invoiceID string
	if err := pool.QueryRow(ctx, `select bi.id from booking_invoices bi
		join booking_invoice_events bie on bie.invoice_id = bi.id where bie.event_id = $1`, laterEventID).Scan(&invoiceID); err != nil {
		t.Fatalf("find created invoice: %v", err)
	}
	invoice, err := db.GetInvoiceByID(ctx, invoiceID)
	if err != nil {
		t.Fatalf("GetInvoiceByID() error = %v", err)
	}
	if invoice.Status != "paid" || invoice.Paid == nil || invoice.Sent != nil {
		t.Fatalf("invoice payment fields = status %q, paid %v, sent %v; want paid, timestamp, and no sent timestamp", invoice.Status, invoice.Paid, invoice.Sent)
	}
	if invoice.Events == nil || len(*invoice.Events) != 2 || (*invoice.Events)[0].Id != earlierEventID || (*invoice.Events)[1].Id != laterEventID {
		t.Fatalf("invoice events = %v, want events ordered by start time: %q, %q", invoice.Events, earlierEventID, laterEventID)
	}
	if len(invoice.Items) != 1 || invoice.Items[0].Description != "Free event hire" || invoice.Items[0].Cost != 0 {
		t.Fatalf("invoice items = %+v, want the submitted zero-cost line", invoice.Items)
	}

	var invoiceCountBefore int
	if err := pool.QueryRow(ctx, `select count(*) from booking_invoices where contact = $1`, contact).Scan(&invoiceCountBefore); err != nil {
		t.Fatalf("count invoices before invalid requests: %v", err)
	}
	groupID := "group-1"
	invalidRequests := []struct {
		name    string
		invoice *rest.SendInvoiceBody
	}{
		{
			name: "nonzero total",
			invoice: &rest.SendInvoiceBody{
				Contact: openapi_types.Email(contact),
				Events:  &events,
				Items:   []rest.SendInvoiceBodyItem{{Description: "Charge", Cost: 0.01}},
			},
		},
		{
			name: "event-group invoice",
			invoice: &rest.SendInvoiceBody{
				Contact:    openapi_types.Email(contact),
				Events:     &events,
				EventGroup: &groupID,
			},
		},
		{
			name: "missing event associations",
			invoice: &rest.SendInvoiceBody{
				Contact: openapi_types.Email(contact),
			},
		},
	}
	for _, test := range invalidRequests {
		t.Run(test.name, func(t *testing.T) {
			if err := db.AddZeroCostInvoice(ctx, test.invoice); !errors.Is(err, consts.ErrInvalidZeroCostInvoice) {
				t.Fatalf("AddZeroCostInvoice() error = %v, want invalid zero-cost invoice", err)
			}
		})
	}
	var invoiceCountAfter int
	if err := pool.QueryRow(ctx, `select count(*) from booking_invoices where contact = $1`, contact).Scan(&invoiceCountAfter); err != nil {
		t.Fatalf("count invoices after invalid requests: %v", err)
	}
	if invoiceCountAfter != invoiceCountBefore {
		t.Fatalf("invalid requests created invoices: count before %d, after %d", invoiceCountBefore, invoiceCountAfter)
	}
}
