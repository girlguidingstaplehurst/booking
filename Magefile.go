//go:build mage

package main

import (
	"github.com/magefile/mage/sh"
)

// Gen runs codegen updating operations
func Gen() error {
	return sh.RunV("go", "generate", "./...")
}
