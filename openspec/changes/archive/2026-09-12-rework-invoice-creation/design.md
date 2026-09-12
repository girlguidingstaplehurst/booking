## Context

The invoice preparation endpoint currently returns an email-keyed map of event rows. `InvoiceEvent` contains event name, times, hourly rate, and discount data, but not contact display names, event-group metadata, or per-session tiers. The React invoice card derives line items in the browser and submits editable descriptions and costs to the existing invoice endpoint. Event groups currently persist separate standard and per-session rate identifiers, while their child events are queried using the standard rate.

See `proposal.md` for the motivation and `specs/invoice-creation/spec.md` for the externally observable contract.

## Goals / Non-Goals

**Goals:**

- Return an explicit invoice-preparation model that supports contact-grouped individual invoices and single event-group invoices.
- Supply enough metadata for the admin UI to show contact and event context and calculate both hourly and progressive pricing.
- Keep invoice line descriptions and costs editable before submission.
- Preserve the existing invoice ownership semantics for multiple individual events and event groups.
- Give each event group one assigned rate whose per-session definition determines the invoice calculation mode.

**Non-Goals:**

- Do not change the persisted invoice item model or introduce a separate immutable quote model.
- Do not remove administrator editing of invoice descriptions or costs.
- Do not redesign rate-definition storage beyond consuming its existing two-tier per-session format.
- Do not change public booking or customer-facing event pricing.

## Decisions

### Use explicit preparation cards instead of an email-keyed response map

Replace the implicit `contact email -> events` response shape with preparation cards containing mode, contact email, contact name, event/group identity, session records, and rate data. This avoids making the UI infer mode from query parameters and allows contact names and group-level pricing to travel with the response.

The individual response remains grouped by contact: multiple selected events for the same contact are represented by one card and retain each event ID. A group request returns one card for the group and its child sessions. The submission body continues to carry event IDs for individual invoices or the event-group ID for group invoices. Submission persists each individual event in the invoice-event association table.

**Alternative considered:** Extend the existing map values with extra fields. This would preserve a brittle email-keyed protocol and still require a special representation for group metadata, so it is rejected.

### Join contacts and the assigned event-group rate while loading invoice preparation data

Individual event queries will join `booking_contacts` to return the contact display name. Group queries will join `booking_event_groups`, `booking_contacts`, and the single referenced rate to return group identity and pricing. Child session rows retain their identifiers and date-time boundaries.

The migration will replace `standard_rate` and `per_session_rate` on `booking_event_groups` with one `rate` foreign key. Existing groups will retain their standard-rate assignment as the new rate. A separate `booking_invoice_events` association table will preserve every individual event linked to a combined invoice. Existing invoice ownership data will be backfilled from the former `booking_invoices.event_id` value before that legacy single-event column is removed; group ownership remains on `booking_invoices.event_group_id`.

### Keep preparation calculations editable in the admin client

The preparation response will provide raw durations, rate definitions, discount data, and session counts. A focused invoice calculation layer in the admin UI will derive initial editable lines and total values. Deposit selection is local card state, defaults to false, and contributes one fixed deposit line when enabled.

This preserves the current product behavior that administrators can correct descriptions and costs before sending. The API remains responsible for validating associations and storing the submitted values; it does not silently overwrite administrator edits.

**Alternative considered:** Recalculate and overwrite costs during submission. This would conflict with the established editable-invoice workflow and make legitimate administrator adjustments impossible, so it is rejected.

### Apply separate calculation branches for individual, hourly-group, and progressive-group invoices

The calculator will use the event’s assigned hourly rate for individual events. It will retain the existing duration discount calculation for individual events and hourly group sessions.

For a group whose assigned rate has no per-session pricing, it will create one line per session with a date/time description and calculate duration multiplied by the assigned hourly rate, followed by any applicable discount line.

For a group with the existing two-tier definition, it will count child events as sessions and create:

```text
fixed line = first tier price
additional line = (session count - first tier count) * second tier price
```

The additional line is omitted when the difference is zero or negative. The progressive branch does not apply hourly duration or hourly discount calculations.

### Derive all group pricing from one assigned rate

The event-group form and request mapping will expose one rate choice. The selected rate’s existing `perSession` array determines whether the progressive or hourly group branch is selected. Existing groups are migrated from their current standard-rate value, and their old per-session-rate value is discarded because it is no longer an independent assignment.

### Regenerate contract-derived code from the API contract

The OpenAPI contract will be the source of truth for the preparation response and any request changes. Generated REST models, handlers, mocks, and test clients will be regenerated with the repository’s existing `go generate ./...` workflow rather than edited manually.

## Risks / Trade-offs

- [Risk] The new response contract breaks clients that expect an email-keyed map. -> The endpoint is an authenticated admin API used by the repository’s admin client; update the generated client and UI together, and cover the new response in API tests.
- [Risk] Browser-side calculations can diverge from future rate logic. -> Keep calculation functions small and covered by boundary tests for duration, discounts, exact tier counts, and extra sessions; treat the preparation response as the complete calculation input.
- [Risk] Existing event groups may have different standard and per-session rate identifiers. -> Migrate using the existing standard-rate assignment, record the discarded per-session association as an intentional model change, and verify the assigned rate’s own per-session definition controls invoicing.
- [Risk] Contact names can change after an invoice preparation response is loaded. -> Use the contact name as presentation data at preparation time and continue using the email as the invoice delivery/association identifier.
- [Risk] A combined individual invoice may contain events with different rates. -> Keep event-hire lines event-specific rather than collapsing them into one rate calculation.

## Migration Plan

1. Add database migrations that replace the event-group rate relationships with `rate` and create/backfill the invoice-event association table.
2. Update the OpenAPI contract and regenerate the generated Go artifacts and test client.
3. Deploy the migration, backend response/query changes, and admin UI calculator together.
4. Verify existing persisted invoices can still be retrieved and sent, including their backfilled event associations.
5. Roll back by deploying the previous application version only before the migrations, or restore the prior schema and application together if rollback is required after migration.

## Open Questions

None. The remaining behavior decisions were resolved during exploration: combined individual invoices, one deposit per invoice by default off, one assigned group rate, hourly group lines when its per-session definition is empty, two progressive lines when configured, and omission of a zero-value additional-session line.
