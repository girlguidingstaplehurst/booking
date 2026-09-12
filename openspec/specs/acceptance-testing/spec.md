# acceptance-testing Specification

## Purpose

Provide repeatable browser-level acceptance coverage that verifies user-visible workflows and the PostgreSQL state produced by the running service in a disposable environment.

## Requirements

### Requirement: Acceptance tests consume the running E2E environment

The acceptance-test command MUST target the service at `localhost:8080` and MUST NOT start, stop, or reset the Skaffold, Kubernetes, container, or PostgreSQL environment.

#### Scenario: Service is unavailable
- **WHEN** the acceptance-test command cannot reach the service at `localhost:8080`
- **THEN** it fails before running browser workflows and reports that the externally managed environment is unavailable

#### Scenario: Service is available
- **WHEN** the service is reachable and its database-backed API is ready
- **THEN** the acceptance-test command launches the browser suite against that service

### Requirement: Workflows are exercised through the rendered application

The acceptance suite MUST drive representative public and authenticated admin workflows through the rendered web page and the service HTTP API rather than replacing application requests with mocks.

#### Scenario: Public booking workflow succeeds
- **WHEN** a browser submits a valid public booking through the booking page
- **THEN** the suite observes the resulting success behavior in the page and verifies the corresponding booking data in PostgreSQL

#### Scenario: Admin management workflow succeeds
- **WHEN** an authenticated browser creates or updates a supported admin resource through its page
- **THEN** the suite observes the updated page behavior and verifies the persisted resource state in PostgreSQL

### Requirement: Database assertions use the running service database

Acceptance tests MUST assert durable outcomes against the same ephemeral PostgreSQL database used by the running service and MUST NOT implement table truncation or application-level database reset as test cleanup.

#### Scenario: Persistent state is produced
- **WHEN** a browser workflow completes successfully
- **THEN** the database assertion reads the resulting records from the service database

#### Scenario: Test finishes
- **WHEN** the acceptance suite exits
- **THEN** it leaves environment lifecycle and database disposal to the external Skaffold/Kubernetes runner

### Requirement: Test failures provide browser diagnostics

The acceptance suite MUST retain sufficient browser diagnostics, including a failure trace or screenshot, to investigate a failed workflow without rerunning it interactively.

#### Scenario: Browser assertion fails
- **WHEN** a page assertion, navigation, or browser action fails
- **THEN** the test result includes the failure details and configured browser diagnostics

### Requirement: External side effects are safe for acceptance runs

The E2E environment and initial acceptance workflows MUST prevent CAPTCHA and email actions from contacting production services or sending real messages.

#### Scenario: CAPTCHA is exercised in the public workflow
- **WHEN** the public workflow submits its form in the E2E environment
- **THEN** CAPTCHA does not require a live Google verification service

#### Scenario: A workflow could send email
- **WHEN** an acceptance workflow reaches an email-producing action
- **THEN** the action is either excluded from the initial suite or routed to a non-delivering test implementation
