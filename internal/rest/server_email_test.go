package rest_test

import (
	"context"
	"strings"
	"testing"

	"github.com/girlguidingstaplehurst/booking/internal/email"
	"github.com/girlguidingstaplehurst/booking/internal/rest"
	mock "github.com/girlguidingstaplehurst/booking/internal/rest/mock"
	"go.uber.org/mock/gomock"
)

func TestAdminSendInvoiceRecordsEmailWithAttachment(t *testing.T) {
	ctrl := gomock.NewController(t)
	db := mock.NewMockDatabase(ctrl)
	pdf := mock.NewMockPDFGenerator(ctrl)
	content := mock.NewMockContentManager(ctrl)
	sender := email.NewStubSender()

	invoice := &rest.Invoice{Contact: "customer@example.org", Id: "invoice-id"}
	db.EXPECT().AddInvoice(gomock.Any(), gomock.Any()).Return(invoice, nil)
	pdf.EXPECT().GenerateInvoice(gomock.Any(), invoice).Return(strings.NewReader("invoice pdf"), nil)
	content.EXPECT().Email(gomock.Any(), "klgc-booking-email").Return(rest.EmailContent{
		Subject: "Your booking invoice",
		Body:    "Please find your invoice attached.",
	}, nil)
	db.EXPECT().MarkInvoiceSent(gomock.Any(), "invoice-id").Return(nil)

	server := rest.NewServer(db, pdf, sender, nil, content)
	response, err := server.AdminSendInvoice(context.Background(), rest.AdminSendInvoiceRequestObject{
		Body: &rest.SendInvoiceBody{Contact: "customer@example.org"},
	})
	if err != nil {
		t.Fatalf("AdminSendInvoice() error = %v", err)
	}
	if _, ok := response.(rest.AdminSendInvoice200Response); !ok {
		t.Fatalf("AdminSendInvoice() response = %#v, want success", response)
	}

	messages := sender.Messages()
	if len(messages) != 1 {
		t.Fatalf("got %d recorded messages, want 1", len(messages))
	}
	message := messages[0]
	if message.To != "customer@example.org" || message.Subject != "Your booking invoice" || message.Body != "Please find your invoice attached." {
		t.Fatalf("recorded message = %#v", message)
	}
	if len(message.Attachments) != 1 || message.Attachments[0].Filename != "invoice.pdf" || string(message.Attachments[0].Content) != "invoice pdf" {
		t.Fatalf("recorded attachments = %#v", message.Attachments)
	}
}
