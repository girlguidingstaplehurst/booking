package test

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"testing"
	"time"

	"github.com/stretchr/testify/require"
)

func TestIntegration_RateDefinitions(t *testing.T) {
	token := os.Getenv("BOOKING_ADMIN_TOKEN")
	if token == "" {
		t.Skip("BOOKING_ADMIN_TOKEN is required for authenticated rate integration tests")
	}

	client, err := NewClientWithResponses("http://localhost:8080")
	require.NoError(t, err)
	auth := func(_ context.Context, request *http.Request) error {
		request.Header.Set("Authorization", "Bearer "+token)
		return nil
	}

	id := fmt.Sprintf("integration-rate-%d", time.Now().UnixNano())
	created, err := client.AdminCreateRateWithResponse(context.Background(), AdminCreateRateJSONRequestBody{
		Id:          id,
		Description: "Integration test rate",
		HourlyRate:  25,
		PerSession:  PerSessionPricing{{Count: intPointer(10), Price: 150}, {Price: 13.5}},
	}, auth)
	require.NoError(t, err)
	require.Equal(t, http.StatusOK, created.StatusCode(), string(created.Body))
	require.NotNil(t, created.JSON200)
	require.Equal(t, id, created.JSON200.Id)

	listed, err := client.AdminGetRatesWithResponse(context.Background(), auth)
	require.NoError(t, err)
	require.Equal(t, http.StatusOK, listed.StatusCode(), string(listed.Body))
	asserted := false
	for _, rate := range *listed.JSON200 {
		if rate.Id == id {
			asserted = true
			require.Len(t, rate.PerSession, 2)
		}
	}
	require.True(t, asserted, "created rate was not returned by list endpoint")

	updated, err := client.AdminUpdateRateWithResponse(context.Background(), id, AdminUpdateRateJSONRequestBody{
		Description: "Updated integration test rate",
		HourlyRate:  30,
		PerSession:  PerSessionPricing{},
	}, auth)
	require.NoError(t, err)
	require.Equal(t, http.StatusOK, updated.StatusCode(), string(updated.Body))
	require.Equal(t, id, updated.JSON200.Id)
	require.Equal(t, "Updated integration test rate", updated.JSON200.Description)
	require.Empty(t, updated.JSON200.PerSession)
}

func intPointer(value int) *int {
	return &value
}
