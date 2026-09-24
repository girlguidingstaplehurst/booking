## Context

The public booking handler currently loads `event-name-booking-in-review` with the content manager's non-templated email method and sends the returned subject/body unchanged. The content manager already provides a templated email method based on Go's `text/template`; other administrative email flows pass an `event` value and formatted date into that method.

The public request contains the event and contact data needed by the acknowledgement template. The existing public booking contract also treats post-persistence content and delivery failures as non-fatal.

## Goals / Non-Goals

**Goals:**

- Render the public acknowledgement's managed subject and body before sending.
- Provide the template with the event/contact values and date expected by the published content.
- Preserve the existing post-persistence failure handling and privacy-safe logging.
- Add focused regression tests for handler wiring and rendered output.

**Non-Goals:**

- Changing the public booking API or database schema.
- Changing the general template engine or CMS content model.
- Changing acknowledgement delivery timing or retry behavior.
- Changing other email workflows.

## Decisions

1. **Reuse the existing templated content-manager path.**
   The handler will call `EmailTemplate` rather than introducing a second renderer or manually replacing placeholders. This keeps public acknowledgement behavior consistent with the existing administrative email flows and preserves template parse/execute error handling. Direct string replacement was rejected because it would duplicate template semantics and mishandle future variables.

2. **Pass the submitted booking data as the template event context.**
   The handler will provide an `event` value containing the fields exposed by the public request, including the event name and contact, and a date formatted with the service's existing email date format. Reloading the event from the database was rejected because the acknowledgement only needs submitted values and adding a read would increase coupling and failure surface after the booking has already succeeded.

3. **Keep rendering failures non-fatal after persistence.**
   Template lookup, parsing, and execution failures will follow the existing acknowledgement failure path: log operation/resource/recipient context without logging subject or body, then return HTTP 200. This maintains the booking availability guarantee while making rendering failures observable.

4. **Test the integration at the handler boundary and the rendering behavior.**
   The public booking test double will record the template key and variables, and tests will assert the expected event/date context. Content-manager tests will cover resolving the relevant fields so a future change cannot silently reintroduce literal placeholders.

## Risks / Trade-offs

- [Template field shape mismatch] -> Use the same field names and value shape expected by the published content (`event.Name`, `event.Contact`, and `date`), and assert them in tests.
- [Date formatting differs from CMS expectations] -> Reuse the existing `emailDateFormat` convention used by other booking emails.
- [Rendering failure is hidden from the caller] -> Preserve HTTP 200 as required, but log the failed operation with resource and recipient context while excluding message content.
- [Public request data may differ from persisted event data] -> Keep the template scope limited to values submitted by the booking request; do not expand this change to a database read unless implementation inspection shows those fields are unavailable.
