//go:build mage

package main

import (
	"github.com/magefile/mage/mg"
	"github.com/magefile/mage/sh"
)

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
