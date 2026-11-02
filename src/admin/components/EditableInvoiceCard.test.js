import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";
import { act } from "react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { EditableInvoiceCard } from "./EditableInvoiceCard";

jest.mock("../useAuth", () => () => ({ token: "token" }));

const preparation = {
  mode: "individual",
  contact: "contact@example.org",
  contactName: "Contact Person",
  name: "Summer Camp",
  events: [
    {
      id: "event-1",
      name: "Summer Camp",
      from: "2026-09-12T09:00:00Z",
      to: "2026-09-12T11:00:00Z",
      rate: 20,
      discountTable: {},
    },
  ],
};

const zeroCostPreparation = {
  ...preparation,
  events: preparation.events.map((event) => ({ ...event, rate: 0 })),
};

const hourlyGroupPreparation = {
  mode: "group",
  contact: "contact@example.org",
  contactName: "Contact Person",
  name: "Weekend Group",
  eventGroup: "group-1",
  events: [
    { ...preparation.events[0], id: "session-1", name: "Weekend Group" },
    { ...preparation.events[0], id: "session-2", name: "Weekend Group" },
  ],
  rate: { pricingMode: "hourly", hourlyRate: 20, perSession: [] },
};

function renderCard(cardPreparation = preparation) {
  const router = createMemoryRouter([
    {
      path: "/admin/create-invoice",
      element: <EditableInvoiceCard preparation={cardPreparation} />,
    },
    { path: "/admin", element: <div>Dashboard</div> },
  ], { initialEntries: ["/admin/create-invoice"] });

  return {
    ...render(
      <ChakraProvider>
        <RouterProvider router={router} />
      </ChakraProvider>,
    ),
    router,
  };
}

function renderGroupCard(cardPreparation = hourlyGroupPreparation) {
  const router = createMemoryRouter([
    {
      path: "/admin/create-invoice",
      element: <EditableInvoiceCard preparation={cardPreparation} />,
    },
    { path: "/admin", element: <div>Dashboard</div> },
  ], { initialEntries: ["/admin/create-invoice"] });

  return {
    ...render(
      <ChakraProvider>
        <RouterProvider router={router} />
      </ChakraProvider>,
    ),
    router,
  };
}

test("shows event and contact context with deposit disabled", () => {
  renderCard();

  expect(screen.getAllByText("Summer Camp").length).toBeGreaterThan(0);
  expect(screen.getByText("Contact Person")).toBeInTheDocument();
  expect(screen.getByRole("checkbox")).not.toBeChecked();
  expect(screen.queryByDisplayValue("Refundable Cleaning and Damage deposit")).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Send Invoice" })).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Create & Mark Paid (No Email)" })).not.toBeInTheDocument();
});

test("shows both send and distinct no-email actions for a zero-total individual invoice", () => {
  renderCard(zeroCostPreparation);

  expect(screen.getByRole("button", { name: "Send Invoice" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Create & Mark Paid (No Email)" })).toBeInTheDocument();
});

test("updates no-email action availability as the live total changes", async () => {
  renderCard(zeroCostPreparation);

  expect(screen.getByRole("button", { name: "Create & Mark Paid (No Email)" })).toBeInTheDocument();
  await act(async () => {
    fireEvent.click(screen.getByRole("checkbox"));
  });
  expect(screen.queryByRole("button", { name: "Create & Mark Paid (No Email)" })).not.toBeInTheDocument();

  await act(async () => {
    fireEvent.click(screen.getByRole("checkbox"));
  });
  expect(screen.getByRole("button", { name: "Create & Mark Paid (No Email)" })).toBeInTheDocument();
});

test("shows the no-email action when an edited line reaches zero", () => {
  renderCard();

  fireEvent.change(screen.getByDisplayValue("£40.00"), { target: { value: "£0.00" } });

  expect(screen.getByText("£0.00")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Create & Mark Paid (No Email)" })).toBeInTheDocument();
});

test("adds one deposit line when enabled", async () => {
  renderCard();

  await act(async () => {
    fireEvent.click(screen.getByRole("checkbox"));
  });

  expect(screen.getByRole("checkbox")).toBeChecked();
  expect(screen.getByDisplayValue("Refundable Cleaning and Damage deposit")).toBeInTheDocument();
});

test("submits edited lines with the selected event", async () => {
  global.fetch = jest.fn(() => Promise.resolve({ ok: true }));
  renderCard();

  const description = screen.getByDisplayValue(/Summer Camp - Sat/);
  fireEvent.change(description, { target: { value: "Edited event hire" } });
  fireEvent.submit(screen.getByRole("button", { name: "Send Invoice" }).closest("form"));

  await waitFor(() => expect(global.fetch).toHaveBeenCalled());
  const request = global.fetch.mock.calls[0][1];
  expect(JSON.parse(request.body)).toMatchObject({
    contact: "contact@example.org",
    events: ["event-1"],
    items: [expect.objectContaining({ description: "Edited event hire" })],
  });
});

test("returns to the dashboard after a successful send", async () => {
  global.fetch = jest.fn(() => Promise.resolve({ ok: true }));
  const { router } = renderCard();

  fireEvent.submit(screen.getByRole("button", { name: "Send Invoice" }).closest("form"));

  await waitFor(() => expect(router.state.location.pathname).toBe("/admin"));
});

test("stays on the form after a failed send", async () => {
  global.fetch = jest.fn(() => Promise.resolve({ ok: false }));
  const { router } = renderCard();

  fireEvent.submit(screen.getByRole("button", { name: "Send Invoice" }).closest("form"));

  await waitFor(() => expect(global.fetch).toHaveBeenCalled());
  expect(router.state.location.pathname).toBe("/admin/create-invoice");
  expect(JSON.parse(global.fetch.mock.calls[0][1].body)).toMatchObject({
    contact: "contact@example.org",
    events: ["event-1"],
  });
});

test("creates and marks a zero-total individual invoice paid without email", async () => {
  global.fetch = jest.fn(() => Promise.resolve({ ok: true }));
  const { router } = renderCard(zeroCostPreparation);

  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Create & Mark Paid (No Email)" }));
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  await waitFor(() => expect(router.state.location.pathname).toBe("/admin"));
  expect(global.fetch).toHaveBeenCalledWith(
    "/api/v1/admin/invoices/zero-cost",
    expect.objectContaining({
      method: "POST",
      headers: expect.objectContaining({ Authorization: "Bearer token" }),
    }),
  );
  expect(JSON.parse(global.fetch.mock.calls[0][1].body)).toMatchObject({
    contact: "contact@example.org",
    events: ["event-1"],
    items: [expect.objectContaining({ cost: 0 })],
  });
});

test("stays on invoice preparation when zero-cost invoice creation fails", async () => {
  global.fetch = jest.fn(() => Promise.resolve({ ok: false }));
  const { router } = renderCard(zeroCostPreparation);

  fireEvent.click(screen.getByRole("button", { name: "Create & Mark Paid (No Email)" }));

  await waitFor(() => expect(global.fetch).toHaveBeenCalled());
  expect(router.state.location.pathname).toBe("/admin/create-invoice");
});

test("stays on invoice preparation when zero-cost invoice creation has no response", async () => {
  global.fetch = jest.fn(() => Promise.reject(new Error("network unavailable")));
  const { router } = renderCard(zeroCostPreparation);

  fireEvent.click(screen.getByRole("button", { name: "Create & Mark Paid (No Email)" }));

  await waitFor(() => expect(global.fetch).toHaveBeenCalled());
  await waitFor(() => expect(screen.getByRole("button", { name: "Create & Mark Paid (No Email)" })).not.toBeDisabled());
  expect(router.state.location.pathname).toBe("/admin/create-invoice");
});

test("sending a free invoice still uses the email invoice operation", async () => {
  global.fetch = jest.fn(() => Promise.resolve({ ok: true }));
  const { router } = renderCard(zeroCostPreparation);

  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Send Invoice" }));
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  await waitFor(() => expect(router.state.location.pathname).toBe("/admin"));
  expect(global.fetch.mock.calls[0][0]).toBe("/api/v1/admin/send-invoice");
});

test("hourly group invoices can select a subset of sessions", async () => {
  global.fetch = jest.fn(() => Promise.resolve({ ok: true }));
  renderGroupCard();

  const sessionCheckboxes = screen.getAllByRole("checkbox");
  expect(sessionCheckboxes).toHaveLength(3);
  fireEvent.click(sessionCheckboxes[1]);
  expect(sessionCheckboxes[1]).not.toBeChecked();
  expect(screen.getByText("1 session selected")).toBeInTheDocument();

  fireEvent.submit(screen.getByRole("button", { name: "Send Invoice" }).closest("form"));
  await waitFor(() => expect(global.fetch).toHaveBeenCalled());
  expect(JSON.parse(global.fetch.mock.calls[0][1].body)).toMatchObject({
    eventGroup: "group-1",
    events: ["session-2"],
  });
});

test("hourly group invoices cannot be submitted with no selected sessions", () => {
  renderGroupCard();

  const sessionCheckboxes = screen.getAllByRole("checkbox");
  fireEvent.click(sessionCheckboxes[0]);
  expect(screen.getByRole("button", { name: "Send Invoice" })).toBeDisabled();
});

test("does not offer zero-cost paid creation for a zero-total event-group invoice", () => {
  const zeroCostGroupPreparation = {
    ...hourlyGroupPreparation,
    events: hourlyGroupPreparation.events.map((event) => ({ ...event, rate: 0 })),
    rate: { pricingMode: "hourly", hourlyRate: 0, perSession: [] },
  };
  renderGroupCard(zeroCostGroupPreparation);

  expect(screen.getByRole("button", { name: "Send Invoice" })).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Create & Mark Paid (No Email)" })).not.toBeInTheDocument();
});
