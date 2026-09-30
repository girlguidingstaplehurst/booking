package rest

import (
	"context"
	"testing"
	"time"

	openapi_types "github.com/oapi-codegen/runtime/types"
)

func TestGetWhatsOnImplicitRequestUsesFutureStartCutoff(t *testing.T) {
	db := &testDatabase{}
	server := NewServer(db, nil, nil, nil, nil)

	_, err := server.GetWhatsOn(context.Background(), GetWhatsOnRequestObject{})
	if err != nil {
		t.Fatalf("GetWhatsOn() error = %v", err)
	}
	if !db.whatsOnCalled {
		t.Fatal("ListWhatsOn was not called")
	}
	if !db.whatsOnFutureOnly {
		t.Fatal("implicit request did not enable future-only filtering")
	}
	if time.Since(db.whatsOnFrom) < 0 || time.Since(db.whatsOnFrom) > time.Second {
		t.Fatalf("implicit lower bound = %v, want current time", db.whatsOnFrom)
	}
	wantTo := db.whatsOnFrom.AddDate(0, 18, -1)
	if !db.whatsOnTo.Equal(wantTo) {
		t.Fatalf("implicit upper bound = %v, want %v", db.whatsOnTo, wantTo)
	}
}

func TestGetWhatsOnExplicitRequestRetainsOverlapMode(t *testing.T) {
	db := &testDatabase{}
	server := NewServer(db, nil, nil, nil, nil)
	from := openapi_types.Date{Time: time.Date(2026, time.January, 10, 0, 0, 0, 0, time.UTC)}
	to := openapi_types.Date{Time: time.Date(2026, time.January, 20, 0, 0, 0, 0, time.UTC)}

	_, err := server.GetWhatsOn(context.Background(), GetWhatsOnRequestObject{
		Params: GetWhatsOnParams{From: &from, To: &to},
	})
	if err != nil {
		t.Fatalf("GetWhatsOn() error = %v", err)
	}
	if db.whatsOnFutureOnly {
		t.Fatal("explicit request enabled future-only filtering")
	}
	if !db.whatsOnFrom.Equal(from.Time) || !db.whatsOnTo.Equal(to.Time) {
		t.Fatalf("explicit bounds = %v - %v, want %v - %v", db.whatsOnFrom, db.whatsOnTo, from.Time, to.Time)
	}
}
