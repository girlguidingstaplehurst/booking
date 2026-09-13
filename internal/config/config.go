package config

import "fmt"

type Config struct {
	Auth  AuthConfig
	Email EmailConfig
}

type AuthConfig struct {
	Mode string
	E2E  E2E
}

type E2E struct {
	Token string
	Email string
}

type EmailConfig struct {
	Mode string
}

func (c Config) Validate() error {
	switch c.Auth.Mode {
	case "google":
	case "e2e":
		if c.Auth.E2E.Token == "" {
			return fmt.Errorf("auth e2e token is required when auth mode is e2e")
		}
		if c.Auth.E2E.Email == "" {
			return fmt.Errorf("auth e2e email is required when auth mode is e2e")
		}
	default:
		return fmt.Errorf("unsupported auth mode %q", c.Auth.Mode)
	}

	if c.Email.Mode != "" && c.Email.Mode != "smtp" && c.Email.Mode != "stub" {
		return fmt.Errorf("unsupported email mode %q", c.Email.Mode)
	}

	return nil
}
