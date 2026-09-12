## Context

The React application stores the Google ID token in `sessionStorage["token"]`, decodes its payload in the browser, and sends it as a bearer token through admin fetch and mutation helpers. The Go service currently validates Google ID tokens in middleware mounted at `/api/v1/admin`, checks allowed hosted domains, and runs migrations before listening on port `8080`. Existing local Skaffold resources provide an ephemeral PostgreSQL deployment, disable CAPTCHA, and port-forward the service and database, but do not define a separate E2E authentication mode.

The acceptance command will consume an already-running Skaffold environment. PostgreSQL freshness is an environment invariant: the test suite will not truncate tables or manage database lifecycle.

## Goals / Non-Goals

**Goals:**

- Exercise the real browser, embedded frontend, REST middleware, service handlers, and PostgreSQL persistence.
- Provide stable unattended authentication without automating Google.
- Keep normal local and production authentication behavior unchanged.
- Make environment and readiness failures clear before browser workflows begin.
- Preserve browser traces, screenshots, and other diagnostics on failures.
- Start with workflows whose external effects can be safely disabled or isolated.

**Non-Goals:**

- Automating Google sign-in or testing Google’s login UI.
- Replacing unit or direct API integration tests.
- Starting or stopping Skaffold, Kubernetes, Docker, or PostgreSQL from Playwright.
- Resetting database tables from the test suite.
- Adding a production authentication bypass.
- Covering email-producing invoice and approval workflows until their side effects have a non-delivering test path.

## Decisions

### Use an explicit E2E authentication mode

Add a service configuration mode that defaults to Google authentication and is enabled only by the dedicated E2E environment. Configuration should include an exact test bearer credential. In E2E mode, the admin middleware compares the supplied credential with the configured value and assigns a fixed test identity; it does not call Google. Missing credentials and unknown modes fail startup.

An exact configured credential is preferred over accepting arbitrary unsigned JWTs because it keeps the local bypass narrow and simple. A locally signed token can be considered later if the test environment needs generated credentials, but it is not necessary for the initial contract.

The credential must still be JWT-shaped because the current frontend decodes the token payload. The test credential is supplied through environment configuration and is never committed to the repository.

### Isolate E2E deployment configuration

Use a distinct Skaffold profile or Kubernetes overlay for E2E configuration rather than enabling E2E auth in the ordinary local deployment. The E2E configuration will set the auth mode and shared credential, retain CAPTCHA disabled, and continue to use an ephemeral PostgreSQL deployment with the existing port-forwards.

This prevents a normal developer environment from accidentally accepting the test credential while allowing the E2E command to assume a predictable environment contract.

### Inject authentication before page startup

Playwright will create a browser context and use an initialization script to set the configured JWT-shaped credential in `sessionStorage` before navigating to `/admin`. This exercises the existing React auth provider, route guard, admin loaders, bearer-header helpers, and backend middleware without touching the Google login UI.

Using a reusable Google `storageState` was rejected because Google ID tokens expire and automated provider login is unreliable. A hidden frontend login control was rejected because it would create a second application authentication path.

### Keep environment lifecycle outside the test runner

The Playwright command will validate that `localhost:8080` is reachable and that a database-backed public endpoint responds before launching tests. It will not invoke Skaffold or Kubernetes commands and will leave the environment intact after a failure for inspection.

The test runner will read the E2E credential from its environment and will fail if it is absent. It may verify the service mode through an explicit readiness contract or a deliberately safe probe; it must not infer readiness solely from the existence of the frontend HTML.

### Assert persistence directly

Browser assertions will verify visible outcomes, while PostgreSQL queries will verify durable state using the same database connection target exposed to the E2E environment. Initial journeys should include public booking and admin resource workflows such as rates, keyholders, and event creation where email is not required.

Database cleanup is intentionally omitted. Each run is expected to begin with a newly launched disposable PostgreSQL instance, and environment teardown/recreation remains the responsibility of Skaffold/Kubernetes orchestration.

### Keep external effects out of the first suite

The E2E environment will keep CAPTCHA disarmed as in the current local deployment. Tests that would send email will either be deferred or require a non-delivering sender configuration before inclusion. This avoids making acceptance results depend on Contentful, SMTP, Google CAPTCHA, or real recipients.

## Risks / Trade-offs

- [A local auth mode could be enabled accidentally] -> Keep Google auth as the default, isolate E2E deployment configuration, fail on unknown modes, and require an explicit credential.
- [An exact test credential is not cryptographically strong] -> Restrict the mode to disposable local E2E environments and never enable it in production; consider signed credentials if the environment boundary changes.
- [A reused database invalidates test assumptions] -> Make fresh PostgreSQL startup part of the Skaffold/CI contract and do not hide the problem with test-level truncation.
- [The service may be reachable before migrations finish] -> Require a database-backed readiness probe before launching Playwright.
- [Direct database assertions couple tests to schema details] -> Keep assertions focused on durable business outcomes and use the existing migrations/schema as the explicit E2E contract.
- [External content or email can make workflows flaky] -> Exclude those journeys initially or provide non-delivering test doubles before adding them.
