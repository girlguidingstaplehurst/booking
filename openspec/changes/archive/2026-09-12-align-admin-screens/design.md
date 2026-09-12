## Context

The Rates screens introduced `PageHeader` as the newest admin visual pattern. The Dashboard and the event/invoice workflow screens still use breadcrumb-first layouts, ad hoc headings, and mixed Chakra button/card styles. The Dashboard renders invoice payment buttons without an action handler, while the existing invoice detail screen already uses the authenticated mark-paid endpoint and route revalidation.

The backend already returns invoice arrays for normal Dashboard responses and exposes the payment operation used by `ManageInvoice`; no API or database changes are required.

## Goals / Non-Goals

**Goals:**

- Make all Dashboard-linked admin screens feel like one application while preserving their current routes and workflows.
- Reuse the existing Rates `PageHeader` direction rather than introducing a second page-shell system.
- Keep forms, cards, invoice tables, and the calendar usable on narrow screens.
- Give Dashboard payment actions the same authenticated behavior and refresh semantics as invoice management.
- Treat absent optional invoice collections as empty collections at the presentation boundary.

**Non-Goals:**

- Redesign the public-facing site.
- Change rate, event, invoice, or database APIs.
- Change invoice status rules or add new invoice operations.
- Add a separate design-system package or introduce a new UI dependency.

## Decisions

### Use `PageHeader` as the shared admin page shell

Extend the existing `PageHeader` usage to the Dashboard-linked screens. The event creation, event-group creation, Review Event, and Create Invoice screens do not retain redundant breadcrumb trails because their page headers already provide the current context. Page-specific actions belong in the header when they are primary actions, with content sections below it.

Alternative considered: retain breadcrumbs and tune each screen independently. This would preserve more existing markup but perpetuate the inconsistency that the change is intended to remove.

### Keep page-specific content components local unless reuse is proven

Use the existing shared `PageHeader`, `RoundedButton`, and Chakra primitives. Refactor repeated event/invoice card details only where it reduces a concrete Dashboard rendering risk or keeps the two card variants behaviorally aligned; do not introduce a large generic card abstraction solely for visual similarity.

Alternative considered: build a generalized admin component library first. That adds indirection and scope without evidence that the current screens need a separate package.

### Reuse the existing mark-paid API flow

The Dashboard payment action should call the same authenticated operation already used by `ManageInvoice`, track an invoice-specific loading state, handle a failed response without optimistic removal, and revalidate or otherwise refresh the Dashboard loader data after success. If a small shared helper is extracted, it should own request/result handling rather than duplicate endpoint strings.

Alternative considered: optimistically remove the invoice from the Dashboard. This would make failure recovery harder and could display stale state, so server-confirmed refresh is preferred.

### Normalize invoice collections before filtering and rendering

Treat missing or null `invoices` values as empty arrays at the Dashboard data boundary or in the section/card helpers. Filtering and rendering should use the normalized value consistently, including event groups.

Alternative considered: rely on the API schema and SQL defaults. The schema marks these fields optional and fallback/test data can omit them, so defensive presentation handling is low-cost and prevents avoidable UI failures.

### Verify responsive behavior through focused component tests and build checks

Add tests for the pure Dashboard invoice normalization/action helpers where practical, and render-level tests for the shared page structure or key labels/actions where existing test setup supports them. Use the frontend test suite and production build to catch Chakra/router integration regressions.

## Risks / Trade-offs

- [Risk] Moving actions into headers may reduce usable width on small screens -> Use wrapping or stacked header layout at the base breakpoint and verify with a production build/render test.
- [Risk] Refreshing Dashboard data after payment may make the interaction feel slower -> Keep a per-invoice loading state and disable only the active action while the request is pending.
- [Risk] Existing fallback loaders hide API shape issues -> Explicitly test absent invoice fields rather than relying only on fallback fixtures.
- [Risk] Reusing the same page header across forms could make long form pages feel visually top-heavy -> Keep the header compact and preserve section/card hierarchy below it.

## Migration Plan

No data migration or API rollout is needed. Deploy the frontend changes with the existing service. Rollback is the normal frontend deployment rollback; existing routes and backend operations remain compatible.
