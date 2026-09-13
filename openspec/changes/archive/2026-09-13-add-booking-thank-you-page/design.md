## Context

The React application uses React Router for client-side routes and `ManagedContent` to retrieve published `klgcPage` entries from Contentful by name. Public booking submission is implemented in `AddEvent`, which currently navigates to `/` after a successful `/api/v1/add-event` response. The Go Fiber service serves the embedded React entry point only for paths listed in `htmlPaths`, so deep links require an explicit server-side allowlist entry.

The existing Playwright public-booking test submits through the rendered form and verifies the persisted PostgreSQL record, but it does not assert the post-submit destination.

## Goals / Non-Goals

**Goals:**

- Preserve Contentful as the source of editable thank-you copy.
- Guarantee a return-to-home link in application code, even if editors change the Contentful entry.
- Make `/thank-you` work through client-side navigation, direct navigation, and refresh.
- Verify the confirmation destination and return link in the existing end-to-end public booking journey.

**Non-Goals:**

- Changing the booking API response or database schema.
- Adding a new Contentful content model or changing the Contentful client.
- Moving the return link into Contentful rich text.
- Adding a separate confirmation API endpoint or exposing booking details on the thank-you page.

## Decisions

### Use a dedicated React confirmation page composition

Add a route for `/thank-you` that composes `ManagedContent` with the `thank-you` entry and a React Router link to `/`. A dedicated composition keeps the editor-controlled content and the non-removable navigation affordance visibly separate. Relying on a Contentful hyperlink was rejected because an editor could remove or alter it.

### Redirect only after a successful booking response

Keep the existing error behavior in `AddEvent`; navigate to `/thank-you` only in the success branch after the API response is confirmed successful. Failed submissions remain on the form so users can see and retry the error.

### Add the route to the Fiber SPA fallback allowlist

Include `/thank-you` in `htmlPaths`. This follows the existing refreshability pattern for public React routes and ensures that a browser request for the route receives `index.html` before React Router resolves it.

### Extend the existing public booking Playwright test

After observing the successful API response, assert the `/thank-you` URL and the visible return link. Continue querying PostgreSQL for persistence. The test should use the link’s accessible name or destination rather than asserting CMS copy, avoiding a brittle dependency on the exact wording editors publish.

## Risks / Trade-offs

- [The Contentful `thank-you` entry is missing or unpublished] -> The managed-content component may render without page copy; content publication remains a deployment/content-management prerequisite, while the React return link remains available.
- [The route is added to React but omitted from the Go allowlist] -> Direct visits and refreshes fail even though in-app navigation works; include an explicit task and acceptance coverage for the route.
- [The acceptance test depends on live Contentful content] -> Assert the route and application-owned link rather than exact CMS text; retain the existing persistence assertion as the primary booking outcome.
- [Users revisit `/thank-you` without submitting a booking] -> Treat the page as an informational public route; no booking token or sensitive booking data is exposed.

## Migration Plan

Deploy the frontend route and submission redirect together with the Fiber allowlist update, then publish the `thank-you` Contentful entry before exposing the new flow. Rollback consists of reverting the frontend redirect and route plus removing the allowlist entry; existing successful submissions can continue to use the current home-page destination.
