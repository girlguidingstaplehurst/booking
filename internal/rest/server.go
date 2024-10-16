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
	GetEvent(ctx context.Context, id string) (Event, error)
	GetInvoiceEvents(ctx context.Context, ids []string) ([]DBInvoiceEvent, error)
	GetInvoiceByID(ctx context.Context, id string) (Invoice, error)
	ListEvents(ctx context.Context, from, to time.Time) ([]ListEvent, error)
	AdminListEvents(ctx context.Context, from, to time.Time) ([]Event, error)
	MarkInvoiceSent(ctx context.Context, id string) error
	MarkInvoicePaid(ctx context.Context, id string) error
}

type DBInvoiceItem struct {
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

	events, err := s.db.AdminListEvents(ctx, request.Params.From.Time, request.Params.To.Time)
	if err != nil {
		return GetApiV1AdminEvents500JSONResponse{ErrorMessage: err.Error()}, nil
	}

	return GetApiV1AdminEvents200JSONResponse{
		Events: events,
	}, nil
}

func (s *Server) GetApiV1AdminEventsEventID(ctx context.Context, request GetApiV1AdminEventsEventIDRequestObject) (GetApiV1AdminEventsEventIDResponseObject, error) {
	event, err := s.db.GetEvent(ctx, request.EventID)
	if err != nil {
		//TODO handle not found
		return GetApiV1AdminEventsEventID500JSONResponse{
			ErrorMessage: err.Error(),
		}, nil
	}
	return GetApiV1AdminEventsEventID200JSONResponse(event), nil
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
	err = s.email.SendWithAttachments(ctx, string(invoice.Contact), "Your event booking at the Kathie Lamb Guide Centre", "Event booking email contents", //TODO make this configurable
		EmailAttachment{Filename: "invoice.pdf", Content: pdf})
	if err != nil {
		return AdminSendInvoice500JSONResponse{
			ErrorMessage: err.Error(),
		}, nil
	}

	err = s.db.MarkInvoiceSent(ctx, invoice.Id)
	if err != nil {
		//TODO is this right, or do we need a special-case?
		return AdminSendInvoice500JSONResponse{
			ErrorMessage: err.Error(),
		}, nil
	}

	return AdminSendInvoice200Response{}, nil
}

type DBInvoiceEvent struct {
	InvoiceEvent
	Email string
}

func (s *Server) AdminGetInvoicesForEvents(ctx context.Context, request AdminGetInvoicesForEventsRequestObject) (AdminGetInvoicesForEventsResponseObject, error) {
	events, err := s.db.GetInvoiceEvents(ctx, request.Params.Events)
	if err != nil {
		return AdminGetInvoicesForEvents500JSONResponse{
			ErrorMessage: err.Error(),
		}, nil
	}

	eventsByEmail := make(AdminGetInvoicesForEvents200JSONResponse)
	for _, event := range events {
		if eventsByEmail[event.Email] == nil {
			eventsByEmail[event.Email] = make([]InvoiceEvent, 0)
		}

		eventsByEmail[event.Email] = append(eventsByEmail[event.Email], event.InvoiceEvent)
	}

	return eventsByEmail, nil
}

func (s *Server) AdminGetInvoiceByID(ctx context.Context, request AdminGetInvoiceByIDRequestObject) (AdminGetInvoiceByIDResponseObject, error) {
	invoice, err := s.db.GetInvoiceByID(ctx, request.InvoiceID)
	if err != nil {
		return AdminGetInvoiceByID500JSONResponse{
			ErrorMessage: err.Error(),
		}, nil
	}

	return AdminGetInvoiceByID200JSONResponse(invoice), nil
}

func (s *Server) AdminMarkInvoicePaid(ctx context.Context, request AdminMarkInvoicePaidRequestObject) (AdminMarkInvoicePaidResponseObject, error) {
	err := s.db.MarkInvoicePaid(ctx, request.InvoiceID)
	if err != nil {
		return AdminMarkInvoicePaid500JSONResponse{ErrorMessage: err.Error()}, nil
	}

	return AdminMarkInvoicePaid200Response{}, nil
}
