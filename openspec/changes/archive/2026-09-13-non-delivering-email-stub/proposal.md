## Why

Browser acceptance workflows can reach email-producing actions, but the running E2E deployment currently wires the production SMTP sender without SMTP configuration. This can cause workflows to fail or, if production credentials are supplied accidentally, send real messages during tests.

## What Changes

- Add a recording, non-delivering email sender for test environments.
- Select the non-delivering sender explicitly in the E2E service configuration.
- Preserve the existing SMTP sender for production deployments.
- Record recipients, subjects, bodies, and attachment metadata/content so Go tests can assert email behavior without contacting an SMTP server.
- Add tests covering recorded messages, attachments, and the E2E wiring behavior.

## Capabilities

### New Capabilities

- `email-delivery-safety`: Prevent email-producing test workflows from contacting external mail services while retaining observable message behavior for tests.

### Modified Capabilities

- None.

## Impact

- Affected Go code: email sender implementations and service configuration wiring.
- Affected deployment configuration: the E2E Kubernetes deployment.
- Affected tests: email sender unit tests and acceptance/integration coverage for email-producing workflows.
- No public API contract or production SMTP behavior changes.
