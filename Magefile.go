//go:build mage

package main

import (
	"github.com/magefile/mage/mg"
	"github.com/magefile/mage/sh"
)

func CreateMigration(name string) error {
	//TODO use go tool version
	return sh.RunV("migrate", "create", "-dir", "db/migrations", "-ext", "sql", "-seq", name)
}

// Generate runs all codegen
func Generate() {
	mg.Deps(GoGen)
}

// GoGen generates with Go tooling
func GoGen() error {
	return sh.RunV("go", "generate", "./...")
}

// Run launches the service
func Run() error {
	return sh.RunV("go", "run", "cmd/booking/main.go")
}

// Dev launches the service using the local kubernetes config
func Dev() error {
	return sh.RunV("skaffold", "dev")
}

// E2E launches the E2E configuration of services using the local kubernetes config
func E2E() error {
	return sh.RunV("skaffold", "dev", "--profile", "e2e")
}

// E2ETest launches the E2E test suite
func E2ETest() error {
	return sh.RunWithV(map[string]string{
		"E2E_DATABASE_URL":       "postgresql://postgres:password@localhost:5432/postgres?sslmode=disable",
		"BOOKING_AUTH_E2E_TOKEN": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJoZCI6InN0YXBsZWh1cnN0Z3VpZGluZy5vcmciLCJlbWFpbCI6InRlc3RAc3RhcGxlaHVyc3RndWlkaW5nLm9yZyJ9.19qix3TTBSjIXG9YU2Bj8OnvFZjB7awBkyS9saqOiE0",
	}, "npm", "run", "e2e")
}
