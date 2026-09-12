import { populateInvoiceItems } from "./invoiceCalculations";

const events = [
  {
    id: "one",
    name: "Summer Camp",
    from: "2026-09-12T09:00:00Z",
    to: "2026-09-12T12:00:00Z",
    rate: 20,
    discountTable: { 3: { value: 5 } },
  },
  {
    id: "two",
    name: "Autumn Camp",
    from: "2026-09-13T10:00:00Z",
    to: "2026-09-13T11:00:00Z",
    rate: 25,
    discountTable: {},
  },
];

test("individual invoices calculate event hire and one optional deposit", () => {
  const preparation = { mode: "individual", events };

  expect(populateInvoiceItems(preparation)).toHaveLength(3);
  expect(populateInvoiceItems(preparation).map((item) => item.cost)).toEqual([
    60, -5, 25,
  ]);
  expect(populateInvoiceItems(preparation, true)).toHaveLength(4);
  const withDeposit = populateInvoiceItems(preparation, true);
  expect(withDeposit[withDeposit.length - 1]).toMatchObject({
    cost: 100,
  });
});

test("hourly group invoices create a dated line for each session", () => {
  const items = populateInvoiceItems({ mode: "group", events });

  expect(items[0].description).toContain("Summer Camp");
  expect(items[0].description).toContain("12 Sep 2026");
  expect(items.map((item) => item.cost)).toEqual([60, -5, 25]);
});

test("progressive group invoices omit additional sessions at the tier boundary", () => {
  const preparation = {
    mode: "group",
    events: events.slice(0, 1),
    rate: { perSession: [{ count: 1, price: 150 }, { price: 13.5 }] },
  };

  expect(populateInvoiceItems(preparation)).toEqual([
    { description: "Event hire - first 1 sessions", cost: 150 },
  ]);
});

test("progressive group invoices charge extra sessions separately", () => {
  const preparation = {
    mode: "group",
    events,
    rate: { perSession: [{ count: 1, price: 150 }, { price: 13.5 }] },
  };

  expect(populateInvoiceItems(preparation)).toEqual([
    { description: "Event hire - first 1 sessions", cost: 150 },
    { description: "Event hire - 1 additional sessions", cost: 13.5 },
  ]);
});
