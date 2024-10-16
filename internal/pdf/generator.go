package pdf

import (
	"bytes"
	"context"
	_ "embed"
	"io"
	"time"

	"github.com/girlguidingstaplehurst/booking/internal/rest"
	"github.com/johnfercher/maroto/v2"
	"github.com/johnfercher/maroto/v2/pkg/components/col"
	"github.com/johnfercher/maroto/v2/pkg/components/image"
	"github.com/johnfercher/maroto/v2/pkg/components/row"
	"github.com/johnfercher/maroto/v2/pkg/components/text"
	"github.com/johnfercher/maroto/v2/pkg/config"
	"github.com/johnfercher/maroto/v2/pkg/consts/align"
	"github.com/johnfercher/maroto/v2/pkg/consts/border"
	"github.com/johnfercher/maroto/v2/pkg/consts/extension"
	"github.com/johnfercher/maroto/v2/pkg/consts/fontstyle"
	"github.com/johnfercher/maroto/v2/pkg/core"
	"github.com/johnfercher/maroto/v2/pkg/core/entity"
	"github.com/johnfercher/maroto/v2/pkg/props"
	"github.com/shopspring/decimal"
)

const (
	poppinsFontFamily = "Poppins"
)

var _ rest.PDFGenerator = (*Generator)(nil)
var (
	//go:embed logo.png
	logo []byte

	//go:embed Poppins-Bold.ttf
	poppinsBold []byte

	//go:embed Poppins-Regular.ttf
	poppinsRegular []byte
)

type Generator struct{}

func NewGenerator() *Generator {
	return &Generator{}
}

//TODO long term it would be nice for this to be a lot more template-y and a lot less procedural.

func (g *Generator) GenerateInvoice(ctx context.Context, invoice *rest.Invoice) (io.Reader, error) {
	m, err := generateInvoice(invoice)
	if err != nil {
		return nil, err
	}

	document, err := m.Generate()
	if err != nil {
		return nil, err
	}

	//TODO consider dumping this into blob storage or similar for backup purposes

	return bytes.NewReader(document.GetBytes()), nil
}

func generateInvoice(invoice *rest.Invoice) (core.Maroto, error) {
	cfg := config.NewBuilder().
		WithPageNumber().
		WithLeftMargin(10).
		WithTopMargin(15).
		WithRightMargin(10).
		WithCustomFonts([]*entity.CustomFont{{
			Family: poppinsFontFamily,
			Style:  fontstyle.Bold,
			Bytes:  poppinsBold,
		}, {
			Family: poppinsFontFamily,
			Bytes:  poppinsRegular,
		}}).
		Build()

	m := maroto.New(cfg)

	ggDarkBlue := &props.Color{
		Red:   22,
		Green: 27,
		Blue:  78,
	}

	err := m.RegisterHeader(row.New(40).Add(image.NewFromBytesCol(12, logo, extension.Png, props.Rect{
		Center: true,
	})), row.New(30).Add(text.NewCol(12, "Invoice", props.Text{
		Size:   32,
		Align:  align.Center,
		Color:  ggDarkBlue,
		Family: poppinsFontFamily,
		Style:  fontstyle.Bold,
	})))
	if err != nil {
		return nil, err
	}

	err = m.RegisterFooter(row.New(10).Add(text.NewCol(12, "Staplehurst District Girl Guides, Registered Charity 801848", props.Text{
		Size:   12,
		Align:  align.Center,
		Color:  ggDarkBlue,
		Family: poppinsFontFamily,
	})))
	if err != nil {
		return nil, err
	}

	m.AddRow(8, text.NewCol(4, "Invoice Reference:", props.Text{
		Size:   12,
		Color:  ggDarkBlue,
		Style:  fontstyle.Bold,
		Family: poppinsFontFamily,
	}), text.NewCol(4, invoice.Reference, props.Text{
		Size:   12,
		Color:  ggDarkBlue,
		Family: poppinsFontFamily,
	}))
	m.AddRow(8, text.NewCol(4, "Invoice Date:", props.Text{
		Size:   12,
		Color:  ggDarkBlue,
		Style:  fontstyle.Bold,
		Family: poppinsFontFamily,
	}), text.NewCol(4, time.Now().Format("2006-01-02"), props.Text{
		Size:   12,
		Color:  ggDarkBlue,
		Family: poppinsFontFamily,
	}))

	m.AddRow(8)

	m.AddRow(12, text.NewCol(10, "Description", props.Text{
		Size:   12,
		Color:  ggDarkBlue,
		Style:  fontstyle.Bold,
		Family: poppinsFontFamily,
		Top:    6,
	}), text.NewCol(2, "Cost", props.Text{
		Size:   12,
		Color:  ggDarkBlue,
		Style:  fontstyle.Bold,
		Family: poppinsFontFamily,
		Align:  align.Right,
		Top:    6,
	})).WithStyle(&props.Cell{BorderType: border.Bottom, BorderColor: ggDarkBlue, BorderThickness: 0.5})

	var total decimal.Decimal
	for _, item := range invoice.Items {
		itemCost := decimal.NewFromFloat32(item.Cost)

		m.AddRow(12, text.NewCol(10, item.Description, props.Text{
			Size:   12,
			Color:  ggDarkBlue,
			Family: poppinsFontFamily,
			Top:    3.5,
		}), text.NewCol(2, "£"+itemCost.StringFixedBank(2), props.Text{
			Size:   12,
			Color:  ggDarkBlue,
			Family: poppinsFontFamily,
			Align:  align.Right,
			Top:    3.5,
		})).WithStyle(&props.Cell{BorderType: border.Bottom, BorderColor: ggDarkBlue, BorderThickness: 0.1})

		total = total.Add(itemCost)
	}

	m.AddRow(12,
		col.New(6),
		text.NewCol(4, "Total Cost", props.Text{
			Size:   12,
			Color:  ggDarkBlue,
			Style:  fontstyle.Bold,
			Family: poppinsFontFamily,
			Align:  align.Right,
			Top:    3.5,
		}), text.NewCol(2, "£"+total.StringFixedBank(2), props.Text{
			Size:   12,
			Color:  ggDarkBlue,
			Style:  fontstyle.Bold,
			Family: poppinsFontFamily,
			Align:  align.Right,
			Top:    3.5,
		})).WithStyle(&props.Cell{BorderType: border.Top, BorderColor: ggDarkBlue, BorderThickness: 0.4})

	m.AddRow(8)

	m.AddRow(8,
		text.NewCol(8, "Payment may be made by bank transfer to:", props.Text{
			Size:   12,
			Color:  ggDarkBlue,
			Family: poppinsFontFamily,
		}))

	m.AddRow(8,
		text.NewCol(3, "Sort Code:", props.Text{
			Size:   12,
			Color:  ggDarkBlue,
			Style:  fontstyle.Bold,
			Family: poppinsFontFamily,
		}),
		text.NewCol(3, "82-12-08", props.Text{
			Size:   12,
			Color:  ggDarkBlue,
			Family: poppinsFontFamily,
		}))

	m.AddRow(8,
		text.NewCol(3, "Account Number:", props.Text{
			Size:   12,
			Color:  ggDarkBlue,
			Style:  fontstyle.Bold,
			Family: poppinsFontFamily,
		}),
		text.NewCol(3, "20039458", props.Text{
			Size:   12,
			Color:  ggDarkBlue,
			Family: poppinsFontFamily,
		}))

	m.AddRow(8,
		text.NewCol(3, "Account Name:", props.Text{
			Size:   12,
			Color:  ggDarkBlue,
			Style:  fontstyle.Bold,
			Family: poppinsFontFamily,
		}),
		text.NewCol(5, "Staplehurst District Girl Guides", props.Text{
			Size:   12,
			Color:  ggDarkBlue,
			Family: poppinsFontFamily,
		}))

	return m, nil
}
