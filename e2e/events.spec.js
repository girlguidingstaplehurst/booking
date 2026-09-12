const { test, expect } = require("./fixtures");
const { query } = require("./db");

test("an admin can create an event through the page", async ({ authenticatedPage: page }) => {
  const eventName = `E2E admin event ${Date.now()}`;
  const email = `e2e-event-${Date.now()}@example.org`;
  const daysAhead = 20 + (Math.floor(Date.now() / 1000) % 300);
  const date = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  await page.goto("/admin/create-events");
  await page.getByLabel("Event Name").fill(eventName);
  await page.getByLabel("Event date").fill(date);
  await page.locator("#recurrence-start-time").fill("10:00");
  await page.locator("#recurrence-end-time").fill("11:00");
  await page.getByLabel("Event Details").fill("An administrative browser acceptance event with enough detail to satisfy validation.");
  await page.getByLabel("Name", { exact: true }).fill("E2E Event Contact");
  await page.getByLabel("Email", { exact: true }).fill(email);

  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page).toHaveURL(/\/admin$/);

  const result = await query(
    "select e.event_name, e.email, e.status, e.visible, c.name from booking_events e join booking_contacts c on c.email = e.email where e.event_name = $1",
    [eventName],
  );
  expect(result.rows).toEqual([{
    event_name: eventName,
    email,
    status: "approved",
    visible: true,
    name: "E2E Event Contact",
  }]);
});
