## Context

The shared `RateSelect` currently fetches and renders every rate definition, while both creation forms use it directly and `ReviewEvent` reaches it through `RateUpdater`. Rate definitions identify progressive pricing with a non-empty `perSession` array; hourly-only definitions have an empty or absent `perSession` array. The two creation forms also use different submit-button implementations and currently have different Event Details validation rules.

## Goals / Non-Goals

**Goals:**

- Make rate-selection policy explicit at each usage site without changing the rates API or rate-definition model.
- Keep progressive rates available for event groups while preventing new progressive-rate selections for individual events.
- Preserve an already-assigned progressive rate during individual event review as a disabled current option.
- Align the two creation-form primary actions without removing their distinct labels.
- Add testable coverage for validation, filtering, legacy selection handling, and presentation.

**Non-Goals:**

- Changing rate definitions, rate-editor behavior, invoice calculations, or API validation.
- Adding event-group review or a new route.
- Migrating existing events or changing an existing event's assigned rate automatically.

## Decisions

### Use an explicit hourly-only selector mode

Add an optional selector policy that defaults to showing all rates. Individual event creation and `ReviewEvent` opt into hourly-only behavior; event-group creation keeps the default. A rate is classified as hourly-only by an empty or absent `perSession` array, matching the existing API/domain representation. Filtering by `hourlyRate > 0` is rejected because the API allows a non-negative hourly price, including zero, and pricing mode is represented by `perSession`.

### Preserve a legacy review selection separately from selectable options

When `ReviewEvent` receives a currently assigned rate that is progressive, the selector includes that rate only as the selected disabled option. Other progressive rates remain excluded. This avoids silently losing or changing an existing assignment while ensuring the review workflow cannot create a new progressive-rate assignment. Creation forms do not need this compatibility option because they start with a selectable default rate.

### Keep the button styling local to the creation forms

Apply the green color scheme and full-width layout to each creation form's submit action at its call site. Keep the existing rounded button treatment and hover behavior rather than changing the shared `RoundedButton`, which is used throughout unrelated admin actions. Keep each form's existing bottom spacing and preserve `Create Event Group` text; only the individual event action changes to lowercase `create events`.

### Retain required and maximum details validation

Both creation schemas require non-empty details and cap the value at 50,000 characters. Only the minimum-length rule is removed. This keeps the existing upper-bound protection while allowing concise event descriptions.

## Risks / Trade-offs

- [Risk] A legacy progressive rate may be returned without complete rate metadata. -> Mitigation: only apply the disabled-current compatibility option when the current rate is present in the fetched definitions and its `perSession` array is non-empty; leave normal hourly filtering intact otherwise.
- [Risk] Existing tests mock `RateSelect` with a narrow component signature. -> Mitigation: update focused tests to assert the policy props and add selector-level tests with both hourly and progressive fixtures.
- [Risk] Full-width actions may change wrapping around the submission error or tooltip. -> Mitigation: keep the existing error region and bottom margin, and verify the action at narrow and desktop viewport widths.
- [Trade-off] The shared selector defaults to all rates so event groups remain permissive and future usages do not unexpectedly become hourly-only. -> Mitigation: require restricted workflows to opt in explicitly and cover each current restricted usage in tests.
