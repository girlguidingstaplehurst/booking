package rest

import (
	"context"
	"errors"

	"github.com/girlguidingstaplehurst/booking/internal/postgres"
)

//go:generate go run go.uber.org/mock/mockgen -source server.go -destination mock/server.go

var _ StrictServerInterface = (*Server)(nil)

type Database interface {
	AddEvent(ctx context.Context, event *AddEventJSONRequestBody) error
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
		if errors.Is(err, postgres.ErrBookingExists) {
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
