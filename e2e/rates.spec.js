const { test, expect } = require("./fixtures");
const { query } = require("./db");

test("an admin can create and update a rate through the page", async ({ authenticatedPage: page }) => {
  const id = `e2e-rate-${Date.now()}`;

  await page.goto("/admin/rates/new");
  await page.getByLabel("ID").fill(id);
  await page.getByLabel("Description").fill("E2E rate");
  await page.getByRole("spinbutton", { name: "Hourly rate" }).fill("31.50");
  await page.getByRole("button", { name: "Save rate" }).click();
  await expect(page).toHaveURL(/\/admin\/rates$/);
  await expect(page.getByRole("heading", { name: "E2E rate", exact: true }).last()).toBeVisible();

  let result = await query("select id, description, hourly_rate from booking_rates where id = $1", [id]);
  expect(result.rows).toEqual([{ id, description: "E2E rate", hourly_rate: "$31.50" }]);

  await page.locator(`a[href="/admin/rates/${id}/edit"]`).click();
  await page.getByLabel("Description").fill("Updated E2E rate");
  await page.getByRole("button", { name: "Save rate" }).click();
  await expect(page).toHaveURL(/\/admin\/rates$/);

  result = await query("select description from booking_rates where id = $1", [id]);
  expect(result.rows).toEqual([{ description: "Updated E2E rate" }]);
});

test("an admin can create a multi-day rate and assign it to an individual event", async ({ authenticatedPage: page }) => {
  const id = `e2e-multi-day-rate-${Date.now()}`;
  const eventName = `E2E multi-day event ${Date.now()}`;
  const email = `e2e-multi-day-${Date.now()}@example.org`;
  const daysAhead = 30 + (Math.floor(Date.now() / 1000) % 300);
  const date = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  await page.goto("/admin/rates/new");
  await page.getByLabel("ID").fill(id);
  await page.getByLabel("Description").fill("E2E multi-day rate");
  await page.getByRole("radio", { name: "Multi-day duration pricing" }).check({ force: true });
  await page.getByLabel("Initial 24-hour periods").fill("2");
  await page.getByLabel("Initial daily rate").fill("100");
  await page.getByLabel("Later daily rate").fill("80");
  await page.getByLabel("Hourly rate for remaining hours").fill("5");
  await page.getByRole("button", { name: "Save rate" }).click();
  await expect(page).toHaveURL(/\/admin\/rates$/);
  await expect(page.getByRole("heading", { name: "E2E multi-day rate", exact: true }).last()).toBeVisible();

  let result = await query(
    "select id, pricing_mode, initial_daily_periods, initial_daily_rate, daily_rate, hourly_rate from booking_rates where id = $1",
    [id],
  );
  expect(result.rows).toEqual([{
    id,
    pricing_mode: "multiDay",
    initial_daily_periods: 2,
    initial_daily_rate: "$100.00",
    daily_rate: "$80.00",
    hourly_rate: "$5.00",
  }]);

  await page.goto("/admin/create-events");
  await page.getByLabel("Event Name").fill(eventName);
  await page.getByLabel("Event date").fill(date);
  await page.locator("#recurrence-start-time").fill("10:00");
  await page.locator("#recurrence-end-time").fill("11:00");
  await page.getByLabel("Event Details").fill("An individual event using a multi-day rate with enough detail to satisfy the booking form validation requirements.");
  await page.locator("select[name=rate]").selectOption(id);
  await page.getByLabel("Name", { exact: true }).fill("E2E Multi-day Contact");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByRole("button", { name: "Create Events" }).click();
  await expect(page).toHaveURL(/\/admin$/);

  result = await query("select rate_id from booking_events where event_name = $1", [eventName]);
  expect(result.rows).toEqual([{ rate_id: id }]);
});
