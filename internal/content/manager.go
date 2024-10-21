package content

import (
	"context"

	"github.com/girlguidingstaplehurst/booking/internal/rest"
	"github.com/shurcooL/graphql"
	"golang.org/x/oauth2"
)

type Manager struct {
	client *graphql.Client
}

func NewManager(url, token string) *Manager {
	src := oauth2.StaticTokenSource(&oauth2.Token{AccessToken: token})
	httpClient := oauth2.NewClient(context.Background(), src)

	return &Manager{
		client: graphql.NewClient(url, httpClient),
	}
}

func (m *Manager) Email(ctx context.Context, key string) (rest.EmailContent, error) {
	var q struct {
		EmailCollection struct {
			Items []struct {
				Subject graphql.String
				Body    graphql.String
			}
		} `graphql:"emailCollection(preview: false, limit: 1, where: { name: $name })"`
	}

	err := m.client.Query(ctx, &q, map[string]any{"name": graphql.String(key)})
	if err != nil {
		return rest.EmailContent{}, err
	}

	i := q.EmailCollection.Items[0]

	return rest.EmailContent{
		Subject: string(i.Subject),
		Body:    string(i.Body),
	}, nil
}
