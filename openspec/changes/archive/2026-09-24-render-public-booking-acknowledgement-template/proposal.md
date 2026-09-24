## Why

The public booking acknowledgement email is loaded without template rendering, so recipients receive literal Go template expressions such as `{{.event.Name}}`, `{{.event.Contact}}`, and `{{.date}}` instead of the event details. This makes the acknowledgement confusing and undermines the content-managed email workflow.

## What Changes

- Render the public booking acknowledgement through the existing email-template mechanism.
- Supply the submitted event/contact data and formatted booking date to the template.
- Add regression coverage proving the acknowledgement is rendered with event details rather than sent with template placeholders.
- Preserve the existing behavior that acknowledgement lookup or delivery failures do not fail an otherwise successful booking.

## Capabilities

### New Capabilities

### Modified Capabilities

- `public-booking-acknowledgement-email`: Require the acknowledgement email to render its managed template variables before delivery.

## Impact

- Affected Go REST booking handler and content-manager integration.
- Affected unit tests for public booking acknowledgement emails and template rendering.
- No API endpoint, database schema, or external email configuration changes are expected.
