//go:build mage

package main

import (
	"errors"

	"github.com/magefile/mage/mg"
	"github.com/magefile/mage/sh"
)

// Gen runs all codegen
func Gen() {
	mg.Deps(BufGen, GoGen)
}

// BufGen generates protobuf code
func BufGen() error {
	mg.Deps(goInstall(
		"connectrpc.com/connect/cmd/protoc-gen-connect-go",
		"github.com/bufbuild/buf/cmd/buf@latest",
		"google.golang.org/protobuf/cmd/protoc-gen-go",
	))
	return sh.RunV("buf", "generate")
}

// GoGen generates with Go tooling
func GoGen() error {
	return sh.RunV("go", "generate", "./...")
}

func goInstall(deps ...string) func() error {
	return func() error {
		var err error
		for _, dep := range deps {
			err = errors.Join(err, sh.RunV("go", "install", dep))
		}
		return err
	}
}

// Run launches the service
func Run() error {
	return sh.RunV("go", "run", "./...")
}
