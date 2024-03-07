package service

import (
	"context"
	"net/http"

	"github.com/girlguidingstaplehurst/booking/internal/calendar"
	calendarv1connect "github.com/girlguidingstaplehurst/booking/pkg/pb/v1/v1connect"
	"golang.org/x/net/http2"
	"golang.org/x/net/http2/h2c"
)

type Service struct {
	greeter calendarv1connect.GreetServiceHandler
}

func NewService() *Service {
	return &Service{
		greeter: calendar.NewHandler(),
	}
}

func (s *Service) Run(ctx context.Context) error {
	mux := http.NewServeMux()
	path, handler := calendarv1connect.NewGreetServiceHandler(s.greeter)
	mux.Handle(path, handler)
	http.ListenAndServe(
		"localhost:8080",
		// Use h2c so we can serve HTTP/2 without TLS.
		h2c.NewHandler(mux, &http2.Server{}),
	)

	return nil
}
