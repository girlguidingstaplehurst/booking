package consts

import (
	"errors"
)

var (
	//ErrBookingExists occurs when an existing booking overlaps the proposed dates
	ErrBookingExists = errors.New("a booking exists for these dates")
	// ErrInvalidEventDates occurs when an event's end is not after its start.
	ErrInvalidEventDates = errors.New("event end must be after event start")
	// ErrInvalidEventNoteContent occurs when an event note contains no non-whitespace text.
	ErrInvalidEventNoteContent = errors.New("event note content must not be empty")
	// ErrInvalidZeroCostInvoice occurs when a no-email invoice is not an individual zero-total invoice.
	ErrInvalidZeroCostInvoice = errors.New("zero-cost invoices require individual events and a total of £0.00")
)
