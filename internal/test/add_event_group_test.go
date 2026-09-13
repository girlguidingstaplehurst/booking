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
		select event_group_id, keyholder_in_id, keyholder_out_id
		from booking_events
		where event_name = $1
		order by event_start`, groupName)
	require.NoError(t, err)
	t.Cleanup(rows.Close)

	var persisted int
	for rows.Next() {
		var groupID *string
		var keyholderIn, keyholderOut uuid.UUID
		require.NoError(t, rows.Scan(&groupID, &keyholderIn, &keyholderOut))
		require.NotNil(t, groupID)
		require.Equal(t, keyholderID, keyholderIn)
		require.Equal(t, keyholderID, keyholderOut)
		persisted++
	}
	require.NoError(t, rows.Err())
	require.Equal(t, 2, persisted)
}
