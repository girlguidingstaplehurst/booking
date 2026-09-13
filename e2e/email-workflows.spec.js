const { test, expect } = require("./fixtures");
const { query } = require("./db");

async function createAdminEvent(page, suffix) {
  const eventName = `E2E invoice event ${suffix}`;
  const email = `e2e-invoice-${suffix}@example.org`;
  const daysAhead = 20 + (Math.floor(Date.now() / 1000) % 300);
  const date = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  await page.goto("/admin/create-events");
  await page.getByLabel("Event Name").fill(eventName);
  await page.getByLabel("Event date").fill(date);
  await page.locator("#recurrence-start-time").fill("10:00");
  await page.locator("#recurrence-end-time").fill("11:00");
  await page
    .getByLabel("Event Details")
    .fill("An E2E invoice event with enough detail to satisfy validation.");
  await page.getByLabel("Name", { exact: true }).fill("E2E Invoice Contact");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByRole("button", { name: "Create Events" }).click();
  await expect(page).toHaveURL(/\/admin$/);

  const result = await query(
    "select id from booking_events where event_name = $1",
    [eventName],
  );
  expect(result.rows).toHaveLength(1);
  return { eventID: result.rows[0].id, email };
}

async function createPublicBooking(page, suffix) {
  const eventName = `E2E approval event ${suffix}`;
  const email = `e2e-approval-${suffix}@example.org`;
  const daysAhead = 20 + (Math.floor(Date.now() / 1000) % 300);
  const date = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
  const eventDate = date.toISOString().slice(0, 10);

  await page.route(
    "https://www.google.com/recaptcha/api.js**",
    async (route) => {
      await route.fulfill({
        contentType: "application/javascript",
        body: "window.grecaptcha={execute:()=>Promise.resolve('e2e-captcha')};window.reactRecaptcha3Loaded();",
      });
    },
  );
  await page.goto(
    `/add-event?start=${eventDate}T10:00:00&end=${eventDate}T11:00:00`,
  );
  await page.getByRole("button", { name: "Accept cookies" }).click();
  await page.getByLabel("Event Name").fill(eventName);
  await page
    .getByLabel("Event Details")
    .fill("An E2E approval event with enough detail to satisfy validation.");
  await page.getByLabel("Name", { exact: true }).fill("E2E Approval Contact");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page
    .getByRole("checkbox", { name: /Privacy Policy/ })
    .check({ force: true });
  await page
    .getByRole("checkbox", { name: /Terms of Hire/ })
    .check({ force: true });
  await page
    .getByRole("checkbox", { name: /Cleaning and Damage Policy/ })
    .check({ force: true });
  await page
    .getByRole("checkbox", { name: /car parking/i })
    .check({ force: true });
  await page
    .getByRole("checkbox", { name: /adhesives/i })
    .check({ force: true });

  const responsePromise = page.waitForResponse("**/api/v1/add-event");
  await page.getByRole("button", { name: "Book" }).click();
  await expect((await responsePromise).status()).toBe(200);

  const result = await query(
    "select id from booking_events where event_name = $1",
    [eventName],
  );
  expect(result.rows).toHaveLength(1);
  return { eventID: result.rows[0].id, email };
}

test("an admin can send an invoice through the page", async ({
  authenticatedPage: page,
}) => {
  const { eventID, email } = await createAdminEvent(page, Date.now());

  await page.goto(`/admin/create-invoice?events=${eventID}`);
  await expect(
    page.getByRole("button", { name: "Send Invoice" }),
  ).toBeVisible();

  const responsePromise = page.waitForResponse("**/api/v1/admin/send-invoice");
  await page.getByRole("button", { name: "Send Invoice" }).click();
  await expect((await responsePromise).status()).toBe(200);

  const result = await query(
    "select i.contact, i.sent from booking_invoices i join booking_invoice_events ie on ie.invoice_id = i.id where i.contact = $1 and ie.event_id = $2",
    [email, eventID],
  );
  expect(result.rows).toHaveLength(1);
  expect(result.rows[0].sent).not.toBeNull();
});

test("an admin can approve an event through the page", async ({
  authenticatedPage: page,
}) => {
  const { eventID, email } = await createPublicBooking(page, Date.now());

  await page.goto(`/admin/review/${eventID}`);
  await expect(page.getByRole("heading", { name: /Review/ })).toBeVisible();
  await expect(page.getByText(new RegExp(email))).toBeVisible();

  const responsePromise = page.waitForResponse(
    `**/api/v1/admin/events/${eventID}/approve-event`,
  );
  await page.getByRole("button", { name: "Approve Event" }).click();
  await expect((await responsePromise).status()).toBe(200);
  await page.reload();
  await expect(page.getByText("approved", { exact: true })).toBeVisible();

  const result = await query(
    "select status from booking_events where id = $1",
    [eventID],
  );
  expect(result.rows).toEqual([{ status: "approved" }]);
});
