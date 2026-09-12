import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import {
  createMemoryRouter,
  RouterProvider,
} from "react-router-dom";
import { AdminPoster } from "../Poster";
import { Dashboard, normalizeDashboardData } from "./Dashboard";

jest.mock("../Poster", () => ({
  AdminPoster: jest.fn(),
}));

function renderDashboard(data, loader = jest.fn().mockResolvedValue(data)) {
  const router = createMemoryRouter([
    { path: "/", element: <Dashboard />, loader },
  ], { initialEntries: ["/"] });

  render(
    <ChakraProvider>
      <RouterProvider router={router} />
    </ChakraProvider>,
  );

  return { loader, router };
}

const outstandingData = {
  events: [{
    id: "event-1",
    name: "Event",
    from: "2026-09-12T10:00:00Z",
    to: "2026-09-12T11:00:00Z",
    status: "approved",
    invoices: [{ id: "invoice-1", reference: "INV-001", status: "raised" }],
    keyholderIn: "in@example.org",
    keyholderOut: "out@example.org",
  }],
  eventGroups: [],
};

describe("Dashboard invoice behavior", () => {
  beforeEach(() => {
    AdminPoster.mockReset();
  });

  test("normalizes missing invoice collections", () => {
    expect(normalizeDashboardData({
      events: [{ id: "event-1" }],
      eventGroups: [{ id: "group-1" }],
    })).toEqual({
      events: [{ id: "event-1", invoices: [] }],
      eventGroups: [{ id: "group-1", invoices: [] }],
    });
  });

  test("marks an invoice paid and refreshes Dashboard data", async () => {
    AdminPoster.mockResolvedValue({ ok: true });
    const { loader } = renderDashboard(outstandingData);

    await screen.findByRole("heading", { name: "Dashboard" });
    fireEvent.click(screen.getByRole("button", { name: "Mark Paid" }));

    await waitFor(() => expect(AdminPoster).toHaveBeenCalledWith(
      "/api/v1/admin/invoices/by-id/invoice-1/mark-as-paid",
      null,
    ));
    await waitFor(() => expect(loader).toHaveBeenCalledTimes(2));
  });

  test("shows payment failure and keeps the action available", async () => {
    AdminPoster.mockResolvedValue({
      ok: false,
      json: async () => ({ error_message: "Payment failed" }),
    });
    renderDashboard(outstandingData);

    await screen.findByRole("heading", { name: "Dashboard" });
    fireEvent.click(screen.getByRole("button", { name: "Mark Paid" }));

    expect(await screen.findByText("Payment failed")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mark Paid" })).toBeEnabled();
  });

  test("prevents duplicate payment submissions", async () => {
    let resolvePayment;
    AdminPoster.mockReturnValue(new Promise((resolve) => {
      resolvePayment = resolve;
    }));
    renderDashboard(outstandingData);

    await screen.findByRole("heading", { name: "Dashboard" });
    const button = screen.getByRole("button", { name: "Mark Paid" });
    fireEvent.click(button);
    fireEvent.click(button);

    expect(AdminPoster).toHaveBeenCalledTimes(1);
    resolvePayment({ ok: true });
  });
});
