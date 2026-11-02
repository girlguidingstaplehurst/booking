package rest_test

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"testing"

	"github.com/girlguidingstaplehurst/booking/internal/consts"
	"github.com/girlguidingstaplehurst/booking/internal/rest"
	mock_rest "github.com/girlguidingstaplehurst/booking/internal/rest/mock"
	"github.com/jackc/pgx/v5"
	openapi_types "github.com/oapi-codegen/runtime/types"
	"go.uber.org/mock/gomock"
)

func TestAdminCreateEventNoteUsesAuthenticatedEmail(t *testing.T) {
	ctrl := gomock.NewController(t)
	database := mock_rest.NewMockDatabase(ctrl)
	server := rest.NewServer(database, nil, nil, nil, nil)
	content := "Call the organiser\nThen approve"
	authorEmail := "admin@example.org"
	note := rest.EventNote{
		Id:          "note-1",
		Content:     content,
		AuthorEmail: openapi_types.Email(authorEmail),
		CreatedAt:   "2026-11-02T09:30:00Z",
	}
	database.EXPECT().AddEventNote(gomock.Any(), "event-1", content, authorEmail).Return(note, nil)

	ctx := context.WithValue(context.Background(), rest.UserEmailKey{}, authorEmail)
	response, err := server.AdminCreateEventNote(ctx, rest.AdminCreateEventNoteRequestObject{
		EventID: "event-1",
		Body:    &rest.AdminCreateEventNoteJSONRequestBody{Content: content},
	})
	if err != nil {
		t.Fatal(err)
	}
	created := response.(rest.AdminCreateEventNote201JSONResponse)
	if created.Id != note.Id || created.Content != content || string(created.AuthorEmail) != authorEmail || created.CreatedAt != note.CreatedAt {
		t.Fatalf("created note = %+v, want %+v", created, note)
	}
}

func TestAdminCreateEventNoteRejectsMissingAuthenticatedEmail(t *testing.T) {
	ctrl := gomock.NewController(t)
	database := mock_rest.NewMockDatabase(ctrl)
	server := rest.NewServer(database, nil, nil, nil, nil)

	response, err := server.AdminCreateEventNote(context.Background(), rest.AdminCreateEventNoteRequestObject{
		EventID: "event-1",
		Body:    &rest.AdminCreateEventNoteJSONRequestBody{Content: "note"},
	})
	if err != nil {
		t.Fatal(err)
	}
	if _, ok := response.(rest.AdminCreateEventNote401JSONResponse); !ok {
		t.Fatalf("response = %T, want unauthorized", response)
	}
}

func TestAdminCreateEventNoteMapsPersistenceErrors(t *testing.T) {
	tests := []struct {
		name         string
		err          error
		wantResponse any
	}{
		{name: "invalid content", err: consts.ErrInvalidEventNoteContent, wantResponse: rest.AdminCreateEventNote422JSONResponse{}},
		{name: "missing event", err: pgx.ErrNoRows, wantResponse: rest.AdminCreateEventNote404JSONResponse{}},
		{name: "unexpected database error", err: errors.New("database unavailable"), wantResponse: rest.AdminCreateEventNote500JSONResponse{}},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			ctrl := gomock.NewController(t)
			database := mock_rest.NewMockDatabase(ctrl)
			server := rest.NewServer(database, nil, nil, nil, nil)
			database.EXPECT().AddEventNote(gomock.Any(), "event-1", "note", "admin@example.org").Return(rest.EventNote{}, test.err)

			ctx := context.WithValue(context.Background(), rest.UserEmailKey{}, "admin@example.org")
			response, err := server.AdminCreateEventNote(ctx, rest.AdminCreateEventNoteRequestObject{
				EventID: "event-1",
				Body:    &rest.AdminCreateEventNoteJSONRequestBody{Content: "note"},
			})
			if err != nil {
				t.Fatal(err)
			}
			if reflectType(response) != reflectType(test.wantResponse) {
				t.Fatalf("response = %T, want %T", response, test.wantResponse)
			}
		})
	}
}

func TestEventNotePrivacyAcrossOtherProjections(t *testing.T) {
	publicEvent, err := json.Marshal(rest.ListEvent{Id: "event-1", Name: "Public event"})
	if err != nil {
		t.Fatal(err)
	}
	group, err := json.Marshal(rest.AdminEventGroup{Id: "group-1", Name: "Event group"})
	if err != nil {
		t.Fatal(err)
	}
	if strings.Contains(string(publicEvent), "notes") || strings.Contains(string(group), "notes") {
		t.Fatalf("notes leaked into public/group projections: event=%s group=%s", publicEvent, group)
	}
}

func reflectType(value any) string {
	return fmt.Sprintf("%T", value)
}
