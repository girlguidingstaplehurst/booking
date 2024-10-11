package rest

import (
	"context"
	"errors"
	"io"
	"time"

	"github.com/girlguidingstaplehurst/booking/internal/consts"
	"github.com/google/uuid"
	openapi_types "github.com/oapi-codegen/runtime/types"
	"github.com/shopspring/decimal"
)

//go:generate go run go.uber.org/mock/mockgen -source server.go -destination mock/server.go

//TODO consider breaking this into a REST adapter and a core struct - is a little muddled right now.

var _ StrictServerInterface = (*Server)(nil)

type Database interface {
	AddEvent(ctx context.Context, event *AddEventJSONRequestBody) error
	AddInvoice(ctx context.Context, invoice *SendInvoiceBody) (*Invoice, error)
	ListEvents(ctx context.Context, from, to time.Time) ([]ListEvent, error)
	MarkInvoiceSent(ctx context.Context, id uuid.UUID) error
}

type Invoice struct {
	// TODO this probably will be replaced with a generated type from the REST API
	ID        uuid.UUID
	Reference string
	Contact   string
	Sent      time.Time
	Paid      *time.Time
	Items     []*InvoiceItem
}

type InvoiceItem struct {
	ID          uuid.UUID
	EventID     uuid.UUID
	Description string
	Cost        decimal.Decimal
}

type PDFGenerator interface {
	GenerateInvoice(ctx context.Context, invoice *Invoice) (io.Reader, error)
}

type EmailSender interface {
	SendWithAttachments(ctx context.Context, to string, subject string, body string, attachments ...EmailAttachment) error
}

type EmailAttachment struct {
	Filename string
	Content  io.Reader
}

type Server struct {
	db    Database
	pdf   PDFGenerator
	email EmailSender
}

func NewServer(db Database, pdf PDFGenerator, email EmailSender) *Server {
	return &Server{
		db:    db,
		pdf:   pdf,
		email: email,
	}
}

func (s *Server) AddEvent(ctx context.Context, req AddEventRequestObject) (AddEventResponseObject, error) {
	//TODO validate

	err := s.db.AddEvent(ctx, req.Body)
	if err != nil {
		if errors.Is(err, consts.ErrBookingExists) {
			return AddEvent409JSONResponse{
				ErrorMessage: err.Error(),
			}, nil
		}
		return AddEvent500JSONResponse{
			ErrorMessage: err.Error(),
		}, nil
	}

	return AddEvent200Response{}, nil
}

func (s *Server) GetApiV1Events(ctx context.Context, request GetApiV1EventsRequestObject) (GetApiV1EventsResponseObject, error) {
	if request.Params.From == nil && request.Params.To == nil {
		// Get start date of this month
		now := time.Now()
		y, m, _ := now.Date()
		loc := now.Location()

		request.Params.From = &openapi_types.Date{
			Time: time.Date(y, m, 1, 0, 0, 0, 0, loc),
		}
		// Default range is the full 18-month period
		request.Params.To = &openapi_types.Date{
			Time: request.Params.From.Time.AddDate(0, 18, -1),
		}
	}

	//TODO validate

	events, err := s.db.ListEvents(ctx, request.Params.From.Time, request.Params.To.Time)
	if err != nil {
		return GetApiV1Events500JSONResponse{
			ErrorMessage: err.Error(),
		}, nil
	}

	return GetApiV1Events200JSONResponse{
		Events: events,
	}, nil
}

func (s *Server) GetApiV1AdminEvents(ctx context.Context, request GetApiV1AdminEventsRequestObject) (GetApiV1AdminEventsResponseObject, error) {
	return GetApiV1AdminEvents200JSONResponse{
		Events: []ListEvent{{
			Id:     "aaabbbccc111222333",
			Name:   "Test event",
			Status: "proposed",
			From:   "2024-10-10T09:00:00Z",
			To:     "2024-10-10T10:00:00Z",
		}},
	}, nil
}

func (s *Server) GetApiV1AdminEventsEventID(ctx context.Context, request GetApiV1AdminEventsEventIDRequestObject) (GetApiV1AdminEventsEventIDResponseObject, error) {
	return GetApiV1AdminEventsEventID200JSONResponse{
		Id:      uuid.New().String(),
		Name:    "Test event",
		Contact: "Evan T Booking",
		Email:   "evan.t.booking@example.org",
		From:    "2024-10-10T09:00:00Z",
		To:      "2024-10-10T10:00:00Z",
		Status:  "proposed",
		Visible: false,
	}, nil
}

func (s *Server) AdminSendInvoice(ctx context.Context, request AdminSendInvoiceRequestObject) (AdminSendInvoiceResponseObject, error) {
	//TODO validation

	invoice, err := s.db.AddInvoice(ctx, request.Body)
	if err != nil {
		//TODO handle not found error here with 404
		return AdminSendInvoice500JSONResponse{
			ErrorMessage: err.Error(),
		}, nil
	}

	pdf, err := s.pdf.GenerateInvoice(ctx, invoice)
	if err != nil {
		return AdminSendInvoice500JSONResponse{
			ErrorMessage: err.Error(),
		}, nil
	}

	//TODO consider if we need to attach more files here - may want to be configurable?
	err = s.email.SendWithAttachments(
		ctx,
		invoice.Contact,
		"Your event booking at the Kathie Lamb Guide Centre",
		"Event booking email contents", //TODO make this configurable
		EmailAttachment{Filename: "invoice.pdf", Content: pdf},
	)
	if err != nil {
		return AdminSendInvoice500JSONResponse{
			ErrorMessage: err.Error(),
		}, nil
	}

	err = s.db.MarkInvoiceSent(ctx, invoice.ID)
	if err != nil {
		//TODO is this right, or do we need a special-case?
		return AdminSendInvoice500JSONResponse{
			ErrorMessage: err.Error(),
		}, nil
	}

	return AdminSendInvoice200Response{}, nil
}
