package content

import (
	"strings"
	"testing"

	"github.com/girlguidingstaplehurst/booking/internal/rest"
	"github.com/stretchr/testify/require"
)

func TestApplyTemplate(t *testing.T) {
	m := &Manager{}
	got, err := m.applyTemplate("Dear {{.event.Contact}}, {{.event.Name}} on {{.date}}.", map[string]any{
		"event": rest.Event{Contact: "Booker", Name: "Test event"},
		"date":  "Thu Sep 24 2026",
	})

	require.NoError(t, err)
	require.Equal(t, "Dear Booker, Test event on Thu Sep 24 2026.", got)
	require.NotContains(t, got, "{{")
	require.True(t, strings.Contains(got, "Test event"))
}
