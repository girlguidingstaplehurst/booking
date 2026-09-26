## Context

The existing invoice-detail endpoint returns invoice metadata and item description/cost fields, while `ManageInvoice` renders only metadata. Invoice ownership is stored at the invoice level through event and event-group associations; individual item-to-event associations are not retained. The review response should expose that invoice-level ownership without attempting to infer relationships for individual lines.

## Goals / Non-Goals

**Goals:**

- Extend the invoice-detail response with sufficient structured event/event-group data for the invoice header.
- Render associated name and date/time information alongside invoice lines.
- Calculate and display a GBP-formatted invoice total from item costs.
- Preserve invoices without an event or event-group association.
- Preserve existing invoice payment actions and behavior.

**Non-Goals:**

- Recalculating or changing invoice prices after submission.
- Adding a persisted invoice total to the database.
- Adding editing, resending, or deleting capabilities to the invoice review screen.
- Fetching event/session data through separate frontend requests.

## Decisions

- **Return structured association data at invoice level.** Extend the API model with optional associated events and event-group summaries containing IDs, names, and start/end timestamps. This matches the persisted ownership model and avoids inventing item-level relationships. Returning the data in the existing invoice response keeps the review self-contained.

- **Load associations in the existing invoice lookup.** Update the database read used by the invoice-detail endpoint to load invoice event associations and the optional event-group association separately from item loading. This avoids duplicating invoice items when an invoice has multiple events.

- **Compute the total in the review UI.** The total is derived from the response item costs, matching the existing invoice preparation behavior. No schema or migration is needed for a stored total, and the displayed value remains consistent if the API returns edited item costs.

- **Use the existing GBP formatting convention.** The review screen will use the same `Intl.NumberFormat` GBP presentation as invoice preparation, including two decimal places and negative values where applicable.

- **Keep association display optional.** The item table will render description and cost for every item, while the invoice header will show association details only when the invoice response provides them.

## Risks / Trade-offs

- **[Risk] Existing invoices may contain associations that cannot be resolved.** -> Mitigation: keep the invoice and all items visible and treat association summaries as optional.
- **[Risk] An invoice may have multiple associated events.** -> Mitigation: load events independently from item rows and render a list in the invoice header.
- **[Risk] Extending the OpenAPI model requires generated files to stay synchronized.** -> Mitigation: update the contract first and run the repository's generation workflow during implementation; do not hand-edit generated output.
- **[Trade-off] Event/session summaries add data to the invoice-detail response.** -> This avoids multiple frontend requests and makes the review screen reliable at the cost of a modestly larger response.
