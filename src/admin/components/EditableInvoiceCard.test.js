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

function renderCard() {
  const router = createMemoryRouter([
    {
      path: "/admin/create-invoice",
      element: <EditableInvoiceCard preparation={preparation} />,
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
  expect(screen.getByRole("button", { name: "Send Invoice" })).toHaveStyle({ width: "100%" });
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
