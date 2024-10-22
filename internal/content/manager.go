package content

import (
	"context"
	"strings"

	"github.com/girlguidingstaplehurst/booking/internal/rest"
	"github.com/gomarkdown/markdown"
	"github.com/gomarkdown/markdown/html"
	"github.com/gomarkdown/markdown/parser"
	"github.com/shurcooL/graphql"
	"golang.org/x/oauth2"
)

type Manager struct {
	client       *graphql.Client
	mdParser     *parser.Parser
	htmlRenderer *html.Renderer
}

func NewManager(url, token string) *Manager {
	src := oauth2.StaticTokenSource(&oauth2.Token{AccessToken: token})
	httpClient := oauth2.NewClient(context.Background(), src)

	extensions := parser.CommonExtensions | parser.AutoHeadingIDs | parser.NoEmptyLineBeforeBlock
	mdParser := parser.NewWithExtensions(extensions)

	htmlFlags := html.CommonFlags | html.HrefTargetBlank
	opts := html.RendererOptions{Flags: htmlFlags}
	htmlRenderer := html.NewRenderer(opts)

	return &Manager{
		client:       graphql.NewClient(url, httpClient),
		mdParser:     mdParser,
		htmlRenderer: htmlRenderer,
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

	mdBody := strings.Replace(string(i.Body), "\\n", "\n", -1)
	doc := m.mdParser.Parse([]byte(mdBody))
	htmlBody := markdown.Render(doc, m.htmlRenderer)

	return rest.EmailContent{
		Subject: string(i.Subject),
		Body:    string(htmlBody),
	}, nil
}
