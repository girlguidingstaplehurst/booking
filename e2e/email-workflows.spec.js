const { test, expect } = require("./fixtures");
const { query } = require("./db");
const { randomUUID } = require("node:crypto");

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

async function createHourlyGroup(suffix) {
  const groupID = randomUUID();
  const contact = `e2e-hourly-group-${suffix}@example.org`;
  const groupName = `E2E hourly invoice group ${suffix}`;
  const firstID = randomUUID();
  const secondID = randomUUID();
  const start = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const secondStart = new Date(start.getTime() + 2 * 60 * 60 * 1000);

  await query(
    "insert into booking_contacts (email, name) values ($1, $2)",
    [contact, "E2E Hourly Group Contact"],
  );
  await query(
    "insert into booking_event_groups (id, event_name, details, visible, email, rate) values ($1, $2, $3, true, $4, 'default')",
    [groupID, groupName, "E2E hourly group", contact],
  );
  await query(
    "insert into booking_events (id, event_start, event_end, event_name, visible, email, status, rate_id, details, event_group_id) values ($1, $2, $3, $4, true, $5, 'approved', 'default', $6, $7), ($8, $9, $10, $4, true, $5, 'approved', 'default', $6, $7)",
    [
      firstID,
      start,
      new Date(start.getTime() + 60 * 60 * 1000),
      groupName,
      contact,
      "E2E hourly session",
      groupID,
      secondID,
      secondStart,
      new Date(secondStart.getTime() + 60 * 60 * 1000),
    ],
  );
  return { groupID, firstID, secondID, contact };
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

test("an admin can invoice hourly group sessions in separate partial invoices", async ({
  authenticatedPage: page,
}) => {
  const { groupID, firstID, secondID, contact } = await createHourlyGroup(Date.now());

  await page.goto(`/admin/create-invoice?eventGroup=${groupID}`);
  const sessionCheckboxes = page.getByRole("checkbox");
  await expect(sessionCheckboxes).toHaveCount(3);
  await sessionCheckboxes.nth(2).uncheck({ force: true });
  await page.getByRole("button", { name: "Send Invoice" }).click();
  await expect(page).toHaveURL(/\/admin$/);

  const firstInvoice = await query(
    "select i.id from booking_invoices i join booking_invoice_events ie on ie.invoice_id = i.id where i.contact = $1 and ie.event_id = $2",
    [contact, firstID],
  );
  expect(firstInvoice.rows).toHaveLength(1);

  await page.goto(`/admin/create-invoice?eventGroup=${groupID}`);
  await expect(page.getByRole("checkbox")).toHaveCount(2);
  await page.getByRole("button", { name: "Send Invoice" }).click();
  await expect(page).toHaveURL(/\/admin$/);

  const associations = await query(
    "select bie.event_id from booking_invoice_events bie join booking_invoices i on i.id = bie.invoice_id where i.contact = $1 order by bie.event_id",
    [contact],
  );
  expect(associations.rows.map((row) => row.event_id).sort()).toEqual([firstID, secondID].sort());
});
