## Context

The Dashboard builds named sections from normalized event and event-group data,
then passes each section title to shared `eventCard` and `eventGroupCard`
renderers. The group card currently renders its event-group invoice link for
every section, while the remaining-session section conditionally renders only
the group review link. The existing event-group review page separately exposes
the group invoice workflow.

## Goals / Non-Goals

**Goals:**

- Make the remaining-session group card's actions match its review-focused
  purpose.
- Keep direct group invoice creation available from `Events to be invoiced`.
- Preserve the existing group review route and invoice preparation route.
- Add focused rendering coverage for both section contexts.

**Non-Goals:**

- Changing event-group invoice eligibility or invoice calculations.
- Changing the event-group review page or its `Create New Invoice` action.
- Changing API responses, routes, database behavior, or styling systems.

## Decisions

- **Gate the existing group invoice action by section context.** The shared
  renderer already receives `sectionTitle`, and the requested behavior applies
  only to one Dashboard section. A section-context condition is smaller and
  safer than changing normalized data or adding a new event-group state. The
  alternative of removing invoice creation from all group cards would break
  the direct workflow in `Events to be invoiced`.
- **Retain the existing review condition and routes.** Remaining-session cards
  continue to link to `/admin/review-group/<group id>`, and invoice-eligible
  cards continue to link to `/admin/create-invoice?eventGroup=<group id>`.
  Reusing these routes avoids any API or navigation changes.
- **Test the user-visible link set by section.** Dashboard tests should render
  data that places a group in both relevant sections, scope assertions to each
  section, and verify absence/presence of the invoice link. This prevents a
  global query from passing because the other section still contains the
  expected action.

## Risks / Trade-offs

- [Risk] Section-title string comparisons can become fragile if titles are
  renamed. -> Mitigation: keep the existing section-title pattern for this
  focused change and cover the exact labels in regression tests.
- [Risk] A group without invoices and with remaining sessions may appear in
  both Dashboard sections, producing two cards with intentionally different
  actions. -> Mitigation: scope the rule to the rendered section, as required;
  the invoice-preparation card remains the direct entry point and the
  remaining-session card remains the review entry point.
