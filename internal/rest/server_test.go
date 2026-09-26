package rest

import "testing"

func TestValidatePerSessionPricing(t *testing.T) {
	count := 10

	tests := []struct {
		name    string
		pricing PerSessionPricing
		wantErr bool
	}{
		{name: "hourly only", pricing: PerSessionPricing{}},
		{name: "progressive pricing", pricing: PerSessionPricing{{Count: &count, Price: 150}, {Price: 13.5}}},
		{name: "missing first count", pricing: PerSessionPricing{{Price: 150}, {Price: 13.5}}, wantErr: true},
		{name: "negative price", pricing: PerSessionPricing{{Count: &count, Price: -1}, {Price: 13.5}}, wantErr: true},
		{name: "too many tiers", pricing: PerSessionPricing{{Count: &count, Price: 150}, {Price: 13.5}, {Price: 10}}, wantErr: true},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			if gotErr := validatePerSessionPricing(test.pricing) != ""; gotErr != test.wantErr {
				t.Fatalf("validatePerSessionPricing() error = %v, want error %v", gotErr, test.wantErr)
			}
		})
	}
}

func TestValidateMultiDayPricing(t *testing.T) {
	periods, initial, later := 2, float32(100), float32(80)
	if got := validateRatePricing("multiDay", 5, nil, PerSessionPricing{}, &periods, &initial, &later); got != "" {
		t.Fatalf("valid multi-day pricing rejected: %s", got)
	}
	zero := 0
	if got := validateRatePricing("multiDay", 5, nil, PerSessionPricing{}, &zero, &initial, &later); got == "" {
		t.Fatal("zero initial periods accepted")
	}
	negative := float32(-1)
	if got := validateRatePricing("multiDay", 5, nil, PerSessionPricing{}, &periods, &negative, &later); got == "" {
		t.Fatal("negative initial daily rate accepted")
	}
	price := float32(10)
	if got := validateRatePricing("multiDay", 5, &price, PerSessionPricing{}, &periods, &initial, &later); got == "" {
		t.Fatal("session pricing accepted for multi-day mode")
	}
}

func TestValidateKeyholder(t *testing.T) {
	tests := []struct {
		name      string
		keyNumber int
		wantErr   bool
	}{
		{name: "Alice", keyNumber: 1},
		{name: "  ", keyNumber: 1, wantErr: true},
		{name: "Alice", keyNumber: 0, wantErr: true},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			if gotErr := validateKeyholder(test.name, test.keyNumber) != ""; gotErr != test.wantErr {
				t.Fatalf("validateKeyholder() error = %v, want error %v", gotErr, test.wantErr)
			}
		})
	}
}
