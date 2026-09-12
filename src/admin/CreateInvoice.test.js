import { buildInvoicePreparationsStub } from "./CreateInvoice";

jest.mock("./useAuth", () => () => ({ token: "token" }));

test("invoice stub returns individual preparation for event query", () => {
  const result = buildInvoicePreparationsStub("event-one,event-two");

  expect(result.preparations).toHaveLength(1);
  expect(result.preparations[0]).toMatchObject({
    mode: "individual",
    events: [{ id: "event-one" }, { id: "event-two" }],
  });
  expect(result.preparations[0].eventGroup).toBeUndefined();
});

test("invoice stub returns group preparation for eventGroup query", () => {
  const result = buildInvoicePreparationsStub("ignored-event", "group-one");

  expect(result.preparations).toHaveLength(1);
  expect(result.preparations[0]).toMatchObject({
    mode: "group",
    eventGroup: "group-one",
    name: "Fake Event Group (group-one)",
  });
  expect(result.preparations[0].events).toHaveLength(2);
});
