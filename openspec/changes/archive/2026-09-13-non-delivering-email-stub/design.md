## Context

The REST layer already depends on the `EmailSender` interface, and production wiring currently constructs the SMTP-backed sender unconditionally. Email-producing handlers return sender errors before completing their associated state transition. The E2E Kubernetes overlay selects E2E authentication but currently does not select a safe email transport.

## Goals / Non-Goals

**Goals:**

- Add an in-process email sender implementation that never performs network I/O.
- Preserve a complete, ordered recording of messages for Go-level assertions.
- Make test transport selection explicit in service configuration and E2E deployment configuration.
- Preserve the current SMTP sender and production wiring behavior when the test mode is not selected.

**Non-Goals:**

- Adding an SMTP server or mail-capture service to the E2E Kubernetes environment.
- Exposing recorded messages through a public or administrative HTTP endpoint.
- Changing email templates, recipients, handler ordering, or production delivery semantics.
- Making Playwright tests inspect Go process memory directly.

## Decisions

### Use the existing email interface as the seam

Implement the recorder behind `rest.EmailSender` rather than changing REST handlers. This keeps the existing dependency-injection boundary and makes the same implementation usable by service-level tests and the running E2E service.

An SMTP sink was considered, but it adds infrastructure, readiness, and lifecycle complexity while the requirement is to prevent delivery. A handler-level bypass was rejected because it would duplicate email decisions across workflows and reduce coverage of the real email path.

### Select the transport with an explicit configuration value

Add a dedicated email mode configuration, with SMTP remaining the default and a named stub mode enabled by the E2E deployment. Selection must not be inferred only from authentication mode; authentication and email delivery are independent concerns.

Invalid or unsupported modes should fail service startup rather than silently falling back to a potentially unsafe transport.

### Snapshot attachment content when recording

The recorder will read each attachment into owned data at send time and store filename, MIME type, and bytes. This avoids retaining one-shot `io.Reader` values and lets tests assert exact attachment content after the send call returns. The sender will preserve message order and provide a test-safe way to inspect or reset the recorded messages.

### Keep acceptance observability indirect

The recorder's in-memory state is intended for Go tests. Playwright acceptance tests run in a separate process and will assert workflow success and database state, not directly inspect the recorder. If later acceptance requirements need email-content assertions, that can be a separate capability rather than adding a test-only public endpoint now.

## Risks / Trade-offs

- [A test configuration omission could leave SMTP selected] -> Make the E2E overlay set the stub mode explicitly and add configuration-selection tests.
- [In-memory recordings are lost when the service exits] -> Use them for synchronous Go assertions only; do not treat them as an audit trail.
- [Reading attachments can increase memory use] -> This is limited to the non-delivering test implementation and the small messages used by current workflows.
- [A recorder shared across concurrent sends could race] -> Protect recording and inspection with synchronization and test concurrent behavior where relevant.

## Migration Plan

No data migration is required. Deploy the service code with the new mode selection, update only the E2E overlay to select the recorder, and verify production overlays continue selecting SMTP. Rollback consists of reverting the service and E2E configuration changes together.
