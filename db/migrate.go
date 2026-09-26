package db

import (
	"embed"
	"errors"
	"log/slog"
	"os"
	"time"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	"github.com/golang-migrate/migrate/v4/source/iofs"
)

//go:embed migrations/*.sql
var migrations embed.FS

func Migrate() error {
	slog.Info("starting db migration check")

	d, err := iofs.New(migrations, "migrations")
	if err != nil {
		return err
	}

	errCh := make(chan error, 1)
	go func() {
		slog.Info("loaded migrations")
		m, err := migrate.NewWithSourceInstance("iofs", d, os.Getenv("DATABASE_URL"))
		if err != nil {
			errCh <- err
			return
		}
		defer m.Close()

		slog.Info("starting db migration update")

		errCh <- m.Up()
	}()

	select {
	case err = <-errCh:
	case <-time.After(5 * time.Second):
		return errors.New("database migration timed out after 5 seconds")
	}
	if err != nil && !errors.Is(err, migrate.ErrNoChange) {
		return err
	}

	slog.Info("db migration check completed successfully")
	return nil
}
