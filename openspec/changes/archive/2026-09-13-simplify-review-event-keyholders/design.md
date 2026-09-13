## Context

Review Event currently renders keyholder information in a two-column `Flex`: a read-only summary on the left and editable entry/exit controls with the save action on the right. The save action is a raw Chakra button, while the surrounding Review Event actions use the shared rounded button component.

## Goals / Non-Goals

**Goals:**

- Make the keyholder section focused on the editable entry and exit assignments.
- Preserve the existing assignment state, API request, loading state, error message, and revalidation behavior.
- Use the established shared rounded button styling for `Update Keyholders`.
- Keep the assignment controls usable on narrow and desktop viewports.

**Non-Goals:**

- Changing keyholder selection options, inactive-keyholder handling, or UUID submission.
- Changing the keyholder API or event data model.
- Changing other sections or actions on Review Event.

## Decisions

### Remove only the read-only summary column

Remove the left assignment `Box`, its `Spacer`, and the outer two-column layout. Keep the two `KeyholderSelect` controls, assignment error text, and save operation together in the existing control stack. This removes duplication without removing the actual assignment controls.

### Reuse `RoundedButton`

Import and render the shared `RoundedButton` for `Update Keyholders`, preserving the existing brand color scheme, click handler, loading state, and label. This is preferred over duplicating border-radius and hover styles locally and matches the other Review Event actions.

### Use a responsive right-side action area

Keep the two selectors and assignment error in a vertical stack, and place the natural-width rounded action in a sibling area aligned to the right on desktop. Allow the action to wrap below the selectors and remain right-aligned on narrow screens. Retain the existing responsive minimum width for the selector stack so it remains full-width on narrow screens and readable on desktop.

## Risks / Trade-offs

- [Risk] Removing the summary means current assigned names are no longer shown as separate text. -> Mitigation: the selectors continue to display the current selections and preserve inactive current options through `KeyholderSelect`.
- [Risk] Replacing the raw button could alter inherited layout behavior. -> Mitigation: keep the existing stack and handler props, and add focused rendering and save-flow tests.
- [Trade-off] The controls may occupy more horizontal space after the summary column is removed. -> Mitigation: retain the existing responsive minimum width and verify narrow and desktop rendering.
