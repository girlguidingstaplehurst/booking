package rest_test

import (
	"context"
	"errors"
	"testing"

	"github.com/girlguidingstaplehurst/booking/internal/consts"
	"github.com/girlguidingstaplehurst/booking/internal/rest"
	mock "github.com/girlguidingstaplehurst/booking/internal/rest/mock"
	"go.uber.org/mock/gomock"
)

func TestAdminCreateZeroCostInvoicePersistsWithoutEmail(t *testing.T) {
	ctrl := gomock.NewController(t)
	db := mock.NewMockDatabase(ctrl)
	events := []string{"event-1"}
	body := &rest.SendInvoiceBody{
		Contact: "customer@example.org",
		Events:  &events,
		Items:   []rest.SendInvoiceBodyItem{{Description: "Free hire", Cost: 0}},
	}
	db.EXPECT().AddZeroCostInvoice(gomock.Any(), body).Return(nil)
	server := rest.NewServer(db, nil, nil, nil, nil)

	response, err := server.AdminCreateZeroCostInvoice(context.Background(), rest.AdminCreateZeroCostInvoiceRequestObject{Body: body})
	if err != nil {
		t.Fatalf("AdminCreateZeroCostInvoice() error = %v", err)
	}
	if _, ok := response.(rest.AdminCreateZeroCostInvoice200Response); !ok {
		t.Fatalf("response = %#v, want success", response)
	}
}

func TestAdminCreateZeroCostInvoiceMapsErrors(t *testing.T) {
	tests := []struct {
		name         string
		err          error
		wantResponse any
	}{
		{
			name:         "invalid request",
			err:          consts.ErrInvalidZeroCostInvoice,
			wantResponse: rest.AdminCreateZeroCostInvoice400JSONResponse{},
		},
		{
			name:         "unexpected persistence error",
			err:          errors.New("database unavailable"),
			wantResponse: rest.AdminCreateZeroCostInvoice500JSONResponse{},
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			ctrl := gomock.NewController(t)
			db := mock.NewMockDatabase(ctrl)
			db.EXPECT().AddZeroCostInvoice(gomock.Any(), gomock.Any()).Return(test.err)
			server := rest.NewServer(db, nil, nil, nil, nil)

			response, err := server.AdminCreateZeroCostInvoice(context.Background(), rest.AdminCreateZeroCostInvoiceRequestObject{
				Body: &rest.SendInvoiceBody{Contact: "customer@example.org"},
			})
			if err != nil {
				t.Fatalf("AdminCreateZeroCostInvoice() error = %v", err)
			}
			if reflectType(response) != reflectType(test.wantResponse) {
				t.Fatalf("response = %T, want %T", response, test.wantResponse)
			}
		})
	}
}
