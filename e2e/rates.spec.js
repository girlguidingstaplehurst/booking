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
