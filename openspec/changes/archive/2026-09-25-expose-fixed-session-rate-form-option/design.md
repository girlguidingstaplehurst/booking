## Context

The existing React rate editor already models `fixedSession` in its validation schema, initial values, request-body builder, and conditional field rendering. The pricing radio group is the missing connection: it currently offers only hourly and progressive per-session choices, so a new rate cannot enter the fixed-session branch. Existing API, persistence, invoice, summary, and selector behavior is outside this change.

## Goals / Non-Goals

**Goals:**

- Make fixed-session pricing selectable in the existing rate editor.
- Keep the existing mode-specific conditional rendering and validation behavior intact.
- Add focused tests proving fixed-session creation and edit initialization work through the form's current data helpers and UI.

**Non-Goals:**

- Changing the public API or generated clients.
- Changing database persistence, invoice calculation, rate selectors, or pricing semantics.
- Introducing a new form component or changing the form library.

## Decisions

### Add the missing radio choice to the existing pricing group

Add a fixed-session option alongside the current hourly and progressive options, using wording that communicates the charge is a fixed amount per session. This is preferred over inferring the mode from the presence of a price field because the API and form already use an explicit `pricingMode` discriminator.

**Alternative considered:** Automatically show fixed-session controls based on edit data only. Rejected because it would fix editing but leave new fixed-session rate creation impossible.

### Reuse existing fixed-session form plumbing

Do not alter the established `rateSchema`, `rateFormValues`, `buildRateBody`, or conditional field branch unless tests reveal a defect. Once the radio option sets `pricingMode` to `fixedSession`, the existing session-price validation and payload mapping provide the intended behavior.

**Alternative considered:** Add a separate submission path for fixed-session rates. Rejected because it would duplicate already-supported request construction and increase regression risk.

### Test behavior at both helper and rendered-form levels

Extend focused tests to cover fixed-session body construction, edit initialization, summary/validation expectations where appropriate, and selecting the option in the rendered editor. This verifies both the data contract and the user-visible path that currently fails.

## Risks / Trade-offs

- [Risk] A label change could make existing UI-based tests or acceptance selectors brittle. -> Use a stable, descriptive accessible label and update focused tests to target that label; avoid changing unrelated labels.
- [Risk] The production embedded frontend remains stale after source changes. -> Include the normal frontend build refresh in implementation tasks, without changing build artifacts during this planning phase.
- [Risk] Existing fixed-session backend support may appear complete while the UI regression is unnoticed. -> Keep tests explicitly asserting the fixed-session radio option is rendered and can submit the mode.
