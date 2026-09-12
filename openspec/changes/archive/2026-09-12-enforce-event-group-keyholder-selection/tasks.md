## 1. Event Group Validation

- [x] 1.1 Ensure the event-group form treats an empty keyholder value as invalid while retaining the visible `Unassigned` option, and verify the existing event-group schema and selector integration enforce this boundary.
- [x] 1.2 Render event-group validation feedback for an unassigned keyholder and verify the form remains on the page without calling the event-group API poster.

## 2. Optional Individual Event Assignments

- [x] 2.1 Verify the shared keyholder selector continues to offer active keyholder names and `Unassigned` for individual event assignment without exposing key numbers.
- [x] 2.2 Verify individual event keyholder assignment can still submit null entry or exit values through the existing later-assignment workflow.

## 3. Regression Verification

- [x] 3.1 Add focused tests covering unassigned event-group submission rejection, visible validation feedback, request suppression, and preservation of the shared selector options, then verify the focused frontend test command passes.
- [x] 3.2 Run the complete frontend test suite and production build, and verify the existing API contract and backend behavior remain unchanged.
