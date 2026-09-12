package config

import "testing"

func TestLoadUsesGoogleAuthenticationByDefault(t *testing.T) {
	var config Config
	if err := Load(&config); err != nil {
		t.Fatal(err)
	}
	if config.Auth.Mode != "google" {
		t.Fatalf("auth mode = %q, want google", config.Auth.Mode)
	}
}

func TestConfigValidate(t *testing.T) {
	tests := []struct {
		name    string
		config  Config
		wantErr bool
	}{
		{name: "defaults to google", config: Config{Auth: AuthConfig{Mode: "google"}}},
		{name: "valid e2e", config: Config{Auth: AuthConfig{Mode: "e2e", E2E: E2E{Token: "token", Email: "test@example.org"}}}},
		{name: "missing e2e token", config: Config{Auth: AuthConfig{Mode: "e2e", E2E: E2E{Email: "test@example.org"}}}, wantErr: true},
		{name: "missing e2e email", config: Config{Auth: AuthConfig{Mode: "e2e", E2E: E2E{Token: "token"}}}, wantErr: true},
		{name: "unknown mode", config: Config{Auth: AuthConfig{Mode: "unknown"}}, wantErr: true},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			err := test.config.Validate()
			if (err != nil) != test.wantErr {
				t.Fatalf("Validate() error = %v, want error: %v", err, test.wantErr)
			}
		})
	}
}
