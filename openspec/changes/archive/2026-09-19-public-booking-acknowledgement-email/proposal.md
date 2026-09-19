## Why

People who submit a public booking currently receive no email acknowledgement. Add a managed acknowledgement so bookers have confirmation that their request was received, while keeping the booking successful when email infrastructure or content management is unavailable.

## What Changes

- Send the published Contentful email resource `event-name-booking-in-review` to the booker's email address after a public booking is successfully persisted.
- Treat email content lookup and email delivery failures as non-fatal: log the failure and still return HTTP 200 for the successful booking.
- Do not send acknowledgement emails for invalid, rejected, or duplicate booking requests.
- Add automated coverage for successful delivery and non-fatal lookup/delivery failures.

## Capabilities

### New Capabilities

- `public-booking-acknowledgement-email`: Send a managed acknowledgement after successful public bookings, with non-fatal failure handling.

### Modified Capabilities

- `public-booking-confirmation`: Clarify that successful public booking submission also triggers the acknowledgement-email behavior.

## Impact

- Affects the public booking handler and its existing `ContentManager` and `EmailSender` integrations.
- Uses the existing Contentful email resource and configured SMTP/stub senders; no new API endpoint or external dependency is required.
- Affects structured/application logging and public booking handler tests.
