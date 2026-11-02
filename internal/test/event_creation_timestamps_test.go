package test

import (
	"context"
	"net/http"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/girlguidingstaplehurst/booking/internal/postgres"
	"github.com/girlguidingstaplehurst/booking/internal/rest"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	openapi_types "github.com/oapi-codegen/runtime/types"
	"github.com/stretchr/testify/require"
)

func TestIntegration_EventCreationTimestampMigrationPreservesUnknownHistory(t *testing.T) {
	ctx := context.Background()
	db, err := pgx.Connect(ctx, "postgresql://postgres:password@localhost:5432/postgres?sslmode=disable")
	require.NoError(t, err)
	t.Cleanup(func() { _ = db.Close(ctx) })

	tx, err := db.Begin(ctx)
	require.NoError(t, err)
	t.Cleanup(func() { _ = tx.Rollback(ctx) })

	_, err = tx.Exec(ctx, `create temporary table booking_events (id text primary key)`)
	require.NoError(t, err)
	_, err = tx.Exec(ctx, `create temporary table booking_event_groups (id text primary key)`)
	require.NoError(t, err)
	_, err = tx.Exec(ctx, `insert into booking_events (id) values ('legacy-event')`)
	require.NoError(t, err)
	_, err = tx.Exec(ctx, `insert into booking_event_groups (id) values ('legacy-group')`)
	require.NoError(t, err)

	migration, err := os.ReadFile("../../db/migrations/000018_add_event_creation_timestamps.up.sql")
	require.NoError(t, err)
	for _, statement := range strings.Split(string(migration), ";") {
		statement = strings.TrimSpace(statement)
		if statement == "" {
			continue
		}
		_, err = tx.Exec(ctx, statement)
		require.NoError(t, err)
	}

	var eventIsUnknown, groupIsUnknown bool
	require.NoError(t, tx.QueryRow(ctx, `select created_at is null from booking_events where id = 'legacy-event'`).Scan(&eventIsUnknown))
	require.NoError(t, tx.QueryRow(ctx, `select created_at is null from booking_event_groups where id = 'legacy-group'`).Scan(&groupIsUnknown))
	require.True(t, eventIsUnknown, "legacy event creation time should remain unknown")
	require.True(t, groupIsUnknown, "legacy group creation time should remain unknown")

	_, err = tx.Exec(ctx, `insert into booking_events (id) values ('new-event')`)
	require.NoError(t, err)
	_, err = tx.Exec(ctx, `insert into booking_event_groups (id) values ('new-group')`)
	require.NoError(t, err)
	var eventHasTimestamp, groupHasTimestamp bool
	require.NoError(t, tx.QueryRow(ctx, `select created_at is not null from booking_events where id = 'new-event'`).Scan(&eventHasTimestamp))
	require.NoError(t, tx.QueryRow(ctx, `select created_at is not null from booking_event_groups where id = 'new-group'`).Scan(&groupHasTimestamp))
	require.True(t, eventHasTimestamp, "new event should receive the database default")
	require.True(t, groupHasTimestamp, "new group should receive the database default")
}

func TestIntegration_AdminEventCreationRecordsTimestampForEachInstance(t *testing.T) {
	token := os.Getenv("BOOKING_ADMIN_TOKEN")
	if token == "" {
		t.Skip("BOOKING_ADMIN_TOKEN is required for authenticated admin event tests")
	}

	ctx := context.Background()
	start := time.Now().AddDate(0, 6, 0).Truncate(time.Second)
	name := "Timestamped Admin Event " + start.Format("20060102150405.000000000")
	body := AdminNewEvents{}
	body.Event.Name = name
	body.Event.Details = "Admin event creation timestamp test"
	body.Event.Status = "approved"
	body.Event.Rate = "default"
	body.Event.PubliclyVisible = true
	body.Event.Instances = []EventInstance{
		{From: start.Format(time.RFC3339), To: start.Add(time.Hour).Format(time.RFC3339)},
		{From: start.Add(3 * time.Hour).Format(time.RFC3339), To: start.Add(4 * time.Hour).Format(time.RFC3339)},
	}
	body.Contact.EmailAddress = email
	body.Contact.Name = contactName

	client, err := NewClientWithResponses("http://localhost:8080")
	require.NoError(t, err)
	auth := func(_ context.Context, request *http.Request) error {
		request.Header.Set("Authorization", "Bearer "+token)
		return nil
	}
	response, err := client.AdminAddEventsWithResponse(ctx, body, auth)
	require.NoError(t, err)
	require.Equal(t, http.StatusOK, response.StatusCode(), string(response.Body))

	db, err := pgx.Connect(ctx, "postgresql://postgres:password@localhost:5432/postgres?sslmode=disable")
	require.NoError(t, err)
	t.Cleanup(func() { _ = db.Close(ctx) })
	var timestampedInstances int
	require.NoError(t, db.QueryRow(ctx, `select count(*) from booking_events where event_name = $1 and created_at is not null`, name).Scan(&timestampedInstances))
	require.Equal(t, 2, timestampedInstances, "every admin-created instance should receive a creation timestamp")

	adminEvents, err := client.GetApiV1AdminEventsWithResponse(ctx, nil, auth)
	require.NoError(t, err)
	require.Equal(t, http.StatusOK, adminEvents.StatusCode(), string(adminEvents.Body))
	require.NotNil(t, adminEvents.JSON200)
	var listedEvent *Event
	for index := range adminEvents.JSON200.Events {
		if adminEvents.JSON200.Events[index].Name == name {
			listedEvent = &adminEvents.JSON200.Events[index]
			break
		}
	}
	require.NotNil(t, listedEvent, "created event should appear in authenticated admin data")
	require.NotNil(t, listedEvent.CreatedAt, "admin event data should include the creation time")
	_, err = time.Parse(time.RFC3339Nano, *listedEvent.CreatedAt)
	require.NoError(t, err)

	details, err := client.GetApiV1AdminEventsEventIDWithResponse(ctx, listedEvent.Id, auth)
	require.NoError(t, err)
	require.Equal(t, http.StatusOK, details.StatusCode(), string(details.Body))
	require.NotNil(t, details.JSON200)
	require.NotNil(t, details.JSON200.CreatedAt, "event review detail should include the creation time")
	require.Equal(t, *listedEvent.CreatedAt, *details.JSON200.CreatedAt)

	invoiceable, err := client.AdminListInvoiceableEventsWithResponse(ctx, &AdminListInvoiceableEventsParams{Contact: openapi_types.Email(email)}, auth)
	require.NoError(t, err)
	require.Equal(t, http.StatusOK, invoiceable.StatusCode(), string(invoiceable.Body))
	require.NotNil(t, invoiceable.JSON200)
	var invoiceableEvent *Event
	for index := range invoiceable.JSON200.Events {
		if invoiceable.JSON200.Events[index].Name == name {
			invoiceableEvent = &invoiceable.JSON200.Events[index]
			break
		}
	}
	require.NotNil(t, invoiceableEvent, "approved ungrouped event should be listed as invoiceable")
	require.NotNil(t, invoiceableEvent.CreatedAt, "invoiceable event data should include the creation time")
	require.Equal(t, *listedEvent.CreatedAt, *invoiceableEvent.CreatedAt)

	_, err = db.Exec(ctx, `update booking_events set created_at = null where event_name = $1`, name)
	require.NoError(t, err)
	adminEvents, err = client.GetApiV1AdminEventsWithResponse(ctx, nil, auth)
	require.NoError(t, err)
	require.Equal(t, http.StatusOK, adminEvents.StatusCode(), string(adminEvents.Body))
	listedEvent = nil
	for index := range adminEvents.JSON200.Events {
		if adminEvents.JSON200.Events[index].Name == name {
			listedEvent = &adminEvents.JSON200.Events[index]
			break
		}
	}
	require.NotNil(t, listedEvent)
	require.Nil(t, listedEvent.CreatedAt, "unknown historical creation time should serialize as null")

	details, err = client.GetApiV1AdminEventsEventIDWithResponse(ctx, listedEvent.Id, auth)
	require.NoError(t, err)
	require.Equal(t, http.StatusOK, details.StatusCode(), string(details.Body))
	require.NotNil(t, details.JSON200)
	require.Nil(t, details.JSON200.CreatedAt, "unknown detail creation time should serialize as null")

	invoiceable, err = client.AdminListInvoiceableEventsWithResponse(ctx, &AdminListInvoiceableEventsParams{Contact: openapi_types.Email(email)}, auth)
	require.NoError(t, err)
	require.Equal(t, http.StatusOK, invoiceable.StatusCode(), string(invoiceable.Body))
	for index := range invoiceable.JSON200.Events {
		if invoiceable.JSON200.Events[index].Name == name {
			require.Nil(t, invoiceable.JSON200.Events[index].CreatedAt, "unknown invoiceable event creation time should serialize as null")
		}
	}
}

func TestIntegration_AdminQueriesMapKnownAndUnknownCreationTimestamps(t *testing.T) {
	ctx := context.Background()
	pool, err := pgxpool.New(ctx, "postgresql://postgres:password@localhost:5432/postgres?sslmode=disable")
	require.NoError(t, err)
	t.Cleanup(pool.Close)
	db := postgres.NewDatabase(pool)

	contactEmail := "creation-timestamps-" + uuid.NewString() + "@example.org"
	eventID := uuid.NewString()
	groupID := uuid.NewString()
	sessionID := uuid.NewString()
	eventName := "Timestamped standalone " + uuid.NewString()
	groupName := "Timestamped group " + uuid.NewString()
	start := time.Now().AddDate(0, 2, 0).Truncate(time.Second)
	t.Cleanup(func() {
		_, _ = pool.Exec(ctx, `delete from booking_events where id = $1 or id = $2`, eventID, sessionID)
		_, _ = pool.Exec(ctx, `delete from booking_event_groups where id = $1`, groupID)
		_, _ = pool.Exec(ctx, `delete from booking_contacts where email = $1`, contactEmail)
	})

	_, err = pool.Exec(ctx, `insert into booking_contacts (email, name) values ($1, $2)`, contactEmail, "Timestamp Test Contact")
	require.NoError(t, err)
	_, err = pool.Exec(ctx, `insert into booking_event_groups (id, event_name, details, visible, email, rate)
		values ($1, $2, $3, true, $4, 'default')`, groupID, groupName, "Group details", contactEmail)
	require.NoError(t, err)
	_, err = pool.Exec(ctx, `insert into booking_events
		(id, event_start, event_end, event_name, visible, email, status, rate_id, details)
		values ($1, $2, $3, $4, true, $5, 'approved', 'default', 'Event details')`, eventID, start, start.Add(time.Hour), eventName, contactEmail)
	require.NoError(t, err)
	_, err = pool.Exec(ctx, `insert into booking_events
		(id, event_start, event_end, event_name, visible, email, status, rate_id, details, event_group_id)
		values ($1, $2, $3, $4, true, $5, 'approved', 'default', 'Group details', $6)`, sessionID, start.Add(3*time.Hour), start.Add(4*time.Hour), groupName, contactEmail, groupID)
	require.NoError(t, err)

	checkRows := func(wantKnown bool) {
		t.Helper()
		adminList, err := db.AdminListEvents(ctx, start.Add(-time.Hour), start.Add(24*time.Hour))
		require.NoError(t, err)
		var listedEvent *rest.Event
		for index := range adminList.Events {
			if adminList.Events[index].Id == eventID {
				listedEvent = &adminList.Events[index]
				break
			}
		}
		require.NotNil(t, listedEvent)
		var listedGroup *rest.AdminEventGroup
		for index := range adminList.EventGroups {
			if adminList.EventGroups[index].Id == groupID {
				listedGroup = &adminList.EventGroups[index]
				break
			}
		}
		require.NotNil(t, listedGroup)
		if wantKnown {
			require.NotNil(t, listedEvent.CreatedAt)
			require.NotNil(t, listedGroup.CreatedAt)
		} else {
			require.Nil(t, listedEvent.CreatedAt)
			require.Nil(t, listedGroup.CreatedAt)
		}

		details, err := db.GetEvent(ctx, eventID)
		require.NoError(t, err)
		invoiceable, err := db.GetInvoiceableEventsForContact(ctx, contactEmail)
		require.NoError(t, err)
		require.Len(t, invoiceable.Events, 1)
		if wantKnown {
			require.NotNil(t, details.CreatedAt)
			require.NotNil(t, invoiceable.Events[0].CreatedAt)
		} else {
			require.Nil(t, details.CreatedAt)
			require.Nil(t, invoiceable.Events[0].CreatedAt)
		}

		searchResults, err := db.SearchEventGroups(ctx, groupName)
		require.NoError(t, err)
		require.Len(t, searchResults, 1)
		if wantKnown {
			require.NotNil(t, searchResults[0].CreatedAt)
		} else {
			require.Nil(t, searchResults[0].CreatedAt)
		}
	}

	checkRows(true)
	_, err = pool.Exec(ctx, `update booking_events set created_at = null where id in ($1, $2)`, eventID, sessionID)
	require.NoError(t, err)
	_, err = pool.Exec(ctx, `update booking_event_groups set created_at = null where id = $1`, groupID)
	require.NoError(t, err)
	checkRows(false)
}
