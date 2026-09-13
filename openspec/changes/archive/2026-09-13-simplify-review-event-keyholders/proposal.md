## Why

The Review Event keyholder section duplicates the current assignments in a left column while also presenting editable entry and exit selectors. This adds visual noise and makes the save action inconsistent with the rounded actions used elsewhere on the screen.

## What Changes

- Remove the read-only keyholder summary column from the Review Event keyholder section.
- Retain the separate entry and exit keyholder selectors, existing error feedback, and update operation.
- Use the shared rounded button styling for the `Update Keyholders` action.
- Preserve the current responsive behavior and keyholder assignment semantics.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `keyholder-management`: simplify the Review Event keyholder assignment presentation without changing assignment behavior.

## Impact

- Affects the Review Event UI in `src/admin/ReviewEvent.js`.
- Requires the shared `RoundedButton` import and focused Review Event component coverage.
- No API, database, keyholder data, or assignment workflow changes are expected.
