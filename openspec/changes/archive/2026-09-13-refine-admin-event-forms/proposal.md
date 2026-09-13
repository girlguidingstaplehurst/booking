## Why

The event and event-group creation forms currently apply inconsistent details validation, rate-selection rules, and submit-button presentation. Aligning these controls will make the forms clearer while preserving the distinct pricing capabilities of individual events and event groups.

## What Changes

- Remove the minimum-length validation from Event Details on both creation forms while retaining required validation and the existing 50,000-character maximum.
- Limit the individual event creation form to hourly rate definitions.
- Allow the event-group creation form to select both hourly and progressive per-session rate definitions.
- Limit the Review Event rate selector to hourly rates for new selections.
- If an existing individual event already uses a per-session rate, keep that rate visible as the disabled current selection in Review Event.
- Change the Create events submit action to a full-width green button labeled `create events`.
- Apply the same full-width green submit-button layout to Create Event Group while retaining its `Create Event Group` label and existing bottom spacing.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `admin-screen-alignment`: refine event creation, event-group creation, and event review form validation, rate-selection behavior, and primary-action presentation.

## Impact

- Affects the React admin forms in `src/admin/CreateEvents.js` and `src/admin/CreateEventGroup.js`.
- Affects the shared rate selector and event review rate updater in `src/admin/components/RateSelect.js` and `src/admin/ReviewEvent.js`.
- Requires frontend tests for details validation, rate filtering, legacy selected-rate handling, button labels, and full-width styling.
- No API, database schema, or external dependency changes are expected.
