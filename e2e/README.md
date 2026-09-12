# Browser Acceptance Tests

The acceptance tests consume an already-running Skaffold environment. They do
not start or stop Skaffold, delete Kubernetes resources, or reset PostgreSQL.

## Start the E2E Environment

Create a JWT-shaped local credential outside the repository. Its payload must
contain `email` and `hd` claims. The token is not cryptographically verified
in E2E mode; the service accepts only the exact value stored in the Kubernetes
Secret below.

```sh
export BOOKING_AUTH_E2E_TOKEN="<jwt-shaped-local-test-token>"
kubectl create namespace booking --dry-run=client -o yaml | kubectl apply -f -
  --from-literal=token="$BOOKING_AUTH_E2E_TOKEN" \
  --dry-run=client -o yaml | kubectl apply -f -
skaffold dev --profile e2e
```

The E2E profile uses an ephemeral PostgreSQL deployment, applies migrations at
service startup, disables CAPTCHA, and port-forwards the service and database
to `localhost:8080` and `localhost:5432`. Recreate the PostgreSQL pod or
environment before each run when a clean database is required.

## Run the Tests

In a second shell, provide the same token and the host-side PostgreSQL URL:

```sh
export BOOKING_AUTH_E2E_TOKEN="<same-token-as-the-kubernetes-secret>"
export E2E_DATABASE_URL="postgresql://postgres:password@localhost:5432/postgres?sslmode=disable"
npm run e2e
```

The test command waits for the database-backed API and authenticated admin API
to respond before launching Chromium. It leaves the environment running after
failures. Playwright traces, screenshots, video, and the HTML report are
written under `test-results/` and `playwright-report/` as appropriate.

The initial suite covers public booking, rates, keyholders, and admin event
creation. It does not run invoice or approval workflows because those actions
can send email or depend on external content.
