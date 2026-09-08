# Repository Guide

## Structure

- `cmd/booking` is the Go service entrypoint; it serves the embedded React app from `build/` and the versioned API under `/api/v1`.
- `src/` is the React frontend. `internal/` contains the Go service, REST handlers, integrations, and configuration; `db/migrations` contains SQL migrations embedded into the binary.
- `api/public-api.yaml` is the API contract. Generated REST, model, mock, and test-client files are produced by `go generate` and should not be hand-edited.

## Commands

- Frontend dependencies use `npm ci`; use `npm start` for the React dev server and `npm run build` to regenerate the production frontend in `build/`.
- Run all generation from the repository root with `go generate ./...` (or `mage generate`); this includes the frontend build, OpenAPI codegen, mocks, and test client/builders.
- Run Go tests with `go test ./...`; run the frontend test suite with `npm test -- --watchAll=false`, or focus it with `npm test -- --watchAll=false ShowCalendar.test.js`.
- Run the service directly with `go run ./cmd/booking` (or `mage run`); it listens on port `8080` and requires a reachable PostgreSQL `DATABASE_URL` because migrations run at startup.
- `mage dev` runs `skaffold dev`, which builds with ko, deploys `deploy/k8s/local`, and port-forwards the app to `localhost:8080` and PostgreSQL to `localhost:5432`.

## Workflow Notes

- When changing `api/public-api.yaml`, run `go generate ./...` before compiling or testing; generated files are expected to match the contract.
- The service reads `DATABASE_URL`, `GOOGLE_CLIENT_ID`, `SMTP_SERVER`, `SMTP_USERNAME`, `SMTP_PASSWORD`, and `GOOGLE_RECAPTCHA_SECRET`; set `CAPTCHA_ARMED=false` when local testing should bypass CAPTCHA.
- Integration tests under `internal/test` use the generated client and require the configured service/database; they are not equivalent to the isolated package tests.
- CI deploys only on pushes to `main`; it builds multi-architecture images with ko and updates the production Kubernetes and Azure image references automatically.
