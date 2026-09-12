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
