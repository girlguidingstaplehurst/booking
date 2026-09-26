package rest

import (
	"context"
	"errors"
	"testing"
	"time"

	openapi_types "github.com/oapi-codegen/runtime/types"
)

type testCaptcha struct{ err error }

func (c testCaptcha) Verify(context.Context, string, string) error { return c.err }

type testDatabase struct {
	err     error
	called  bool
	request *AddEventJSONRequestBody
}

func (d *testDatabase) AddEvent(_ context.Context, event *AddEventJSONRequestBody) error {
	d.called = true
	d.request = event
	return d.err
}

func (d *testDatabase) AddEvents(context.Context, AdminAddEventsRequestObject) error { return nil }
func (d *testDatabase) AddEventGroup(context.Context, AdminAddEventGroupRequestObject) error {
	return nil
}
func (d *testDatabase) DuplicateEventGroup(context.Context, AdminDuplicateEventGroupRequestObject) error {
	return nil
}
func (d *testDatabase) AddInvoice(context.Context, *SendInvoiceBody) (*Invoice, error) {
	return nil, nil
}
func (d *testDatabase) GetEvent(context.Context, string) (Event, error) { return Event{}, nil }
func (d *testDatabase) GetInvoiceEvents(context.Context, ...string) ([]DBInvoiceEvent, error) {
	return nil, nil
}
func (d *testDatabase) GetInvoiceEventsForGroup(context.Context, string) ([]DBInvoiceEvent, error) {
	return nil, nil
}
func (d *testDatabase) GetInvoiceByID(context.Context, string) (Invoice, error) {
	return Invoice{}, nil
}
func (d *testDatabase) GetRates(context.Context) ([]Rate, error)                 { return nil, nil }
func (d *testDatabase) CreateRate(context.Context, CreateRateBody) (Rate, error) { return Rate{}, nil }
func (d *testDatabase) UpdateRate(context.Context, string, UpdateRateBody) (Rate, error) {
	return Rate{}, nil
}
func (d *testDatabase) ListEvents(context.Context, time.Time, time.Time) ([]ListEvent, error) {
	return nil, nil
}
func (d *testDatabase) ListEventsForContact(context.Context, string, time.Time, time.Time) ([]ListEvent, error) {
	return nil, nil
}
func (d *testDatabase) AdminListEvents(context.Context, time.Time, time.Time) (AdminEventList, error) {
	return AdminEventList{}, nil
}
func (d *testDatabase) SearchEventGroups(context.Context, string) ([]AdminEventGroup, error) {
	return nil, nil
}
func (d *testDatabase) GetEventGroup(context.Context, string) (AdminEventGroupDetails, error) {
	return AdminEventGroupDetails{}, nil
}
func (d *testDatabase) ListKeyholders(context.Context) (KeyholderList, error) { return nil, nil }
func (d *testDatabase) ListContacts(context.Context) (AdminContactList, error) { return nil, nil }
func (d *testDatabase) CreateKeyholder(context.Context, CreateKeyholderBody) (Keyholder, error) {
	return Keyholder{}, nil
}
func (d *testDatabase) UpdateKeyholder(context.Context, openapi_types.UUID, UpdateKeyholderBody) (Keyholder, error) {
	return Keyholder{}, nil
}
func (d *testDatabase) SetEventKeyholders(context.Context, string, SetEventKeyholdersBody) error {
	return nil
}
func (d *testDatabase) UpdateEventDates(context.Context, string, UpdateEventDatesBody) error {
	return nil
}
func (d *testDatabase) MarkInvoiceSent(context.Context, string) error        { return nil }
func (d *testDatabase) MarkInvoicePaid(context.Context, string) error        { return nil }
func (d *testDatabase) SetEventStatus(context.Context, string, string) error { return nil }
func (d *testDatabase) SetRate(context.Context, string, string) error        { return nil }

type testContent struct {
	content EmailContent
	err     error
	key     string
	vars    map[string]any
}

func (c *testContent) Email(_ context.Context, key string) (EmailContent, error) {
	c.key = key
	return c.content, c.err
}

func (c *testContent) EmailTemplate(_ context.Context, key string, vars map[string]any) (EmailContent, error) {
	c.key = key
	c.vars = vars
	return c.content, c.err
}

type testSender struct {
	to, subject, body string
	err               error
	called            bool
}

func (s *testSender) Send(_ context.Context, to, subject, body string, _ ...EmailAttachment) error {
	s.called, s.to, s.subject, s.body = true, to, subject, body
	return s.err
}

func (s *testSender) SendWithAttachments(ctx context.Context, to, subject, body string, attachments ...EmailAttachment) error {
	return s.Send(ctx, to, subject, body, attachments...)
}

func TestAddEventSendsAcknowledgementEmail(t *testing.T) {
	db := &testDatabase{}
	content := &testContent{content: EmailContent{Subject: "Booking received", Body: "We received your request."}}
	sender := &testSender{}
	server := NewServer(db, nil, sender, testCaptcha{}, content)

	response, err := server.AddEvent(testContext(), AddEventRequestObject{Body: publicBookingRequest()})
	if err != nil {
		t.Fatalf("AddEvent() error = %v", err)
	}
	if _, ok := response.(AddEvent200Response); !ok {
		t.Fatalf("AddEvent() response = %#v, want success", response)
	}
	if content.key != "event-name-booking-in-review" {
		t.Fatalf("content key = %q", content.key)
	}
	event, ok := content.vars["event"].(Event)
	if !ok || event.Name != "Test event" || event.Contact != "Booker" {
		t.Fatalf("template event = %#v, want submitted event context", content.vars["event"])
	}
	if date, ok := content.vars["date"].(string); !ok || date == "" {
		t.Fatalf("template date = %#v, want formatted date", content.vars["date"])
	}
	if !sender.called || sender.to != "booker@example.org" || sender.subject != "Booking received" || sender.body != "We received your request." {
		t.Fatalf("sender = %#v, want acknowledgement", sender)
	}
}

func TestAddEventDoesNotSendAcknowledgementWhenPersistenceFails(t *testing.T) {
	db := &testDatabase{err: errors.New("database unavailable")}
	content := &testContent{}
	sender := &testSender{}
	server := NewServer(db, nil, sender, testCaptcha{}, content)

	response, err := server.AddEvent(testContext(), AddEventRequestObject{Body: publicBookingRequest()})
	if err != nil {
		t.Fatalf("AddEvent() error = %v", err)
	}
	if _, ok := response.(AddEvent500JSONResponse); !ok {
		t.Fatalf("AddEvent() response = %#v, want failure", response)
	}
	if sender.called || content.key != "" {
		t.Fatalf("email was attempted after persistence failure")
	}
}

func TestAddEventEmailFailuresStillReturnSuccess(t *testing.T) {
	tests := []struct {
		name       string
		contentErr error
		sendErr    error
	}{
		{name: "content lookup", contentErr: errors.New("content unavailable")},
		{name: "delivery", sendErr: errors.New("mail unavailable")},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			db := &testDatabase{}
			content := &testContent{content: EmailContent{Subject: "Booking received", Body: "Sensitive email body"}, err: test.contentErr}
			sender := &testSender{err: test.sendErr}
			server := NewServer(db, nil, sender, testCaptcha{}, content)

			response, err := server.AddEvent(testContext(), AddEventRequestObject{Body: publicBookingRequest()})
			if err != nil {
				t.Fatalf("AddEvent() error = %v", err)
			}
			if _, ok := response.(AddEvent200Response); !ok {
				t.Fatalf("AddEvent() response = %#v, want success", response)
			}
			if test.contentErr == nil && !sender.called {
				t.Fatal("email sender was not called")
			}
		})
	}
}

func publicBookingRequest() *AddEventJSONRequestBody {
	return &AddEventJSONRequestBody{
		CaptchaToken: "captcha", PrivacyPolicy: true, TermsOfHire: true,
		CleaningAndDamage: true, CarParking: true, Adhesives: true,
		Contact: Contact{Name: "Booker", EmailAddress: "booker@example.org"},
		Event:   EventDetails{Name: "Test event", From: "2026-09-24T10:00:00Z", To: "2026-09-24T11:00:00Z"},
	}
}

func testContext() context.Context {
	return context.WithValue(context.Background(), UserIPKey{}, "127.0.0.1")
}
