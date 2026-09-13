package email

import (
	"context"
	"errors"
	"strings"
	"testing"

	"github.com/girlguidingstaplehurst/booking/internal/rest"
)

func TestStubSenderRecordsMessages(t *testing.T) {
	sender := NewStubSender()

	err := sender.Send(context.Background(), "one@example.org", "First", "first body")
	if err != nil {
		t.Fatalf("Send() error = %v", err)
	}
	err = sender.SendWithAttachments(context.Background(), "two@example.org", "Second", "second body",
		rest.EmailAttachment{Filename: "invoice.pdf", Mimetype: "application/pdf", Content: strings.NewReader("pdf")},
		rest.EmailAttachment{Filename: "calendar.ics", Mimetype: "text/calendar", Content: strings.NewReader("ics")},
	)
	if err != nil {
		t.Fatalf("SendWithAttachments() error = %v", err)
	}

	got := sender.Messages()
	if len(got) != 2 {
		t.Fatalf("got %d messages, want 2", len(got))
	}
	if got[0].To != "one@example.org" || got[0].Subject != "First" || got[0].Body != "first body" {
		t.Fatalf("got first message %#v", got[0])
	}
	if len(got[0].Attachments) != 0 {
		t.Fatalf("got %d attachments on first message, want 0", len(got[0].Attachments))
	}
	if got[1].Attachments[0].Filename != "invoice.pdf" || string(got[1].Attachments[0].Content) != "pdf" {
		t.Fatalf("got first attachment %#v", got[1].Attachments[0])
	}
	if got[1].Attachments[1].Mimetype != "text/calendar" || string(got[1].Attachments[1].Content) != "ics" {
		t.Fatalf("got second attachment %#v", got[1].Attachments[1])
	}
}

func TestStubSenderDoesNotRecordUnreadableAttachments(t *testing.T) {
	sender := NewStubSender()
	wantErr := errors.New("read failed")

	err := sender.SendWithAttachments(context.Background(), "to@example.org", "Subject", "Body",
		rest.EmailAttachment{Filename: "broken", Content: errorReader{err: wantErr}},
	)
	if !errors.Is(err, wantErr) {
		t.Fatalf("error = %v, want %v", err, wantErr)
	}
	if got := len(sender.Messages()); got != 0 {
		t.Fatalf("got %d recorded messages, want 0", got)
	}
}

func TestStubSenderMessagesAreCopies(t *testing.T) {
	sender := NewStubSender()
	_ = sender.SendWithAttachments(context.Background(), "to@example.org", "Subject", "Body",
		rest.EmailAttachment{Filename: "file", Mimetype: "text/plain", Content: strings.NewReader("content")},
	)

	got := sender.Messages()
	got[0].Attachments[0].Content[0] = 'X'
	got = sender.Messages()
	if string(got[0].Attachments[0].Content) != "content" {
		t.Fatalf("internal attachment content was modified through a copy")
	}

	sender.Reset()
	if got := len(sender.Messages()); got != 0 {
		t.Fatalf("got %d messages after Reset(), want 0", got)
	}
}

type errorReader struct{ err error }

func (r errorReader) Read([]byte) (int, error) { return 0, r.err }
