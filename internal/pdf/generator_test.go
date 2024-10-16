package pdf

import (
	"context"
	"testing"
	"time"

	"github.com/girlguidingstaplehurst/booking/internal/consts"
	"github.com/girlguidingstaplehurst/booking/internal/rest"
	"github.com/shopspring/decimal"
	"github.com/stretchr/testify/require"
	"github.com/thanhpk/randstr"
)

func TestGenerator_GenerateInvoice(t *testing.T) {
	g := Generator{}
	_, err := g.GenerateInvoice(context.Background(), &rest.Invoice{
		Reference: randstr.String(6, consts.ReferenceLetters),
		Sent:      time.Now(),
		Items: []*rest.DBInvoiceItem{
			{Description: "Now that's what I call a fake event - 5.0 Hours ", Cost: decimal.RequireFromString("125.00")},
			{Description: "Discount", Cost: decimal.RequireFromString("-25.00")},
			{Description: "Refundable Deposit", Cost: decimal.RequireFromString("100.00")},
		},
	})
	require.NoError(t, err)
}
