package captcha

import (
	"context"
	"net/http"

	"github.com/MicahParks/recaptcha"
	"github.com/girlguidingstaplehurst/booking/internal/rest"
	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
)

var _ rest.CaptchaVerifier = (*Verifier)(nil)

type Verifier struct {
	cli recaptcha.VerifierV3
}

func NewVerifier() *Verifier {
	return &Verifier{
		cli: recaptcha.NewVerifierV3("6LdCvFwmAAAAAKkKRWe7CuoK_7B3hteuBfx_4mlW", recaptcha.VerifierV3Options{
			HTTPClient: &http.Client{Transport: otelhttp.NewTransport(http.DefaultTransport)},
		}),
	}
}

func (v *Verifier) Verify(ctx context.Context, token string, ip string) (bool, error) {
	resp, err := v.cli.Verify(ctx, token, ip)
	if err != nil {
		return false, err
	}

	return resp.Success, nil
}
