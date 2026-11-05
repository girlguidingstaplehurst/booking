## 1. Historical Search Invoice Action

- [x] 1.1 Extend `EventGroupSearch` tests to cover an invoiceable completed group, the direct group invoice URL, and hiding the action when no sessions are invoiceable while retaining Review; verify the focused test fails before the UI change and passes afterward.
- [x] 1.2 Add the conditional `Create Invoice` action to historical group search results using the existing group invoice-preparation route; verify `npm test -- --watchAll=false EventGroupSearch.test.js` passes.

## 2. Regression Verification

- [x] 2.1 Run the frontend test suite and production build; verify `npm test -- --watchAll=false` and `npm run build` complete successfully and existing hourly partial and progressive all-or-nothing invoice workflows remain unchanged.
