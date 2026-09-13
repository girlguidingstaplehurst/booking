package service

import (
	"testing"

	"github.com/girlguidingstaplehurst/booking/internal/email"
)

func TestNewEmailSender(t *testing.T) {
	tests := []struct {
		name     string
		mode     string
		wantStub bool
		wantErr  bool
	}{
		{name: "default smtp", mode: ""},
		{name: "smtp", mode: "smtp"},
		{name: "stub", mode: "stub", wantStub: true},
		{name: "unsupported", mode: "mailhog", wantErr: true},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			sender, err := newEmailSender(test.mode)
			if (err != nil) != test.wantErr {
				t.Fatalf("newEmailSender() error = %v, want error: %v", err, test.wantErr)
			}
			if err != nil {
				return
			}
			_, gotStub := sender.(*email.StubSender)
			if gotStub != test.wantStub {
				t.Fatalf("newEmailSender() returned stub: %v, want: %v", gotStub, test.wantStub)
			}
		})
	}
}
