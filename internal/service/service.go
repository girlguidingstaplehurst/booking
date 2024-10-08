package service

import (
	"context"
	"log/slog"
	"net/http"
	"os"

	"github.com/girlguidingstaplehurst/booking"
	dbmigrations "github.com/girlguidingstaplehurst/booking/db"
	"github.com/girlguidingstaplehurst/booking/internal/postgres"
	"github.com/girlguidingstaplehurst/booking/internal/rest"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/filesystem"
	"github.com/jackc/pgx/v5/pgxpool"
	fibermiddleware "github.com/oapi-codegen/fiber-middleware"
)

type Service struct {
}

func NewService() *Service {
	return &Service{}
}

func (s *Service) Run(ctx context.Context) error {
	if err := dbmigrations.Migrate(); err != nil {
		return err
	}

	app := fiber.New()

	app.Use("/", filesystem.New(filesystem.Config{
		Root:       http.FS(booking.Files),
		PathPrefix: "/build",
	}))

	htmlPaths := []string{"/add-event", "/admin", "/admin/login", "/admin/review/:eventID"}
	app.Use(htmlPaths, func(c *fiber.Ctx) error {
		return filesystem.SendFile(c, http.FS(booking.IndexHTML), "/build/index.html")
	})

	swagger, err := rest.GetSwagger()
	if err != nil {
		panic(err)
	}
	app.Use(fibermiddleware.OapiRequestValidator(swagger))

	jwtAuth := rest.NewJWTAuthenticator(os.Getenv("GOOGLE_CLIENT_ID"), "kathielambcentre.org") //TODO externalize
	app.Use("/api/v1/admin", jwtAuth.Validate)

	dbpool, err := pgxpool.New(ctx, os.Getenv("DATABASE_URL"))
	if err != nil {
		slog.Error("failed to create db pool", "error", err)
		os.Exit(1)
	}
	defer dbpool.Close()

	db := postgres.NewDatabase(dbpool)
	rs := rest.NewServer(db)
	rest.RegisterHandlers(app, rest.NewStrictHandler(rs, nil))

	return app.Listen(":8080")
}
