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
