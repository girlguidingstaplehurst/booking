## 1. Public acknowledgement rendering

- [x] 1.1 Update the public booking acknowledgement flow to use the templated content-manager method with the submitted event/contact context and existing formatted email date; verify the handler sends resolved values for `event.Name`, `event.Contact`, and `date`.
- [x] 1.2 Preserve non-fatal handling for content lookup, template rendering, and delivery failures, including privacy-safe operation/resource/recipient logging; verify the existing public booking failure tests continue to return HTTP 200 after persistence.

## 2. Regression coverage

- [x] 2.1 Extend the public booking REST tests to record the template method invocation and assert the key and variables passed to it; verify invalid, duplicate, and persistence-failure paths do not attempt email rendering.
- [x] 2.2 Add or update content-manager tests for rendering the acknowledgement fields and formatted date; verify no supported template placeholder remains literal in the generated subject/body.
- [x] 2.3 Run the focused Go tests for REST/content packages and then `go test ./...`; verify the complete Go test suite passes.
