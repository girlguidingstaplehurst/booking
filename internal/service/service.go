package service

import (
	"context"
	"log/slog"
	"net/http"

	"github.com/girlguidingstaplehurst/booking/internal/calendar"
	calendarv1connect "github.com/girlguidingstaplehurst/booking/pkg/api/v1/v1connect"
	"golang.org/x/net/http2"
	"golang.org/x/net/http2/h2c"
)

type Service struct {
	bookings calendarv1connect.BookingsServiceHandler
}

func NewService() *Service {
	return &Service{
		bookings: calendar.NewHandler(),
	}
}

func (s *Service) Run(ctx context.Context) error {
	mux := http.NewServeMux()
	path, handler := calendarv1connect.NewBookingsServiceHandler(s.bookings)
	mux.Handle(path, handler)

	slog.Info("booting grpc service")
	http.ListenAndServe(
		"localhost:8080",
		// Use h2c so we can serve HTTP/2 without TLS.
		h2c.NewHandler(mux, &http2.Server{}),
	)

	return nil
}
