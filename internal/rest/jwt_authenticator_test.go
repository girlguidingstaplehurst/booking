package rest

import (
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v2"
)

func TestE2EAuthenticator(t *testing.T) {
	tests := []struct {
		name       string
		authorize  string
		wantStatus int
	}{
		{name: "accepts configured token", authorize: "Bearer header.payload.signature", wantStatus: fiber.StatusOK},
		{name: "rejects wrong token", authorize: "Bearer wrong", wantStatus: fiber.StatusUnauthorized},
		{name: "rejects missing token", wantStatus: fiber.StatusUnauthorized},
		{name: "rejects malformed token", authorize: "header.payload.signature", wantStatus: fiber.StatusUnauthorized},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			app := fiber.New()
			auth := NewE2EAuthenticator("header.payload.signature", "e2e-admin@kathielambcentre.org")
			app.Use(auth.Validate)
			app.Get("/admin", func(ctx *fiber.Ctx) error {
				email, ok := UserEmailFromContext(ctx.UserContext())
				if !ok || email != "e2e-admin@kathielambcentre.org" {
					t.Fatalf("got user email %q, present: %v", email, ok)
				}
				return ctx.SendStatus(fiber.StatusOK)
			})

			req := httptest.NewRequest("GET", "/admin", nil)
			if test.authorize != "" {
				req.Header.Set("Authorization", test.authorize)
			}
			resp, err := app.Test(req)
			if err != nil {
				t.Fatal(err)
			}
			if resp.StatusCode != test.wantStatus {
				t.Fatalf("status = %d, want %d", resp.StatusCode, test.wantStatus)
			}
		})
	}
}
