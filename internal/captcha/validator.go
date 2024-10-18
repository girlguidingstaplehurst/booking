package captcha

import (
	"context"

	"github.com/MicahParks/recaptcha"
	"github.com/girlguidingstaplehurst/booking/internal/rest"
)

var _ rest.CaptchaVerifier = (*Verifier)(nil)

type Verifier struct {
	cli recaptcha.VerifierV3
}

func NewVerifier() *Verifier {
	return &Verifier{
		cli: recaptcha.NewVerifierV3("6LdCvFwmAAAAAKkKRWe7CuoK_7B3hteuBfx_4mlW", recaptcha.VerifierV3Options{}),
	}
}

func (v *Verifier) Verify(ctx context.Context, token string, ip string) (bool, error) {
	resp, err := v.cli.Verify(ctx, token, ip)
	if err != nil {
		return false, err
	}

	return resp.Success, nil
}
