const { test, expect } = require("./fixtures");
const { query } = require("./db");

test("an admin can create and disable a keyholder through the page", async ({ authenticatedPage: page }) => {
  const name = `E2E Keyholder ${Date.now()}`;
  const keyNumber = String(100000 + (Date.now() % 900000));

  await page.goto("/admin/keyholders/new");
  await page.getByLabel("Name").fill(name);
  await page.getByLabel("Key number").fill(keyNumber);
  await page.getByRole("button", { name: "Add Keyholder" }).click();
  await expect(page).toHaveURL(/\/admin\/keyholders$/);
  const row = page.getByRole("row").filter({ hasText: name });
  await expect(row).toContainText("Active");

  const result = await query("select id, name, key_number, active from booking_keyholders where name = $1", [name]);
  expect(result.rows).toHaveLength(1);
  expect(result.rows[0]).toMatchObject({ name, key_number: Number(keyNumber), active: true });

  await row.getByRole("button", { name: "Disable" }).click();
  await expect(row).toContainText("Inactive");

  const updated = await query("select active from booking_keyholders where name = $1", [name]);
  expect(updated.rows).toEqual([{ active: false }]);
});
