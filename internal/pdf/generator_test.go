package pdf_test

import (
	"context"
	"testing"

	"github.com/girlguidingstaplehurst/booking/internal/content"
	"github.com/girlguidingstaplehurst/booking/internal/pdf"
	"github.com/stretchr/testify/require"
)

//func TestGenerator_GenerateInvoice(t *testing.T) {
//	g := Generator{}
//	_, err := g.GenerateInvoice(context.Background(), &rest.Invoice{
//		Reference: randstr.String(6, consts.ReferenceLetters),
//		Sent:      time.Now(),
//		Items: []*rest.DBInvoiceItem{
//			{Description: "Now that's what I call a fake event - 5.0 Hours ", Cost: decimal.RequireFromString("125.00")},
//			{Description: "Discount", Cost: decimal.RequireFromString("-25.00")},
//			{Description: "Refundable Deposit", Cost: decimal.RequireFromString("100.00")},
//		},
//	})
//	require.NoError(t, err)
//}

func TestGenerator_GenerateContent(t *testing.T) {
	g := pdf.NewGenerator(content.NewManager("https://graphql.contentful.com/content/v1/spaces/o3u1j7dkyy42", "mnamX4N0qebOgpJN6KJVgakUGcSLFrFEvcHhdtcEO14"))
	_, err := g.GeneratePageContent(context.Background(), "cleaning-and-damage-policy")
	require.NoError(t, err)
}
