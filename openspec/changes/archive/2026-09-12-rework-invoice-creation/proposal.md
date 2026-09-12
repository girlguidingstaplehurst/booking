## Why

The current invoice workflow always groups events by contact email, automatically adds a fixed cleaning deposit for individual events, and calculates group sessions as hourly events. It does not expose enough event-group metadata to present clear invoice context or apply the configured progressive per-session pricing, making invoice preparation error-prone and opaque.

## What Changes

- Define separate individual-event and event-group invoice preparation modes.
- Keep individual invoices combined by contact, show the contact and selected event names, and add an optional cleaning deposit that is off by default and charged once per invoice.
- Calculate individual event hire using the assigned hourly rate and existing duration discount behavior.
- Calculate group invoices using either progressive per-session pricing or one hourly line per session based on the single rate assigned to the event group.
- Show progressive group pricing as a fixed first-tier line plus an additional-session line only when extra sessions exist.
- Include contact names, event/group names, session metadata, and assigned pricing data in the invoice preparation response.
- Preserve multiple event links on a single persisted invoice and retain editable invoice line items.
- Add an explicit invoice-to-event association so one individual invoice can retain every linked event.

## Capabilities

### New Capabilities

- `invoice-creation`: Prepare individual and event-group invoices with explicit context, optional deposits, hourly session charges, and progressive per-session pricing.

### Modified Capabilities

<!-- No existing capability currently defines invoice-generation behavior. -->

## Impact

- React admin invoice creation screen and editable invoice card.
- Versioned invoice preparation and invoice submission API contracts, including generated client/server models.
- PostgreSQL invoice-event and event-group rate queries.
- Event-group schema and rate assignment flow, replacing the separate standard and per-session rate fields with one assigned rate.
- Invoice calculation and presentation tests, API tests, and any PDF/invoice metadata handling affected by the new context.
- Invoice persistence schema and submission logic for many-to-one invoice/event associations.
