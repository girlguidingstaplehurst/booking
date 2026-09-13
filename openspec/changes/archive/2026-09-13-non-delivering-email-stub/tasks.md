## 1. Recording Email Sender

- [x] 1.1 Add a non-delivering `rest.EmailSender` implementation that records recipient, subject, body, and ordered attachments while performing no network I/O; verify it satisfies the interface at compile time
- [x] 1.2 Snapshot attachment filename, MIME type, and content during send, protect recording and inspection from concurrent access, and define test-safe inspection/reset behavior; verify with unit tests for messages with and without attachments, repeated sends, and unreadable readers
- [x] 1.3 Preserve the existing SMTP sender behavior and add regression coverage showing the production sender path remains selected when test mode is not configured; verify with the email package test suite

## 2. Service Configuration

- [x] 2.1 Add explicit email transport mode selection in service wiring, defaulting to SMTP and selecting the recorder only for the named test mode; verify unsupported modes fail startup rather than silently selecting a transport
- [x] 2.2 Update the E2E Kubernetes deployment to select the non-delivering email mode without adding SMTP credentials or an external mail service; verify the rendered E2E manifests contain the test mode and no production SMTP secret references

## 3. Workflow Verification

- [x] 3.1 Exercise existing email-producing REST workflows with the recorder and assert recorded recipient, subject, body, and attachment data in Go tests; verify failures are not caused by missing SMTP settings
- [x] 3.2 Run the browser acceptance suite against the E2E deployment and verify the public booking and relevant admin workflows complete successfully, persist their database state, and do not require external email delivery
- [x] 3.3 Run `go test ./...` and the configured Playwright acceptance command, recording any environment prerequisites separately from implementation failures
