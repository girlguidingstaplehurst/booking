package rest

import (
	"context"
	"crypto/subtle"
	"log/slog"
	"slices"
	"strings"

	"github.com/gofiber/fiber/v2"
	"google.golang.org/api/idtoken"
)

type JWTAuthenticator struct {
	clientID      string
	hostedDomains []string
}

type E2EAuthenticator struct {
	token string
	email string
}

func NewE2EAuthenticator(token, email string) *E2EAuthenticator {
	return &E2EAuthenticator{token: token, email: email}
}

func NewJWTAuthenticator(clientID string, hostedDomains ...string) *JWTAuthenticator {
	return &JWTAuthenticator{
		clientID:      clientID,
		hostedDomains: hostedDomains,
	}
}

type UserEmailKey struct{}

func (a *JWTAuthenticator) Validate(ctx *fiber.Ctx) error {
	authHeaders, ok := ctx.GetReqHeaders()["Authorization"]
	if !ok {
		slog.Error("Could not find auth token header")
		return unauthorized()
	}

	userCtx := ctx.UserContext()

	_, tokenString, found := strings.Cut(authHeaders[0], "Bearer ")
	if !found {
		slog.Error("Could not find Bearer token in header 0")
		return unauthorized()
	}

	payload, err := idtoken.Validate(userCtx, tokenString, a.clientID)
	if err != nil {
		slog.Error("validation failed", "err", err)
		return unauthorized()
	}

	hd := payload.Claims["hd"].(string)
	if !slices.Contains(a.hostedDomains, hd) {
		slog.Error("invalid hosted domain", "hd", payload.Claims["hd"])
		return unauthorized()
	}

	userCtx = context.WithValue(userCtx, UserEmailKey{}, payload.Claims["email"])
	ctx.SetUserContext(userCtx)

	return ctx.Next()
}

func (a *E2EAuthenticator) Validate(ctx *fiber.Ctx) error {
	authHeaders := ctx.GetReqHeaders()["Authorization"]
	if len(authHeaders) == 0 {
		return unauthorized()
	}

	_, tokenString, found := strings.Cut(authHeaders[0], "Bearer ")
	if !found || subtle.ConstantTimeCompare([]byte(tokenString), []byte(a.token)) != 1 {
		return unauthorized()
	}

	userCtx := context.WithValue(ctx.UserContext(), UserEmailKey{}, a.email)
	ctx.SetUserContext(userCtx)
	return ctx.Next()
}

func UserEmailFromContext(ctx context.Context) (string, bool) {
	e, ok := ctx.Value(UserEmailKey{}).(string)
	return e, ok
}

func unauthorized() *fiber.Error {
	return fiber.NewError(fiber.StatusUnauthorized, "unauthorized")
}
