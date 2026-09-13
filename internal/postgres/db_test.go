package postgres

import (
	"errors"
	"testing"

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
