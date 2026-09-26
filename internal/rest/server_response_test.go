package rest_test

import (
	"context"
	"testing"

	"github.com/girlguidingstaplehurst/booking/internal/rest"
	mock_rest "github.com/girlguidingstaplehurst/booking/internal/rest/mock"
	"go.uber.org/mock/gomock"
)

func TestAdminGetInvoicesForEventsGroupsIndividualEventsByContact(t *testing.T) {
	ctrl := gomock.NewController(t)
	database := mock_rest.NewMockDatabase(ctrl)
	server := rest.NewServer(database, nil, nil, nil, nil)
	events := []rest.DBInvoiceEvent{
		{Email: "contact@example.org", ContactName: "Contact", InvoiceEvent: rest.InvoiceEvent{Id: "one", Name: "First event"}},
		{Email: "contact@example.org", ContactName: "Contact", InvoiceEvent: rest.InvoiceEvent{Id: "two", Name: "Second event"}},
	}
	eventIDs := []string{"one,two"}
	database.EXPECT().GetInvoiceEvents(gomock.Any(), "one", "two").Return(events, nil)

	response, err := server.AdminGetInvoicesForEvents(context.Background(), rest.AdminGetInvoicesForEventsRequestObject{
		Params: rest.AdminGetInvoicesForEventsParams{Events: &eventIDs},
	})
	if err != nil {
		t.Fatal(err)
	}
	preparations := response.(rest.AdminGetInvoicesForEvents200JSONResponse).Preparations
	if len(preparations) != 1 || len(preparations[0].Events) != 2 {
		t.Fatalf("got %+v, want one preparation with two events", preparations)
	}
	if preparations[0].ContactName != "Contact" || preparations[0].Name != "First event, Second event" {
		t.Fatalf("got contact context %+v", preparations[0])
	}
}

func TestAdminListInvoiceableEventsForContact(t *testing.T) {
	ctrl := gomock.NewController(t)
	database := mock_rest.NewMockDatabase(ctrl)
	server := rest.NewServer(database, nil, nil, nil, nil)
	events := []rest.Event{{Id: "event-1", Name: "Historical event", Status: rest.EventStatusApproved}}
	database.EXPECT().GetInvoiceableEventsForContact(gomock.Any(), "contact@example.org").Return(rest.AdminInvoiceableEvents{
		Contact: rest.AdminContact{Name: "Contact", Email: "contact@example.org"},
		Events:  events,
	}, nil)

	response, err := server.AdminListInvoiceableEvents(context.Background(), rest.AdminListInvoiceableEventsRequestObject{
		Params: rest.AdminListInvoiceableEventsParams{Contact: "contact@example.org"},
	})
	if err != nil {
		t.Fatal(err)
	}
	result := response.(rest.AdminListInvoiceableEvents200JSONResponse)
	if result.Contact.Name != "Contact" || len(result.Events) != 1 || result.Events[0].Id != "event-1" {
		t.Fatalf("got %+v", result)
	}
}

func TestAdminListInvoiceableEventsForContactAllowsEmptyResults(t *testing.T) {
	ctrl := gomock.NewController(t)
	database := mock_rest.NewMockDatabase(ctrl)
	server := rest.NewServer(database, nil, nil, nil, nil)
	database.EXPECT().GetInvoiceableEventsForContact(gomock.Any(), "empty@example.org").Return(rest.AdminInvoiceableEvents{
		Contact: rest.AdminContact{Name: "Empty", Email: "empty@example.org"},
		Events:  []rest.Event{},
	}, nil)

	response, err := server.AdminListInvoiceableEvents(context.Background(), rest.AdminListInvoiceableEventsRequestObject{
		Params: rest.AdminListInvoiceableEventsParams{Contact: "empty@example.org"},
	})
	if err != nil {
		t.Fatal(err)
	}
	if len(response.(rest.AdminListInvoiceableEvents200JSONResponse).Events) != 0 {
		t.Fatal("expected no invoiceable events")
	}
}

func TestAdminListInvoiceableEventsRequiresContact(t *testing.T) {
	server := rest.NewServer(nil, nil, nil, nil, nil)
	response, err := server.AdminListInvoiceableEvents(context.Background(), rest.AdminListInvoiceableEventsRequestObject{})
	if err != nil {
		t.Fatal(err)
	}
	if _, ok := response.(rest.AdminListInvoiceableEvents400JSONResponse); !ok {
		t.Fatalf("got %T, want bad request", response)
	}

	response, err = server.AdminListInvoiceableEvents(context.Background(), rest.AdminListInvoiceableEventsRequestObject{
		Params: rest.AdminListInvoiceableEventsParams{Contact: "not-an-email"},
	})
	if err != nil {
		t.Fatal(err)
	}
	if _, ok := response.(rest.AdminListInvoiceableEvents400JSONResponse); !ok {
		t.Fatalf("got %T for invalid email, want bad request", response)
	}
}

func TestAdminGetInvoiceByIDIncludesInvoiceAssociation(t *testing.T) {
	ctrl := gomock.NewController(t)
	database := mock_rest.NewMockDatabase(ctrl)
	server := rest.NewServer(database, nil, nil, nil, nil)
	eventID := "event-1"
	database.EXPECT().GetInvoiceByID(gomock.Any(), "invoice-1").Return(rest.Invoice{
		Id:     "invoice-1",
		Items:  []rest.InvoiceItem{{Description: "Hall hire", Cost: 120}},
		Events: &[]rest.InvoiceEventSummary{{Id: eventID, Name: "Summer event"}},
	}, nil)

	response, err := server.AdminGetInvoiceByID(context.Background(), rest.AdminGetInvoiceByIDRequestObject{
		InvoiceID: "invoice-1",
	})
	if err != nil {
		t.Fatal(err)
	}
	invoice := rest.Invoice(response.(rest.AdminGetInvoiceByID200JSONResponse))
	if invoice.Events == nil || len(*invoice.Events) != 1 || (*invoice.Events)[0].Id != eventID {
		t.Fatalf("got invoice events %+v", invoice.Events)
	}
	if len(invoice.Items) != 1 || invoice.Items[0].Description != "Hall hire" {
		t.Fatalf("got invoice items %+v", invoice.Items)
	}
}

func TestAdminGetInvoicesForEventsIncludesGroupRate(t *testing.T) {
	ctrl := gomock.NewController(t)
	database := mock_rest.NewMockDatabase(ctrl)
	server := rest.NewServer(database, nil, nil, nil, nil)
	groupID := "group-1"
	rate := &rest.Rate{Id: "group-rate", PerSession: rest.PerSessionPricing{{Count: intPointer(2), Price: 100}, {Price: 20}}}
	database.EXPECT().GetInvoiceEventsForGroup(gomock.Any(), groupID).Return([]rest.DBInvoiceEvent{
		{
			Email:          "contact@example.org",
			ContactName:    "Contact",
			EventGroup:     &groupID,
			GroupName:      "Group event",
			RateDefinition: rate,
			InvoiceEvent:   rest.InvoiceEvent{Id: "session-1", Name: "Group event"},
		},
	}, nil)

	response, err := server.AdminGetInvoicesForEvents(context.Background(), rest.AdminGetInvoicesForEventsRequestObject{
		Params: rest.AdminGetInvoicesForEventsParams{EventGroup: &groupID},
	})
	if err != nil {
		t.Fatal(err)
	}
	preparation := response.(rest.AdminGetInvoicesForEvents200JSONResponse).Preparations[0]
	if preparation.Mode != rest.Group || preparation.EventGroup == nil || preparation.Rate == nil {
		t.Fatalf("got incomplete group preparation %+v", preparation)
	}
	if len(preparation.Rate.PerSession) != 2 {
		t.Fatalf("got rate %+v, want progressive pricing", preparation.Rate)
	}
}

func intPointer(value int) *int {
	return &value
}
