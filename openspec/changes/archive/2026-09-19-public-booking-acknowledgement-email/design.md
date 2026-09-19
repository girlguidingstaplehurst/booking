## Context

The public booking handler persists requests through the existing database abstraction and currently returns success immediately afterward. Email delivery is already abstracted by `EmailSender`, while Contentful email resources are exposed through `ContentManager.Email`. See proposal.md for the motivation and specs for the observable behavior.

## Goals / Non-Goals

**Goals:**

- Reuse the existing Contentful and email abstractions.
- Attempt acknowledgement delivery only after successful booking persistence.
- Keep the booking response successful when email lookup or delivery fails.
- Log failures with useful operational context while avoiding email body content.
- Preserve testability with the existing stub sender and handler mocks.

**Non-Goals:**

- No new endpoint, queue, retry worker, outbox, or database state for email delivery.
- No changes to the Contentful email schema or email template editing workflow.
- No acknowledgement for rejected, invalid, or duplicate bookings.

## Decisions

### Send synchronously after persistence, but isolate email errors

After `Database.AddEvent` returns success, the handler will load `event-name-booking-in-review` and send it to the booking contact address. Each content lookup or send error will be recorded and then ignored for the purpose of the HTTP response.

An asynchronous queue would improve delivery reliability, but there is no existing queue or outbox infrastructure and introducing one would expand this change substantially. Returning an error after persistence was rejected because it can cause clients to retry an already-created booking.

### Use the existing static Contentful email resource

The acknowledgement will call `ContentManager.Email`, not `EmailTemplate`, because the supplied resource identifier describes a static managed acknowledgement and no variable contract has been specified. This keeps the template entirely CMS-controlled without inventing placeholders.

### Log with structured context and no body

Failures will identify the operation, resource key, and recipient where available. The rendered subject and body will not be included in logs, reducing accidental disclosure of user-facing or personal content.

### Keep API and database contracts unchanged

The public API response remains HTTP 200 after a persisted booking, and no database schema or OpenAPI contract changes are needed. The behavior is implemented at the existing service boundary and verified with unit tests around the handler.

## Risks / Trade-offs

- [Email can still be lost after a transient failure] -> Keep this scope intentionally small; the logs provide observability, and a future outbox/retry change can build on the sender boundary.
- [Synchronous Contentful/SMTP calls add latency to booking submission] -> The calls use existing integrations and happen only after persistence; a future asynchronous delivery design can remove this latency if it becomes material.
- [Logging recipient email is personal data] -> Log only the minimum recipient context needed for diagnosis and never log the email body; follow the service's existing logging and retention controls.
- [Contentful may return no matching resource and currently indexing may panic] -> Ensure the handler treats any content manager error as non-fatal; a separate hardening change may improve empty-result handling inside the content manager.

## Migration Plan

Deploy the handler and test changes together. No data migration or API client migration is required. Rollback consists of reverting the application version; existing bookings remain unaffected, and the CMS resource can remain published.
