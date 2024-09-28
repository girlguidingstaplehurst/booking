package build

import (
	"embed"
)

//go:generate npm run build

//go:embed *
var Files embed.FS

//go:embed index.html
var IndexHTML embed.FS
