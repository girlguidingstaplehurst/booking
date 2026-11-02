package postgres

import (
	"context"
	"os"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

func TestEventNotePersistenceAndOrdering(t *testing.T) {
	databaseURL := os.Getenv("BOOKING_TEST_DATABASE_URL")
	if databaseURL == "" {
		t.Skip("BOOKING_TEST_DATABASE_URL is required for PostgreSQL event note integration tests")
	}

	ctx := context.Background()
	pool, err := pgxpool.New(ctx, databaseURL)
	if err != nil {
		t.Fatalf("connect to test database: %v", err)
	}
	t.Cleanup(pool.Close)
	db := NewDatabase(pool)

	eventID := uuid.NewString()
	contactEmail := "event-note-" + eventID + "@example.org"
	if _, err := pool.Exec(ctx, `insert into booking_contacts (email, name) values ($1, $2)`, contactEmail, "Notes Integration Contact"); err != nil {
		t.Fatalf("insert test contact: %v", err)
	}
	if _, err := pool.Exec(ctx, `insert into booking_events (id, event_start, event_end, event_name, visible, email, status, rate_id, details)
		values ($1, $2, $3, $4, true, $5, 'approved', 'default', '')`, eventID, time.Now().Add(time.Hour), time.Now().Add(2*time.Hour), "Notes Integration Event", contactEmail); err != nil {
		_, _ = pool.Exec(ctx, `delete from booking_contacts where email = $1`, contactEmail)
		t.Fatalf("insert test event: %v", err)
	}
	t.Cleanup(func() {
		_, _ = pool.Exec(ctx, `delete from booking_event_notes where event_id = $1`, eventID)
		_, _ = pool.Exec(ctx, `delete from booking_events where id = $1`, eventID)
		_, _ = pool.Exec(ctx, `delete from booking_contacts where email = $1`, contactEmail)
	})

	first, err := db.AddEventNote(ctx, eventID, "First note", "first-admin@example.org")
	if err != nil {
		t.Fatalf("add first note: %v", err)
	}
	time.Sleep(2 * time.Millisecond)
	second, err := db.AddEventNote(ctx, eventID, "Second note", "second-admin@example.org")
	if err != nil {
		t.Fatalf("add second note: %v", err)
	}

	event, err := db.GetEvent(ctx, eventID)
	if err != nil {
		t.Fatalf("get event with notes: %v", err)
	}
	if event.Notes == nil || len(*event.Notes) != 2 {
		t.Fatalf("event notes = %v, want two persisted notes", event.Notes)
	}
	if got := (*event.Notes)[0].Id; got != second.Id {
		t.Fatalf("newest note id = %q, want %q", got, second.Id)
	}
	if got := (*event.Notes)[1].Id; got != first.Id {
		t.Fatalf("oldest note id = %q, want %q", got, first.Id)
	}
	if (*event.Notes)[0].Content != "Second note" || (*event.Notes)[1].Content != "First note" {
		t.Fatalf("event notes are not returned newest first: %+v", *event.Notes)
	}
	if (*event.Notes)[0].AuthorEmail != "second-admin@example.org" || (*event.Notes)[0].CreatedAt == "" {
		t.Fatalf("note metadata was not persisted: %+v", (*event.Notes)[0])
	}
}
