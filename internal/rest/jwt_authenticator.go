package rest

import (
	"context"
	"log/slog"
	"strings"

	"github.com/gofiber/fiber/v2"
	"google.golang.org/api/idtoken"
)

type JWTAuthenticator struct {
	clientID     string
	hostedDomain string
}

func NewJWTAuthenticator(clientID, hostedDomain string) *JWTAuthenticator {
	return &JWTAuthenticator{
		clientID:     clientID,
		hostedDomain: hostedDomain,
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

	if payload.Claims["hd"] != a.hostedDomain {
		slog.Error("invalid hosted domain", "hd", payload.Claims["hd"])
		return unauthorized()
	}

	userCtx = context.WithValue(userCtx, UserEmailKey{}, payload.Claims["email"])
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
