const { test, expect } = require("./fixtures");
const { query } = require("./db");

test("a public booking is persisted through the booking page", async ({ page }) => {
  const eventName = `E2E public booking ${Date.now()}`;
  const email = `e2e-${Date.now()}@example.org`;
  const daysAhead = 20 + (Math.floor(Date.now() / 1000) % 300);
  const date = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
  const eventDate = date.toISOString().slice(0, 10);

  await page.route("https://www.google.com/recaptcha/api.js**", async (route) => {
    await route.fulfill({
      contentType: "application/javascript",
      body: "window.grecaptcha={execute:()=>Promise.resolve('e2e-captcha')};window.reactRecaptcha3Loaded();",
    });
  });
  await page.goto(`/add-event?start=${eventDate}T10:00:00&end=${eventDate}T11:00:00`);
  await page.getByRole("button", { name: "Accept cookies" }).click();
  await page.getByLabel("Event Name").fill(eventName);
  await page.getByLabel("Event Details").fill("A browser acceptance booking with enough detail to satisfy validation.");
  await page.getByLabel("Name", { exact: true }).fill("E2E Contact");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByRole("checkbox", { name: /Privacy Policy/ }).check({ force: true });
  await page.getByRole("checkbox", { name: /Terms of Hire/ }).check({ force: true });
  await page.getByRole("checkbox", { name: /Cleaning and Damage Policy/ }).check({ force: true });
  await page.getByRole("checkbox", { name: /car parking/i }).check({ force: true });
  await page.getByRole("checkbox", { name: /adhesives/i }).check({ force: true });

  const responsePromise = page.waitForResponse("**/api/v1/add-event");
  await page.getByRole("button", { name: "Book" }).click();
  await expect((await responsePromise).status()).toBe(200);

  const result = await query(
    "select e.event_name, e.email, c.name from booking_events e join booking_contacts c on c.email = e.email where e.event_name = $1",
    [eventName],
  );
  expect(result.rows).toEqual([{ event_name: eventName, email, name: "E2E Contact" }]);
});
