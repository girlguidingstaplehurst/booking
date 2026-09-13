## 1. Review Event Layout

- [x] 1.1 Remove the read-only keyholder summary column and its two-column layout while retaining the entry and exit selectors, assignment error, responsive control sizing, and existing save flow; verify the Review Event keyholder section renders only the editable controls
- [x] 1.2 Replace the raw `Update Keyholders` button with the shared rounded button component while preserving its brand color, label, loading state, click handler, and revalidation behavior; verify the rendered action uses the shared button presentation

## 2. Focused Coverage

- [x] 2.1 Add Review Event component coverage for assigned and unassigned keyholders, absence of the removed summary column, rounded update action, and successful or failed assignment updates; verify existing names and error handling remain correct
- [x] 2.2 Run the focused Review Event and keyholder frontend tests and verify the changed screen passes without regressions

## 3. Production Frontend

- [x] 3.1 Run `npm run build` before archiving the completed change and verify the production frontend files in `build/` are regenerated
