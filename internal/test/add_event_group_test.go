package test

import (
	"context"
	"net/http"
	"os"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	openapi_types "github.com/oapi-codegen/runtime/types"
	"github.com/stretchr/testify/require"
)

func TestIntegration_CreateEventGroupPersistsInstances(t *testing.T) {
	token := os.Getenv("BOOKING_ADMIN_TOKEN")
	if token == "" {
		t.Skip("BOOKING_ADMIN_TOKEN is required for authenticated event-group integration tests")
	}

	ctx := context.Background()
	require.NoError(t, TruncateTables("booking_event_groups", "booking_keyholders"))

	keyholderID := uuid.New()
	db, err := pgx.Connect(ctx, "postgresql://postgres:password@localhost:5432/postgres?sslmode=disable")
	require.NoError(t, err)
	t.Cleanup(func() { _ = db.Close(ctx) })
	_, err = db.Exec(ctx, `insert into booking_keyholders (id, name, key_number) values ($1, $2, $3)`,
		keyholderID, "Integration Keyholder", 900001)
	require.NoError(t, err)

	start := time.Now().AddDate(0, 2, 0).Truncate(time.Second)
	groupName := "Integration Event Group " + uuid.NewString()
	body := AdminNewEventGroup{
		Details:         "Integration event group details",
		Keyholder:       openapi_types.UUID(keyholderID),
		Name:            groupName,
		PubliclyVisible: true,
		Rate:            "default",
		Instances: []EventInstance{
			{From: start.Format(time.RFC3339), To: start.Add(time.Hour).Format(time.RFC3339)},
			{From: start.Add(3 * time.Hour).Format(time.RFC3339), To: start.Add(4 * time.Hour).Format(time.RFC3339)},
		},
	}
	body.Contact.EmailAddress = email
	body.Contact.Name = contactName

	client, err := NewClientWithResponses("http://localhost:8080")
	require.NoError(t, err)
	auth := func(_ context.Context, request *http.Request) error {
		request.Header.Set("Authorization", "Bearer "+token)
		return nil
	}
	response, err := client.AdminAddEventGroupWithResponse(ctx, body, auth)
	require.NoError(t, err)
	require.Equal(t, http.StatusOK, response.StatusCode(), string(response.Body))

	rows, err := db.Query(ctx, `
		select e.event_group_id, e.keyholder_in_id, e.keyholder_out_id,
		       e.created_at is not null, g.created_at is not null, e.created_at = g.created_at
		from booking_events e
		join booking_event_groups g on g.id = e.event_group_id
		where e.event_name = $1
		order by e.event_start`, groupName)
	require.NoError(t, err)
	t.Cleanup(rows.Close)

	var persisted int
	for rows.Next() {
		var groupID *string
		var keyholderIn, keyholderOut uuid.UUID
		var eventHasTimestamp, groupHasTimestamp, timestampsMatch bool
		require.NoError(t, rows.Scan(&groupID, &keyholderIn, &keyholderOut, &eventHasTimestamp, &groupHasTimestamp, &timestampsMatch))
		require.NotNil(t, groupID)
		require.Equal(t, keyholderID, keyholderIn)
		require.Equal(t, keyholderID, keyholderOut)
		require.True(t, eventHasTimestamp)
		require.True(t, groupHasTimestamp)
		require.True(t, timestampsMatch, "group and session creation times should share the transaction timestamp")
		persisted++
	}
	require.NoError(t, rows.Err())
	require.Equal(t, 2, persisted)

	adminEvents, err := client.GetApiV1AdminEventsWithResponse(ctx, nil, auth)
	require.NoError(t, err)
	require.Equal(t, http.StatusOK, adminEvents.StatusCode(), string(adminEvents.Body))
	require.NotNil(t, adminEvents.JSON200)
	var listedGroup *AdminEventGroup
	for index := range adminEvents.JSON200.EventGroups {
		if adminEvents.JSON200.EventGroups[index].Name == body.Name {
			listedGroup = &adminEvents.JSON200.EventGroups[index]
			break
		}
	}
	require.NotNil(t, listedGroup, "created group should appear in authenticated admin data")
	require.NotNil(t, listedGroup.CreatedAt, "admin group data should include the creation time")
	_, err = time.Parse(time.RFC3339Nano, *listedGroup.CreatedAt)
	require.NoError(t, err)

	var groupID string
	require.NoError(t, db.QueryRow(ctx, `select id from booking_event_groups where event_name = $1`, body.Name).Scan(&groupID))
	_, err = db.Exec(ctx, `update booking_event_groups set created_at = null where id = $1`, groupID)
	require.NoError(t, err)
	adminEvents, err = client.GetApiV1AdminEventsWithResponse(ctx, nil, auth)
	require.NoError(t, err)
	require.Equal(t, http.StatusOK, adminEvents.StatusCode(), string(adminEvents.Body))
	listedGroup = nil
	for index := range adminEvents.JSON200.EventGroups {
		if adminEvents.JSON200.EventGroups[index].Name == body.Name {
			listedGroup = &adminEvents.JSON200.EventGroups[index]
			break
		}
	}
	require.NotNil(t, listedGroup)
	require.Nil(t, listedGroup.CreatedAt, "unknown historical group creation time should serialize as null")
}

func TestIntegration_CreateEventGroupAllowsNonOverlappingNearbyInstance(t *testing.T) {
	token := os.Getenv("BOOKING_ADMIN_TOKEN")
	if token == "" {
		t.Skip("BOOKING_ADMIN_TOKEN is required for authenticated event-group integration tests")
	}

	ctx := context.Background()
	require.NoError(t, TruncateTables("booking_event_groups", "booking_events", "booking_keyholders"))
	db, err := pgx.Connect(ctx, "postgresql://postgres:password@localhost:5432/postgres?sslmode=disable")
	require.NoError(t, err)
	t.Cleanup(func() { _ = db.Close(ctx) })

	keyholderID := uuid.New()
	_, err = db.Exec(ctx, `insert into booking_keyholders (id, name, key_number) values ($1, $2, $3)`, keyholderID, "Nearby Group Keyholder", 900003)
	require.NoError(t, err)

	start := time.Now().AddDate(0, 4, 0).Truncate(time.Second)
	_, err = db.Exec(ctx, `insert into booking_events (id, event_start, event_end, event_name, visible, email, status, rate_id, details) values ($1, $2, $3, $4, true, $5, 'approved', 'default', '')`, uuid.New(), start, start.Add(time.Hour), "Existing Nearby Event", email)
	require.NoError(t, err)

	groupName := "Nearby Event Group " + uuid.NewString()
	body := AdminNewEventGroup{
		Details:         "Nearby group details",
		Keyholder:       openapi_types.UUID(keyholderID),
		Name:            groupName,
		PubliclyVisible: true,
		Rate:            "default",
		Instances:       []EventInstance{{From: start.Add(65 * time.Minute).Format(time.RFC3339), To: start.Add(125 * time.Minute).Format(time.RFC3339)}},
	}
	body.Contact.EmailAddress = email
	body.Contact.Name = contactName

	client, err := NewClientWithResponses("http://localhost:8080")
	require.NoError(t, err)
	auth := func(_ context.Context, request *http.Request) error {
		request.Header.Set("Authorization", "Bearer "+token)
		return nil
	}
	response, err := client.AdminAddEventGroupWithResponse(ctx, body, auth)
	require.NoError(t, err)
	require.Equal(t, http.StatusOK, response.StatusCode(), string(response.Body))
}

func TestIntegration_SearchAndDuplicateEventGroup(t *testing.T) {
	token := os.Getenv("BOOKING_ADMIN_TOKEN")
	if token == "" {
		t.Skip("BOOKING_ADMIN_TOKEN is required for authenticated event-group integration tests")
	}

	ctx := context.Background()
	require.NoError(t, TruncateTables("booking_invoices", "booking_event_groups", "booking_keyholders"))
	keyholderID := uuid.New()
	db, err := pgx.Connect(ctx, "postgresql://postgres:password@localhost:5432/postgres?sslmode=disable")
	require.NoError(t, err)
	t.Cleanup(func() { _ = db.Close(ctx) })
	_, err = db.Exec(ctx, `insert into booking_keyholders (id, name, key_number) values ($1, $2, $3)`, keyholderID, "Duplicate Keyholder", 900002)
	require.NoError(t, err)

	start := time.Now().AddDate(0, 3, 0).Truncate(time.Second)
	sourceName := "Searchable Group " + uuid.NewString()
	body := AdminNewEventGroup{
		Details:         "Source details",
		Keyholder:       openapi_types.UUID(keyholderID),
		Name:            sourceName,
		PubliclyVisible: true,
		Rate:            "default",
		Instances:       []EventInstance{{From: start.Format(time.RFC3339), To: start.Add(time.Hour).Format(time.RFC3339)}},
	}
	body.Contact.EmailAddress = email
	body.Contact.Name = contactName
	client, err := NewClientWithResponses("http://localhost:8080")
	require.NoError(t, err)
	auth := func(_ context.Context, request *http.Request) error {
		request.Header.Set("Authorization", "Bearer "+token)
		return nil
	}
	response, err := client.AdminAddEventGroupWithResponse(ctx, body, auth)
	require.NoError(t, err)
	require.Equal(t, http.StatusOK, response.StatusCode(), string(response.Body))

	search, err := client.AdminSearchEventGroupsWithResponse(ctx, &AdminSearchEventGroupsParams{Title: sourceName[len(sourceName)-12:]}, auth)
	require.NoError(t, err)
	require.Equal(t, http.StatusOK, search.StatusCode(), string(search.Body))
	require.NotNil(t, search.JSON200)
	require.Len(t, *search.JSON200, 1)
	require.NotNil(t, (*search.JSON200)[0].CreatedAt, "group search data should include the creation time")
	_, err = time.Parse(time.RFC3339Nano, *(*search.JSON200)[0].CreatedAt)
	require.NoError(t, err)

	duplicate, err := client.AdminDuplicateEventGroupWithResponse(ctx, AdminDuplicateEventGroup{
		EventGroupId: (*search.JSON200)[0].Id,
		Rate:         "default",
		Keyholder:    openapi_types.UUID(keyholderID),
		Instances:    []EventInstance{{From: start.Add(65 * time.Minute).Format(time.RFC3339), To: start.Add(125 * time.Minute).Format(time.RFC3339)}},
	}, auth)
	require.NoError(t, err)
	require.Equal(t, http.StatusOK, duplicate.StatusCode(), string(duplicate.Body))

	var groups int
	require.NoError(t, db.QueryRow(ctx, `select count(*) from booking_event_groups where event_name = $1`, sourceName).Scan(&groups))
	require.Equal(t, 2, groups)
	var sourceCreatedAt, duplicateCreatedAt time.Time
	groupRows, err := db.Query(ctx, `select created_at from booking_event_groups where event_name = $1 order by created_at`, sourceName)
	require.NoError(t, err)
	var groupCreatedAts []time.Time
	for groupRows.Next() {
		var createdAt time.Time
		require.NoError(t, groupRows.Scan(&createdAt))
		groupCreatedAts = append(groupCreatedAts, createdAt)
	}
	require.NoError(t, groupRows.Err())
	groupRows.Close()
	require.Len(t, groupCreatedAts, 2)
	sourceCreatedAt, duplicateCreatedAt = groupCreatedAts[0], groupCreatedAts[1]
	require.True(t, duplicateCreatedAt.After(sourceCreatedAt), "duplicate group should receive a fresh creation timestamp")

	var duplicateSessions int
	require.NoError(t, db.QueryRow(ctx, `
		select count(*) from booking_events e
		join booking_event_groups g on g.id = e.event_group_id
		where g.event_name = $1 and g.created_at = $2 and e.created_at = g.created_at`, sourceName, duplicateCreatedAt).Scan(&duplicateSessions))
	require.Equal(t, 1, duplicateSessions, "duplicated session should receive the duplicate group's fresh timestamp")

	var sourceEvents, duplicateEvents int
	require.NoError(t, db.QueryRow(ctx, `select count(*) from booking_events where event_name = $1`, sourceName).Scan(&sourceEvents))
	require.Equal(t, 2, sourceEvents)
	require.NoError(t, db.QueryRow(ctx, `select count(*) from booking_events e join booking_event_groups g on g.id = e.event_group_id where g.event_name = $1 and g.created_at = $2`, sourceName, duplicateCreatedAt).Scan(&duplicateEvents))
	require.Equal(t, 1, duplicateEvents)
}

func TestIntegration_DuplicateEventGroupRejectsOverlapWithoutPartialDestination(t *testing.T) {
	token := os.Getenv("BOOKING_ADMIN_TOKEN")
	if token == "" {
		t.Skip("BOOKING_ADMIN_TOKEN is required for authenticated event-group integration tests")
	}

	ctx := context.Background()
	require.NoError(t, TruncateTables("booking_invoices", "booking_event_groups", "booking_events", "booking_keyholders"))
	keyholderID := uuid.New()
	db, err := pgx.Connect(ctx, "postgresql://postgres:password@localhost:5432/postgres?sslmode=disable")
	require.NoError(t, err)
	t.Cleanup(func() { _ = db.Close(ctx) })
	_, err = db.Exec(ctx, `insert into booking_keyholders (id, name, key_number) values ($1, $2, $3)`, keyholderID, "Overlap Keyholder", 900004)
	require.NoError(t, err)

	start := time.Now().AddDate(0, 5, 0).Truncate(time.Second)
	groupName := "Overlap Group " + uuid.NewString()
	body := AdminNewEventGroup{
		Details:         "Overlap source details",
		Keyholder:       openapi_types.UUID(keyholderID),
		Name:            groupName,
		PubliclyVisible: true,
		Rate:            "default",
		Instances:       []EventInstance{{From: start.Format(time.RFC3339), To: start.Add(time.Hour).Format(time.RFC3339)}},
	}
	body.Contact.EmailAddress = email
	body.Contact.Name = contactName
	client, err := NewClientWithResponses("http://localhost:8080")
	require.NoError(t, err)
	auth := func(_ context.Context, request *http.Request) error {
		request.Header.Set("Authorization", "Bearer "+token)
		return nil
	}
	response, err := client.AdminAddEventGroupWithResponse(ctx, body, auth)
	require.NoError(t, err)
	require.Equal(t, http.StatusOK, response.StatusCode(), string(response.Body))

	search, err := client.AdminSearchEventGroupsWithResponse(ctx, &AdminSearchEventGroupsParams{Title: groupName[len(groupName)-12:]}, auth)
	require.NoError(t, err)
	require.Equal(t, http.StatusOK, search.StatusCode(), string(search.Body))
	require.NotNil(t, search.JSON200)
	require.Len(t, *search.JSON200, 1)

	duplicate, err := client.AdminDuplicateEventGroupWithResponse(ctx, AdminDuplicateEventGroup{
		EventGroupId: (*search.JSON200)[0].Id,
		Rate:         "default",
		Keyholder:    openapi_types.UUID(keyholderID),
		Instances:    []EventInstance{{From: start.Add(30 * time.Minute).Format(time.RFC3339), To: start.Add(90 * time.Minute).Format(time.RFC3339)}},
	}, auth)
	require.NoError(t, err)
	require.Equal(t, http.StatusConflict, duplicate.StatusCode(), string(duplicate.Body))

	var groups int
	require.NoError(t, db.QueryRow(ctx, `select count(*) from booking_event_groups where event_name = $1`, groupName).Scan(&groups))
	require.Equal(t, 1, groups)
}
