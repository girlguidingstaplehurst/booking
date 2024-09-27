package rest

import (
	"context"
	"log/slog"
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
		slog.Error("failed to add event to db", "error", err)
		return AddEvent500Response{}, nil //TODO make the error handler report error messages etc
	}

	return AddEvent200Response{}, nil
}
