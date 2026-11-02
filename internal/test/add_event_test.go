package test

import (
	"context"
	"net/http"
	"testing"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// TestIntegration_CreateEvent requires the Captcha to be disarmed to execute correctly.
func TestIntegration_CreateEvent(t *testing.T) {
	successfulRequest := &AddEventJSONRequestBody{
		Adhesives:         true,
		CaptchaToken:      "disarmed",
		CarParking:        true,
		CleaningAndDamage: true,
		Contact: Contact{
			EmailAddress: email,
			Name:         contactName,
		},
		Event: EventDetails{
			Details:         eventDetails,
			From:            from.Format(time.RFC3339),
			Name:            eventName,
			PubliclyVisible: true,
			To:              to.Format(time.RFC3339),
		},
		PrivacyPolicy: true,
		TermsOfHire:   true,
	}

	require.NoError(t, TruncateTables("booking_events"))

	ctx := context.Background()

	cli, err := NewClientWithResponses("http://localhost:8080")
	require.NoError(t, err)

	tests := []struct {
		name    string
		body    *AddEventJSONRequestBody
		status  int
		errResp *ErrorResponse
	}{
		{
			name:   "validation fails when adhesives policy is not ticked",
			body:   NewNewEventBuilder(successfulRequest).WithAdhesives(false).Build(),
			status: http.StatusUnprocessableEntity,
			errResp: &ErrorResponse{
				ErrorMessage: "adhesives policy was not ticked",
			},
		},
		{
			name:   "validation fails when car parking policy is not ticked",
			body:   NewNewEventBuilder(successfulRequest).WithCarParking(false).Build(),
			status: http.StatusUnprocessableEntity,
			errResp: &ErrorResponse{
				ErrorMessage: "car parking policy was not ticked",
			},
		},
		{
			name:   "validation fails when cleaning and damage policy is not ticked",
			body:   NewNewEventBuilder(successfulRequest).WithCleaningAndDamage(false).Build(),
			status: http.StatusUnprocessableEntity,
			errResp: &ErrorResponse{
				ErrorMessage: "cleaning and damage policy was not ticked",
			},
		},
		{
			name:   "validation fails when privacy policy is not ticked",
			body:   NewNewEventBuilder(successfulRequest).WithPrivacyPolicy(false).Build(),
			status: http.StatusUnprocessableEntity,
			errResp: &ErrorResponse{
				ErrorMessage: "privacy policy was not ticked",
			},
		},
		{
			name:   "validation fails when terms of hire is not ticked",
			body:   NewNewEventBuilder(successfulRequest).WithTermsOfHire(false).Build(),
			status: http.StatusUnprocessableEntity,
			errResp: &ErrorResponse{
				ErrorMessage: "terms of hire was not ticked",
			},
		},
		//TODO event is too early
		//TODO event is same time as an existing event
		{
			name: "can create a publicly visible event",
			body: NewNewEventBuilder(successfulRequest).Build(),
		},
		//TODO private event can be created
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			resp, err := cli.AddEventWithResponse(ctx, *tt.body)
			require.NoError(t, err)

			if tt.status != 0 {
				assert.Equal(t, tt.status, resp.StatusCode())

				switch tt.status {
				case http.StatusConflict:
					assert.Equal(t, tt.errResp, resp.JSON409)
				case http.StatusUnprocessableEntity:
					assert.Equal(t, tt.errResp, resp.JSON422)
				case http.StatusInternalServerError:
					assert.Equal(t, tt.errResp, resp.JSON500)
				}
			} else {
				assert.Equal(t, http.StatusOK, resp.StatusCode(), string(resp.Body))
			}
		})
	}

	db, err := pgx.Connect(ctx, "postgresql://postgres:password@localhost:5432/postgres?sslmode=disable")
	require.NoError(t, err)
	t.Cleanup(func() { _ = db.Close(ctx) })
	var created bool
	require.NoError(t, db.QueryRow(ctx, `select created_at is not null from booking_events where event_name = $1`, eventName).Scan(&created))
	assert.True(t, created, "public booking should receive a database-assigned creation timestamp")

	publicEvents, err := cli.GetApiV1EventsWithResponse(ctx, nil)
	require.NoError(t, err)
	require.Equal(t, http.StatusOK, publicEvents.StatusCode(), string(publicEvents.Body))
	assert.NotContains(t, string(publicEvents.Body), "createdAt", "public booking availability must not expose creation timestamps")
	whatsOn, err := cli.GetWhatsOnWithResponse(ctx, nil)
	require.NoError(t, err)
	require.Equal(t, http.StatusOK, whatsOn.StatusCode(), string(whatsOn.Body))
	assert.NotContains(t, string(whatsOn.Body), "createdAt", "public schedule must not expose creation timestamps")
}
