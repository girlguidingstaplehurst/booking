const base = require("@playwright/test");
const { readToken } = require("./env");

const test = base.test.extend({
  authenticatedPage: async ({ page }, use) => {
    await page.addInitScript((token) => {
      sessionStorage.setItem("token", JSON.stringify(token));
    }, readToken());
    await use(page);
  },
});

module.exports = { expect: base.expect, test };
