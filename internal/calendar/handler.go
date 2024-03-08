package calendar

import (
	"context"

	"connectrpc.com/connect"
	v1 "github.com/girlguidingstaplehurst/booking/pkg/api/v1"
	calendarv1connect "github.com/girlguidingstaplehurst/booking/pkg/api/v1/v1connect"
)

var _ calendarv1connect.BookingsServiceHandler = (*Handler)(nil)

type Handler struct {
	calendarv1connect.UnimplementedBookingsServiceHandler
}

func NewHandler() *Handler {
	return &Handler{}
}

// ListBookings lists all bookings between the specified dates. If not set, defaults to the bookings for the current month.
func (h *Handler) ListBookings(ctx context.Context, req *connect.Request[v1.ListBookingsRequest]) (*connect.Response[v1.ListBookingsResponse], error) {
	panic("unimplemented")
}
