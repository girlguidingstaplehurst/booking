package rest

import (
	"context"
	"errors"
	"time"

	"github.com/girlguidingstaplehurst/booking/internal/consts"
	"github.com/google/uuid"
	openapi_types "github.com/oapi-codegen/runtime/types"
)

//go:generate go run go.uber.org/mock/mockgen -source server.go -destination mock/server.go

var _ StrictServerInterface = (*Server)(nil)

type Database interface {
	AddEvent(ctx context.Context, event *AddEventJSONRequestBody) error
	ListEvents(ctx context.Context, from, to time.Time) ([]ListEvent, error)
}

type Server struct {
	db Database
}

func NewServer(db Database) *Server {
	return &Server{
		db: db,
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
