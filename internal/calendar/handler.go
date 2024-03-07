package calendar

import (
	"context"

	"connectrpc.com/connect"
	v1 "github.com/girlguidingstaplehurst/booking/pkg/pb/v1"
	calendarv1connect "github.com/girlguidingstaplehurst/booking/pkg/pb/v1/v1connect"
)

var _ calendarv1connect.GreetServiceHandler = (*Handler)(nil)

type Handler struct {
	calendarv1connect.UnimplementedGreetServiceHandler
}

func NewHandler() *Handler {
	return &Handler{}
}

// Greet implements v1connect.GreetServiceHandler.
func (h *Handler) Greet(ctx context.Context, req *connect.Request[v1.GreetRequest]) (*connect.Response[v1.GreetResponse], error) {
	panic("unimplemented")
}
