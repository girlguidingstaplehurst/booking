## Context

`EditableInvoiceCard` owns the invoice form submission and currently awaits the existing `POST /api/v1/admin/send-invoice` request without interpreting the response for navigation. The admin router already exposes `/admin`, and neighboring admin forms use React Router's `useNavigate` to return there after successful mutations. See `proposal.md` and the invoice-creation spec delta for the intended behavior.

## Goals / Non-Goals

**Goals:**

- Make successful invoice submission end at the existing admin dashboard route.
- Define success using the Fetch `Response.ok` property.
- Preserve the current request payload and loading-state lifecycle.
- Add focused frontend coverage for successful navigation and failed-send retention.

**Non-Goals:**

- No backend, OpenAPI, database, or generated-file changes.
- No new route or dashboard data-loading behavior.
- No new invoice error-message UX; failed submissions remain on the form as currently implemented.

## Decisions

- **Use `useNavigate` in `EditableInvoiceCard`.** The component owns the submit callback, and React Router's existing imperative navigation pattern is already used by the admin create/edit forms. A declarative link would not express navigation conditional on the asynchronous response.
- **Navigate only when `response?.ok` is true.** This distinguishes the backend's successful completion response from HTTP failures and from a missing response. Navigating on promise resolution alone could take the administrator away from the form after a failed send.
- **Keep the current endpoint and payload unchanged.** The backend already returns success only after invoice creation, PDF generation, email delivery, and marking the invoice sent. This is a client-side workflow transition, not an API change.
- **Test at the component/router boundary.** Mock the authenticated fetch response and provide a memory router so the test can assert the resulting `/admin` location. Add a failure case that verifies the route remains on the invoice form.

## Risks / Trade-offs

- [A failed send has no visible error message] -> Keep the form mounted and preserve the existing behavior; error feedback is explicitly outside this change and can be addressed separately.
- [The backend may have partially completed work before returning an error] -> Do not redirect unless the final response is successful, matching the current API contract and the requirement's meaning of "sent."
