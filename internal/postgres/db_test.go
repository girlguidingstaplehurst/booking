package postgres

import (
	"errors"
	"testing"
	"time"

	"github.com/girlguidingstaplehurst/booking/internal/consts"
	"github.com/girlguidingstaplehurst/booking/internal/rest"
)

func TestParseEventDates(t *testing.T) {
	tests := []struct {
		name  string
		input rest.UpdateEventDatesBody
		valid bool
	}{
		{
			name:  "valid range",
			input: rest.UpdateEventDatesBody{From: "2026-09-13T10:00:00Z", To: "2026-09-13T11:00:00Z"},
			valid: true,
		},
		{
			name:  "end before start",
			input: rest.UpdateEventDatesBody{From: "2026-09-13T11:00:00Z", To: "2026-09-13T10:00:00Z"},
		},
		{
			name:  "invalid timestamp",
			input: rest.UpdateEventDatesBody{From: "not-a-date", To: "2026-09-13T11:00:00Z"},
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			_, _, err := parseEventDates(test.input)
			if test.valid && err != nil {
				t.Fatalf("parseEventDates() error = %v", err)
			}
			if !test.valid && !errors.Is(err, consts.ErrInvalidEventDates) {
				t.Fatalf("parseEventDates() error = %v, want invalid dates", err)
			}
		})
	}
}

func TestNearbyBookingBoundary(t *testing.T) {
	existingStart := time.Date(2026, time.September, 13, 10, 0, 0, 0, time.UTC)
	existingEnd := existingStart.Add(time.Hour)

	tests := []struct {
		name       string
		start, end time.Time
		conflicts  bool
	}{
		{
			name:      "exactly 30 minutes after existing event",
			start:     existingEnd.Add(30 * time.Minute),
			end:       existingEnd.Add(90 * time.Minute),
			conflicts: false,
		},
		{
			name:      "29 minutes after existing event",
			start:     existingEnd.Add(29 * time.Minute),
			end:       existingEnd.Add(89 * time.Minute),
			conflicts: true,
		},
		{
			name:      "overlaps existing event",
			start:     existingEnd.Add(-15 * time.Minute),
			end:       existingEnd.Add(45 * time.Minute),
			conflicts: true,
		},
		{
			name:      "exactly 30 minutes before existing event",
			start:     existingStart.Add(-90 * time.Minute),
			end:       existingStart.Add(-30 * time.Minute),
			conflicts: false,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			conflicts := test.start.Before(existingEnd.Add(30*time.Minute)) &&
				test.end.After(existingStart.Add(-30*time.Minute))
			if conflicts != test.conflicts {
				t.Fatalf("nearby booking conflict = %v, want %v", conflicts, test.conflicts)
			}
		})
	}
}
